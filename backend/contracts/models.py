from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator, MaxValueValidator

User = get_user_model()


class Contract(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('active', 'Active'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    )

    # ============================================================
    # RELATIONSHIPS
    # ============================================================
    proposal = models.OneToOneField(
        'proposals.Proposal',
        on_delete=models.CASCADE,
        related_name='contract',
        null=True,
        blank=True,
        help_text="Linked proposal (if created from a project proposal)."
    )

    job_application = models.OneToOneField(
        'jobs.JobApplication',
        on_delete=models.CASCADE,
        related_name='contract',
        null=True,
        blank=True,
        help_text="Linked job application (if created from a job post)."
    )

    client = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='contracts_as_client',
        null=True,
        blank=True,
        help_text="Client who created the job/project."
    )

    freelancer = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='contracts_as_freelancer',
        null=True,
        blank=True,
        help_text="Freelancer hired for this contract."
    )

    # ============================================================
    # CONTRACT DETAILS
    # ============================================================
    terms = models.TextField(
        blank=True,
        help_text="Full agreement or scope of work terms."
    )
    payment_terms = models.TextField(
        blank=True,
        help_text="Payment terms or milestones."
    )
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')

    client_signed = models.BooleanField(default=False)
    freelancer_signed = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # ============================================================
    # PROPERTIES
    # ============================================================
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
# REVIEW MODEL
# ============================================================
class Review(models.Model):
    contract = models.ForeignKey(
        Contract,
        on_delete=models.CASCADE,
        related_name='reviews'
    )
    reviewer = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='reviews_given'
    )
    reviewee = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='reviews_received'
    )
    rating = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('contract', 'reviewer')
        ordering = ['-created_at']
        verbose_name = "Review"
        verbose_name_plural = "Reviews"

    def __str__(self):
        return (
            f"Review by {self.reviewer.get_full_name() or self.reviewer.username} "
            f"for {self.reviewee.get_full_name() or self.reviewee.username}"
        )
