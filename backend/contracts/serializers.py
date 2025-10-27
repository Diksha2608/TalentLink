# backend/contracts/serializers.py
from rest_framework import serializers
from .models import Contract, Review

class ContractSerializer(serializers.ModelSerializer):
    project_title = serializers.CharField(source='proposal.project.title', read_only=True)
    freelancer_name = serializers.CharField(source='proposal.freelancer.get_full_name', read_only=True)
    client_name = serializers.CharField(source='proposal.project.client.get_full_name', read_only=True)

    class Meta:
        model = Contract
        fields = [
            'id', 'proposal', 'project_title', 'client_name', 'freelancer_name',
            'client_signed', 'freelancer_signed', 'start_date', 'end_date',
            'status', 'terms', 'payment_terms', 'created_at'
        ]
        read_only_fields = ['created_at']

class ReviewSerializer(serializers.ModelSerializer):
    reviewer_name = serializers.CharField(source='reviewer.get_full_name', read_only=True)

    class Meta:
        model = Review
        fields = ['id', 'contract', 'reviewer', 'reviewer_name', 'rating', 'comment', 'created_at']
        read_only_fields = ['reviewer', 'created_at']
