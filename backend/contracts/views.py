from django.db.models import Q
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Contract, Review
from .serializers import ContractSerializer, ReviewSerializer
from notifications.models import Notification


class ContractViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing Contracts between clients and freelancers.
    Supports signing, activating, and completing contracts.
    """
    serializer_class = ContractSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = Contract.objects.filter(
            Q(client=user) | Q(freelancer=user)
        ).select_related(
            'proposal', 'proposal__project',
            'job_application', 'job_application__job',
            'client', 'freelancer'
        ).order_by('-created_at')

        print(f"[Contracts] User: {user.email}, Count: {queryset.count()}")
        return queryset

    # ============================================================
    # SIGN CONTRACT
    # ============================================================
    @action(detail=True, methods=['post'])
    def sign(self, request, pk=None):
        """
        Allow client or freelancer to sign a contract.
        Automatically activates once both sign.
        """
        contract = self.get_object()
        user = request.user

        # Determine if user is client or freelancer
        if user == contract.client:
            if contract.client_signed:
                return Response({'detail': 'Client already signed.'}, status=status.HTTP_400_BAD_REQUEST)
            contract.client_signed = True
            signer_role = 'Client'
        elif user == contract.freelancer:
            if contract.freelancer_signed:
                return Response({'detail': 'Freelancer already signed.'}, status=status.HTTP_400_BAD_REQUEST)
            contract.freelancer_signed = True
            signer_role = 'Freelancer'
        else:
            return Response({'detail': 'You are not authorized to sign this contract.'},
                            status=status.HTTP_403_FORBIDDEN)

        contract.save()
        contract.activate_if_signed()

        # Notify other party
        other_party = contract.freelancer if user == contract.client else contract.client
        Notification.objects.create(
            user=other_party,
            type='CONTRACT',
            title='Contract Signed',
            message=f'{signer_role} has signed the contract for "{contract}".',
            metadata={'contract_id': contract.id}
        )

        if contract.status == 'active':
            Notification.objects.create(
                user=contract.client,
                type='CONTRACT',
                title='Contract Active',
                message=f'Contract "{contract}" is now active!'
            )
            Notification.objects.create(
                user=contract.freelancer,
                type='CONTRACT',
                title='Contract Active',
                message=f'Contract "{contract}" is now active! You can start working.'
            )

        return Response({
            'detail': f'{signer_role} signed successfully.',
            'contract': ContractSerializer(contract).data
        }, status=status.HTTP_200_OK)

    # ============================================================
    # COMPLETE CONTRACT
    # ============================================================
    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """
        Client marks the contract as completed.
        Automatically updates related project/job.
        """
        contract = self.get_object()
        user = request.user

        if user != contract.client:
            return Response({'detail': 'Only the client can complete the contract.'},
                            status=status.HTTP_403_FORBIDDEN)

        if contract.status == 'completed':
            return Response({'detail': 'Contract already completed.'},
                            status=status.HTTP_400_BAD_REQUEST)

        contract.status = 'completed'
        contract.save()

        # Update related entities
        if contract.proposal and contract.proposal.project:
            project = contract.proposal.project
            project.status = 'completed'
            project.save()
        elif contract.job_application and contract.job_application.job:
            job = contract.job_application.job
            job.status = 'completed'
            job.save()

        # Notify freelancer
        Notification.objects.create(
            user=contract.freelancer,
            type='CONTRACT',
            title='Contract Completed',
            message=f'The contract "{contract}" has been marked as completed by the client.',
            metadata={'contract_id': contract.id}
        )

        return Response({'detail': 'Contract marked as completed successfully.'},
                        status=status.HTTP_200_OK)


# ============================================================
# REVIEW VIEWSET
# ============================================================
class ReviewViewSet(viewsets.ModelViewSet):
    """
    Handles creation and viewing of reviews between clients and freelancers.
    """
    serializer_class = ReviewSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Review.objects.filter(Q(reviewer=user) | Q(reviewee=user)).select_related('contract')

    def create(self, request, *args, **kwargs):
        """
        Create a review for a completed contract.
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        contract = serializer.validated_data['contract']
        reviewer = request.user

        if contract.status != 'completed':
            return Response({'detail': 'You can only review completed contracts.'},
                            status=status.HTTP_400_BAD_REQUEST)

        # Determine who is being reviewed
        if reviewer == contract.client:
            reviewee = contract.freelancer
        elif reviewer == contract.freelancer:
            reviewee = contract.client
        else:
            return Response({'detail': 'You are not part of this contract.'},
                            status=status.HTTP_403_FORBIDDEN)

        # Prevent duplicate reviews
        if Review.objects.filter(contract=contract, reviewer=reviewer).exists():
            return Response({'detail': 'You have already reviewed this contract.'},
                            status=status.HTTP_400_BAD_REQUEST)

        review = serializer.save(reviewer=reviewer, reviewee=reviewee)

        # Send notification
        Notification.objects.create(
            user=reviewee,
            type='REVIEW',
            title='New Review Received',
            message=f'You received a {review.rating}-star review from {reviewer.get_full_name() or reviewer.username}.',
            metadata={'contract_id': contract.id, 'review_id': review.id}
        )

        return Response(ReviewSerializer(review).data, status=status.HTTP_201_CREATED)
