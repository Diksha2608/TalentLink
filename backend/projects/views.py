from django.shortcuts import render

# backend/projects/views.py
from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from .models import Project
from .serializers import ProjectSerializer
from talentlink.permissions import IsClient

class ProjectViewSet(viewsets.ModelViewSet):
    serializer_class = ProjectSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'duration_estimate']
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'budget_max']

    def get_queryset(self):
        return Project.objects.filter(visibility='public')

    def get_permissions(self):
        if self.action in ['create', 'update', 'destroy']:
            return [IsClient()]
        return super().get_permissions()

    def perform_create(self, serializer):
        serializer.save(client=self.request.user, status='open')

    @action(detail=True, methods=['get'])
    def proposals(self, request, pk=None):
        project = self.get_object()
        proposals = project.proposals.all()
        from proposals.serializers import ProposalSerializer
        serializer = ProposalSerializer(proposals, many=True)
        return Response(serializer.data)