
from django.contrib import admin
from .models import Project


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = [
        'title', 'client', 'status', 'duration', 'hours_per_week', 'job_type',
        'fixed_payment', 'hourly_min', 'hourly_max', 'budget_min', 'budget_max', 'created_at'
    ]
    list_filter = ['status', 'duration', 'hours_per_week', 'job_type', 'created_at']
    search_fields = ['title', 'description', 'client__email']
    filter_horizontal = ['skills_required']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('client', 'title', 'description', 'skills_required')
        }),
        ('Budget', {
            'fields': ('budget_min', 'budget_max')
        }),
        ('Project Details', {
            'fields': ('duration', 'hours_per_week', 'job_type')
        }),
        ('Payment Details', {
            'fields': ('fixed_payment', 'hourly_min', 'hourly_max')
        }),
        ('Status & Visibility', {
            'fields': ('status', 'visibility', 'attachments')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


