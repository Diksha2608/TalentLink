
# backend/contracts/views.py
from django.shortcuts import render
from django.db import models 
from rest_framework import viewsets, status

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Contract, Review
from .serializers import ContractSerializer, ReviewSerializer

class ContractViewSet(viewsets.ModelViewSet):
    serializer_class = ContractSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Contract.objects.filter(
            models.Q(proposal__project__client=user) | models.Q(proposal__freelancer=user)
        )

    @action(detail=True, methods=['post'])
    def sign(self, request, pk=None):
        contract = self.get_object()
        if contract.proposal.project.client == request.user:
            contract.client_signed = True
        elif contract.proposal.freelancer == request.user:
            contract.freelancer_signed = True
        else:
            return Response({'detail': 'Not authorized.'}, status=status.HTTP_403_FORBIDDEN)
        
        if contract.client_signed and contract.freelancer_signed:
            contract.status = 'active'
        contract.save()
        return Response(ContractSerializer(contract).data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        contract = self.get_object()
        contract.status = 'completed'
        contract.save()
        return Response({'detail': 'Contract marked as completed.'}, status=status.HTTP_200_OK)

class ReviewViewSet(viewsets.ModelViewSet):
    serializer_class = ReviewSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Review.objects.filter(
            models.Q(reviewer=self.request.user) | models.Q(reviewee=self.request.user)
        )

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save(reviewer=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
