from django.shortcuts import render

# backend/proposals/views.py
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
        if self.request.user.role == 'freelancer':
            return Proposal.objects.filter(freelancer=self.request.user)
        elif self.request.user.role == 'client':
            return Proposal.objects.filter(project__client=self.request.user)
        return Proposal.objects.none()

    def create(self, request, *args, **kwargs):
        project_id = request.data.get('project')
        try:
            project = Project.objects.get(id=project_id)
        except Project.DoesNotExist:
            return Response({'detail': 'Project not found.'}, status=status.HTTP_404_NOT_FOUND)
        
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
        proposal.status = 'accepted'
        proposal.save()
        from contracts.models import Contract
        Contract.objects.create(
            proposal=proposal,
            terms='Project terms',
            payment_terms='On completion'
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
