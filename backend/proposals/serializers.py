# backend/proposals/serializers.py
from rest_framework import serializers
from .models import Proposal

class ProposalSerializer(serializers.ModelSerializer):
    freelancer_name = serializers.CharField(source='freelancer.get_full_name', read_only=True)
    project_title = serializers.CharField(source='project.title', read_only=True)
    project_id = serializers.IntegerField(source='project.id', read_only=True)
    client_name = serializers.SerializerMethodField()
    
    freelancer = serializers.SerializerMethodField()
    freelancer_id = serializers.IntegerField(source='freelancer.id', read_only=True)

    class Meta:
        model = Proposal
        fields = [
            'id', 'project', 'project_id', 'project_title', 
            'freelancer', 'freelancer_id', 'freelancer_name', 'client_name', 
            'cover_letter', 'bid_amount', 'estimated_time', 
            'attachments', 'status', 'created_at', 'updated_at'
        ]
        read_only_fields = ['freelancer', 'created_at', 'updated_at']

    def get_client_name(self, obj):
        try:
            return obj.project.client.get_full_name() if obj.project and obj.project.client else 'Unknown'
        except:
            return 'Unknown'
    
    def get_freelancer(self, obj):
        """Get freelancer details for proposal cards"""
        if not obj.freelancer:
            return None
        
        user = obj.freelancer
        return {
            'id': user.id,
            'name': user.get_full_name(),
            'avatar': user.avatar.url if user.avatar else None,
            'title': getattr(user.freelancer_profile, 'role_title', None) if hasattr(user, 'freelancer_profile') else None,
            'location': user.location,
            'rating_avg': user.rating_avg,
            'projects_completed': getattr(user.freelancer_profile, 'projects_completed', 0) if hasattr(user, 'freelancer_profile') else 0,
        }