# backend/projects/admin.py
from django.contrib import admin
from .models import Project

@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ['title', 'client', 'status', 'budget_min', 'budget_max', 'created_at']
    list_filter = ['status', 'duration_estimate', 'created_at']
    search_fields = ['title', 'description', 'client__email']
    filter_horizontal = ['skills_required']
    readonly_fields = ['created_at', 'updated_at']