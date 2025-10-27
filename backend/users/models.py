from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import MinValueValidator, MaxValueValidator

class User(AbstractUser):
    ROLE_CHOICES = (
        ('client', 'Client'),
        ('freelancer', 'Freelancer'),
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='freelancer')
    email = models.EmailField(unique=True)
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    bio = models.TextField(blank=True)
    location = models.CharField(max_length=100, blank=True)
    rating_avg = models.FloatField(default=0.0, validators=[MinValueValidator(0), MaxValueValidator(5)])
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.get_full_name()} ({self.role})"


class Skill(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(unique=True)

    def __str__(self):
        return self.name


class FreelancerProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='freelancer_profile')
    hourly_rate = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    skills = models.ManyToManyField('Skill', blank=True)
    availability = models.CharField(
        max_length=50,
        choices=[('full-time', 'Full-time'), ('part-time', 'Part-time'), ('contract', 'Contract')],
        default='part-time'
    )
    resume_file = models.FileField(upload_to='resumes/', null=True, blank=True)
    portfolio = models.TextField(blank=True, help_text="Portfolio description or URLs")
    intro_video_url = models.URLField(blank=True)
    social_links = models.JSONField(default=dict, blank=True)
    total_earnings = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    projects_completed = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.get_full_name()} - Freelancer"