# backend/jobs/serializers.py (FIXED VERSION)
from rest_framework import serializers
from .models import Job, JobAttachment

class JobAttachmentSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = JobAttachment
        fields = ('id', 'file_url', 'original_name', 'size', 'uploaded_at')

    def get_file_url(self, obj):
        request = self.context.get('request')
        if not obj or not getattr(obj, "file", None):
            return None
        url = obj.file.url
        return request.build_absolute_uri(url) if request else url


class JobSerializer(serializers.ModelSerializer):
    """
    Accept file uploads under 'attachments' key (max 2).
    This keeps semantics distinct from Project.
    """
    client_name = serializers.CharField(source='client.get_full_name', read_only=True)
    file_attachments = JobAttachmentSerializer(source='attachments', many=True, read_only=True)

    class Meta:
        model = Job
        fields = [
            'id', 'client', 'client_name',
            'title', 'description', 'job_type',
            'experience_level', 'location_type', 'location',
            'hourly_min', 'hourly_max', 'fixed_amount',
            'status', 'visibility', 'created_at', 'updated_at',
            'file_attachments',
        ]
        read_only_fields = ['client', 'created_at', 'updated_at', 'status']

    def validate(self, attrs):
        """Validate that appropriate fields are provided based on job_type"""
        job_type = attrs.get('job_type', 'hourly')
        
        if job_type == 'hourly':
            hourly_min = attrs.get('hourly_min')
            hourly_max = attrs.get('hourly_max')
            if not hourly_min or not hourly_max:
                raise serializers.ValidationError({
                    'hourly_rate': 'Both minimum and maximum hourly rates are required for hourly jobs'
                })
            if hourly_min >= hourly_max:
                raise serializers.ValidationError({
                    'hourly_rate': 'Maximum hourly rate must be greater than minimum'
                })
        elif job_type == 'fixed':
            fixed_amount = attrs.get('fixed_amount')
            if not fixed_amount or fixed_amount <= 0:
                raise serializers.ValidationError({
                    'fixed_amount': 'A valid fixed amount is required for fixed price jobs'
                })
        
        return attrs

def create(self, validated_data):
    request = self.context.get('request')

    job = Job.objects.create(
        **validated_data
    )

    files = request.FILES.getlist('attachments') if request else []
    for f in files[:2]:  # Max 2 files
        JobAttachment.objects.create(
            job=job,
            file=f,
            original_name=getattr(f, 'name', ''),
            size=getattr(f, 'size', 0)
        )
    
    return job

def update(self, instance, validated_data):
    request = self.context.get('request')

    for k, v in validated_data.items():
        setattr(instance, k, v)
    instance.save()

    # Handle new file attachments
    files = request.FILES.getlist('attachments') if request else []
    for f in files[:2]:  # Max 2 files per request
        JobAttachment.objects.create(
            job=instance,
            file=f,
            original_name=getattr(f, 'name', ''),
            size=getattr(f, 'size', 0)
        )
        
    return instance