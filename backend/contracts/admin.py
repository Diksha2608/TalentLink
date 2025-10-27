# backend/contracts/admin.py
from django.contrib import admin
from .models import Contract, Review

@admin.register(Contract)
class ContractAdmin(admin.ModelAdmin):
    list_display = ['get_project_title', 'get_client', 'get_freelancer', 'status', 'client_signed', 'freelancer_signed']
    list_filter = ['status', 'client_signed', 'freelancer_signed', 'created_at']
    search_fields = ['proposal__project__title']
    readonly_fields = ['created_at']
    
    def get_project_title(self, obj):
        return obj.proposal.project.title
    get_project_title.short_description = 'Project'
    
    def get_client(self, obj):
        return obj.proposal.project.client
    get_client.short_description = 'Client'
    
    def get_freelancer(self, obj):
        return obj.proposal.freelancer
    get_freelancer.short_description = 'Freelancer'

@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ['contract', 'reviewer', 'reviewee', 'rating', 'created_at']
    list_filter = ['rating', 'created_at']
    search_fields = ['comment', 'reviewer__email', 'reviewee__email']
    readonly_fields = ['created_at']