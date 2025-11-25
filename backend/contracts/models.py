from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator, MaxValueValidator
from django.db.models import Avg

User = get_user_model()


class Contract(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('active', 'Active'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    )
    
    proposal = models.OneToOneField(
        Proposal, 
        on_delete=models.CASCADE, 
        related_name='contract'
    )
    client_signed = models.BooleanField(default=False)
    freelancer_signed = models.BooleanField(default=False)
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')

    client_signed = models.BooleanField(default=False)
    freelancer_signed = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    job_application = models.ForeignKey(
        'jobs.JobApplication', 
        on_delete=models.CASCADE, 
        related_name='contracts', 
        null=True, 
        blank=True
    )
    
    def __str__(self):
        """Readable name for Django admin & debug output"""
        if self.job_application and hasattr(self.job_application, 'job'):
            return f"Contract for {self.job_application.job.title}"
        elif self.proposal and hasattr(self.proposal, 'project'):
            return f"Contract for {self.proposal.project.title}"
        return f"Contract #{self.id}"

    @property
    def is_fully_signed(self):
        """Returns True if both client and freelancer have signed."""
        return self.client_signed and self.freelancer_signed

    def activate_if_signed(self):
        """Automatically mark contract as active when both parties sign."""
        if self.is_fully_signed and self.status == 'pending':
            self.status = 'active'
            self.save()

    class Meta:
        ordering = ['-created_at']
        verbose_name = "Contract"
        verbose_name_plural = "Contracts"


# ============================================================
# REVIEW MODEL (Enhanced with External Reviews)
# ============================================================
class Review(models.Model):
    contract = models.ForeignKey(
        Contract, on_delete=models.CASCADE, related_name='reviews'
    )
    reviewer = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='reviews_given',
        null=True, blank=True   # TEMPORARILY allow NULL
    )
    reviewee = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='reviews_received',
        null=True, blank=True   # TEMPORARILY allow NULL
    )
    rating = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Review Response"
        verbose_name_plural = "Review Responses"

    def __str__(self):
        return f"Review by {self.reviewer} for {self.reviewee}"
