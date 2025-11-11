from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Proposal
from .serializers import ProposalSerializer
from projects.models import Project

class ProposalViewSet(viewsets.ModelViewSet):
    serializer_class = ProposalSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        
        if user.role == 'freelancer':
            queryset = Proposal.objects.filter(freelancer=user)
        elif user.role == 'client':
            queryset = Proposal.objects.filter(project__client=user)
        else:
            queryset = Proposal.objects.none()
        
        print(f"[Proposals] User: {user.email}, Role: {user.role}, Count: {queryset.count()}")
        
        return queryset.select_related(
            'project', 
            'freelancer', 
            'freelancer__freelancer_profile'
        ).prefetch_related(
            'freelancer__freelancer_profile__skills',
            'freelancer__freelancer_profile__portfolio_files'
        ).order_by('-created_at')

    def create(self, request, *args, **kwargs):
        project_id = request.data.get('project')
        try:
            project = Project.objects.get(id=project_id)
        except Project.DoesNotExist:
            return Response({'detail': 'Project not found.'}, status=status.HTTP_404_NOT_FOUND)
        
        # Check if project is still open
        if project.status != 'open':
            return Response(
                {'detail': 'This project is no longer accepting proposals.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if freelancer already submitted a proposal
        existing_proposal = Proposal.objects.filter(
            project=project,
            freelancer=request.user
        ).first()
        
        if existing_proposal:
            return Response(
                {'detail': 'You have already submitted a proposal for this project.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        proposal_data = {
            'project': project.id,
            'cover_letter': request.data.get('cover_letter'),
            'bid_amount': request.data.get('bid_amount'),
            'estimated_time': request.data.get('estimated_time'),
        }
        serializer = self.get_serializer(data=proposal_data)
        if serializer.is_valid():
            serializer.save(freelancer=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def accept(self, request, pk=None):
        proposal = self.get_object()
        if proposal.project.client != request.user:
            return Response({'detail': 'Not authorized.'}, status=status.HTTP_403_FORBIDDEN)
        
        # Reject all other pending proposals
        Proposal.objects.filter(
            project=proposal.project,
            status='pending'
        ).exclude(id=proposal.id).update(status='rejected')
        
        proposal.status = 'accepted'
        proposal.save()
        
        from contracts.models import Contract
        Contract.objects.get_or_create(
            proposal=proposal,
            defaults={
                'terms': 'Project terms as discussed',
                'payment_terms': 'Payment on completion'
            }
        )
        return Response({'detail': 'Proposal accepted. Contract created.'}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        proposal = self.get_object()
        if proposal.project.client != request.user:
            return Response({'detail': 'Not authorized.'}, status=status.HTTP_403_FORBIDDEN)
        proposal.status = 'rejected'
        proposal.save()
        return Response({'detail': 'Proposal rejected.'}, status=status.HTTP_200_OK)