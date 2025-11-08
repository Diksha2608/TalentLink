# backend/jobs/models.py (FIXED VERSION)
from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator

User = get_user_model()

class Job(models.Model):
    """
    Separate model for hourly/contract jobs (different from fixed-price projects)
    """
    JOB_TYPE_CHOICES = (
        ('hourly', 'Hourly'),
        ('fixed', 'Fixed Price'),
    )

    EXPERIENCE_LEVEL_CHOICES = (
        ('entry', 'Entry Level'),
        ('intermediate', 'Intermediate'),
        ('expert', 'Expert'),
    )

    LOCATION_TYPE_CHOICES = (
        ('remote', 'Remote'),
        ('hybrid', 'Hybrid'),
        ('onsite', 'Onsite'),
    )

    STATUS_CHOICES = (
        ('draft', 'Draft'),
        ('open', 'Open'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    )

    client = models.ForeignKey(User, on_delete=models.CASCADE, related_name='jobs_posted')
    title = models.CharField(max_length=200)
    description = models.TextField()
    
    job_type = models.CharField(max_length=10, choices=JOB_TYPE_CHOICES, default='hourly')
    experience_level = models.CharField(max_length=20, choices=EXPERIENCE_LEVEL_CHOICES, default='intermediate')
    location_type = models.CharField(max_length=20, choices=LOCATION_TYPE_CHOICES, default='remote')
    location = models.CharField(max_length=200, blank=True, null=True)
    
    # For hourly jobs
    hourly_min = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, validators=[MinValueValidator(0)])
    hourly_max = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, validators=[MinValueValidator(0)])
    
    # For fixed price jobs
    fixed_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, validators=[MinValueValidator(0)])
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='open')
    visibility = models.CharField(max_length=20, choices=[('public', 'Public'), ('private', 'Private')], default='public')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title


class JobAttachment(models.Model):
    job = models.ForeignKey(Job, related_name='attachments', on_delete=models.CASCADE)
    file = models.FileField(upload_to='job_attachments/%Y/%m/%d/')
    original_name = models.CharField(max_length=255, blank=True)
    size = models.PositiveIntegerField(default=0)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.job_id} - {self.original_name}"