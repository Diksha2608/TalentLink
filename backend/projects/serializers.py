from rest_framework import serializers
from .models import Project
from users.models import Skill
from users.serializers import SkillSerializer


class ProjectSerializer(serializers.ModelSerializer):
    client_name = serializers.CharField(source='client.get_full_name', read_only=True)
    skills_required = SkillSerializer(many=True, read_only=True)
    skill_ids = serializers.PrimaryKeyRelatedField(
        queryset=Skill.objects.all(),
        write_only=True,
        many=True,
        source='skills_required',
        required=False
    )
    proposal_count = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = [
            'id', 'client', 'client_name', 'title', 'description', 'skills_required',
            'skill_ids', 'budget_min', 'budget_max', 
            'duration', 'hours_per_week', 'job_type', 
            'fixed_payment', 'hourly_min', 'hourly_max',
            'status', 'visibility', 'attachments', 
            'proposal_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['client', 'created_at', 'updated_at', 'status', 'proposal_count']

    def get_proposal_count(self, obj):
        return obj.proposals.count()
