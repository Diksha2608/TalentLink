
# backend/jobs/admin.py
from django.contrib import admin
from .models import Job, JobAttachment

@admin.register(Job)
class JobAdmin(admin.ModelAdmin):
    list_display = ('title', 'client', 'job_type', 'status', 'created_at')
    list_filter = ('job_type', 'status', 'experience_level', 'location_type')
    search_fields = ('title', 'description')
    date_hierarchy = 'created_at'

@admin.register(JobAttachment)
class JobAttachmentAdmin(admin.ModelAdmin):
    list_display = ('job', 'original_name', 'size', 'uploaded_at')
    date_hierarchy = 'uploaded_at'