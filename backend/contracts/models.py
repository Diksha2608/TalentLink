from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator, MaxValueValidator
from proposals.models import Proposal

User = get_user_model()

class Contract(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('active', 'Active'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    )
    
    proposal = models.OneToOneField(Proposal, on_delete=models.CASCADE, related_name='contract')
    client_signed = models.BooleanField(default=False)
    freelancer_signed = models.BooleanField(default=False)
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    terms = models.TextField()
    payment_terms = models.CharField(max_length=200)
    created_at = models.DateTimeField(auto_now_add=True)
    job_application = models.ForeignKey('jobs.JobApplication', on_delete=models.CASCADE, related_name='contracts', null=True, blank=True)
    
    def __str__(self):
        return f"Contract for {self.proposal.project.title}"


class Review(models.Model):
    contract = models.ForeignKey(Contract, on_delete=models.CASCADE, related_name='reviews')
    reviewer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviews_given')
    reviewee = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviews_received')
    rating = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    

    class Meta:
        unique_together = ('contract', 'reviewer')

    def __str__(self):
        return f"Review by {self.reviewer} for {self.reviewee}"