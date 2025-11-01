# backend/proposals/serializers.py
from rest_framework import serializers
from .models import Proposal

class ProposalSerializer(serializers.ModelSerializer):
    freelancer_name = serializers.CharField(source='freelancer.get_full_name', read_only=True)
    project_title = serializers.CharField(source='project.title', read_only=True)
    project_id = serializers.IntegerField(source='project.id', read_only=True)
    client_name = serializers.SerializerMethodField()

    class Meta:
        model = Proposal
        fields = [
            'id', 'project', 'project_id', 'project_title', 
            'freelancer', 'freelancer_name', 'client_name',
            'cover_letter', 'bid_amount', 'estimated_time', 
            'attachments', 'status', 'created_at', 'updated_at'
        ]
        read_only_fields = ['freelancer', 'created_at', 'updated_at']

    def get_client_name(self, obj):
        """Get the client's full name from the project"""
        try:
            return obj.project.client.get_full_name() if obj.project and obj.project.client else 'Unknown'
        except:
            return 'Unknown'