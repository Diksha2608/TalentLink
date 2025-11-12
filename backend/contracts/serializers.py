from rest_framework import serializers
from .models import Contract, Review


class ContractSerializer(serializers.ModelSerializer):
    # ============================================================
    # DYNAMIC READ-ONLY FIELDS (job + proposal support)
    # ============================================================
    job_title = serializers.SerializerMethodField()
    project_title = serializers.SerializerMethodField()
    client_name = serializers.SerializerMethodField()
    freelancer_name = serializers.SerializerMethodField()

    class Meta:
        model = Contract
        fields = [
            'id',
            'proposal',
            'job_application',
            'job_title',
            'project_title',
            'client_name',
            'freelancer_name',
            'client_signed',
            'freelancer_signed',
            'start_date',
            'end_date',
            'status',
            'terms',
            'payment_terms',
            'created_at'
        ]
        read_only_fields = ['created_at']

    # ============================================================
    # DYNAMIC FIELD RESOLVERS
    # ============================================================
    def get_job_title(self, obj):
        """Return job title if contract is from a job application"""
        if obj.job_application and obj.job_application.job:
            return obj.job_application.job.title
        return None

    def get_project_title(self, obj):
        """Return project title if contract is from a proposal"""
        if obj.proposal and obj.proposal.project:
            return obj.proposal.project.title
        return None

    def get_client_name(self, obj):
        """Return client name for both job or project contracts"""
        try:
            if obj.client:
                return obj.client.get_full_name() or obj.client.username
        except Exception:
            pass
        return None

    def get_freelancer_name(self, obj):
        """Return freelancer name for both job or project contracts"""
        try:
            if obj.freelancer:
                return obj.freelancer.get_full_name() or obj.freelancer.username
        except Exception:
            pass
        return None


# ============================================================
# REVIEW SERIALIZER
# ============================================================
class ReviewSerializer(serializers.ModelSerializer):
    reviewer_name = serializers.CharField(source='reviewer.get_full_name', read_only=True)
    reviewee_name = serializers.CharField(source='reviewee.get_full_name', read_only=True)
    contract_title = serializers.SerializerMethodField()

    class Meta:
        model = Review
        fields = [
            'id',
            'contract',
            'contract_title',
            'reviewer',
            'reviewer_name',
            'reviewee_name',
            'rating',
            'comment',
            'created_at'
        ]
        read_only_fields = ['reviewer', 'created_at']

    def get_contract_title(self, obj):
        """Show human-friendly title for review list"""
        if obj.contract.job_application and obj.contract.job_application.job:
            return obj.contract.job_application.job.title
        elif obj.contract.proposal and obj.contract.proposal.project:
            return obj.contract.proposal.project.title
        return f"Contract #{obj.contract.id}"
