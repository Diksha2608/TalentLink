# backend/jobs/serializers.py
from rest_framework import serializers
from .models import Job, JobAttachment
from .models import JobApplication, JobApplicationAttachment


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
        job_type = attrs.get('job_type', getattr(self.instance, 'job_type', 'hourly'))

        if job_type == 'hourly':
            hourly_min = attrs.get('hourly_min', getattr(self.instance, 'hourly_min', None))
            hourly_max = attrs.get('hourly_max', getattr(self.instance, 'hourly_max', None))
            if not hourly_min or not hourly_max:
                raise serializers.ValidationError({
                    'hourly_rate': 'Both minimum and maximum hourly rates are required for hourly jobs'
                })
            if hourly_min >= hourly_max:
                raise serializers.ValidationError({
                    'hourly_rate': 'Maximum hourly rate must be greater than minimum'
                })
        elif job_type == 'fixed':
            fixed_amount = attrs.get('fixed_amount', getattr(self.instance, 'fixed_amount', None))
            if not fixed_amount or fixed_amount <= 0:
                raise serializers.ValidationError({
                    'fixed_amount': 'A valid fixed amount is required for fixed price jobs'
                })

        return attrs

    def create(self, validated_data):
        request = self.context.get('request')

        job = Job.objects.create(**validated_data)

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

        files = request.FILES.getlist('attachments') if request else []
        for f in files[:2]:  
            JobAttachment.objects.create(
                job=instance,
                file=f,
                original_name=getattr(f, 'name', ''),
                size=getattr(f, 'size', 0)
            )

        return instance


class JobApplicationAttachmentSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = JobApplicationAttachment
        fields = ('id', 'file_url', 'original_name', 'size', 'uploaded_at')

    def get_file_url(self, obj):
        request = self.context.get('request')
        if not obj or not getattr(obj, "file", None):
            return None
        url = obj.file.url
        return request.build_absolute_uri(url) if request else url


class JobApplicationSerializer(serializers.ModelSerializer):
    freelancer_name = serializers.CharField(source='freelancer.get_full_name', read_only=True)
    job_title = serializers.CharField(source='job.title', read_only=True)
    job_id = serializers.IntegerField(source='job.id', read_only=True)
    client_name = serializers.SerializerMethodField()

    freelancer = serializers.SerializerMethodField()
    freelancer_id = serializers.IntegerField(source='freelancer.id', read_only=True)
    file_attachments = JobApplicationAttachmentSerializer(source='attachments', many=True, read_only=True)

    class Meta:
        model = JobApplication
        fields = [
            'id', 'job', 'job_id', 'job_title',
            'freelancer', 'freelancer_id', 'freelancer_name', 'client_name',
            'cover_letter', 'bid_amount', 'estimated_time',
            'status', 'created_at', 'updated_at', 'file_attachments'
        ]
        read_only_fields = ['freelancer', 'created_at', 'updated_at']

    def get_client_name(self, obj):
        try:
            return obj.job.client.get_full_name() if obj.job and obj.job.client else 'Unknown'
        except Exception:
            return 'Unknown'

    def get_freelancer(self, obj):
        """Get freelancer details for application cards"""
        if not obj.freelancer:
            return None

        user = obj.freelancer
        return {
            'id': user.id,
            'name': user.get_full_name(),
            'avatar': user.avatar.url if getattr(user, 'avatar', None) else None,
            'title': getattr(getattr(user, 'freelancer_profile', None), 'role_title', None),
            'location': getattr(user, 'location', None),
            'rating_avg': getattr(user, 'rating_avg', None),
            'projects_completed': getattr(getattr(user, 'freelancer_profile', None), 'projects_completed', 0),
        }
