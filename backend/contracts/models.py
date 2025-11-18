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
# REVIEW MODEL (Enhanced with External Reviews)
# ============================================================
class Review(models.Model):
    REVIEW_TYPE_CHOICES = (
        ('platform', 'Platform Review'),  # Review from completed contract
        ('external', 'External Review'),   # Review from outside platform
    )

    # For platform reviews
    contract = models.ForeignKey(
        Contract,
        on_delete=models.CASCADE,
        related_name='reviews',
        null=True,
        blank=True,
        help_text="Linked contract (for platform reviews)"
    )

    # Universal fields
    reviewer = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='reviews_given',
        null=True,
        blank=True,
        help_text="Reviewer (if registered user)"
    )
    
    reviewee = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='reviews_received',
        help_text="Person being reviewed"
    )

    # For external reviews (when reviewer is not a platform user)
    reviewer_name = models.CharField(
        max_length=200,
        blank=True,
        help_text="Name of external reviewer"
    )
    reviewer_email = models.EmailField(
        blank=True,
        help_text="Email of external reviewer (for verification)"
    )
    reviewer_company = models.CharField(
        max_length=200,
        blank=True,
        help_text="Company/Organization of external reviewer"
    )

    # Review details
    review_type = models.CharField(
        max_length=20,
        choices=REVIEW_TYPE_CHOICES,
        default='platform'
    )
    rating = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        help_text="Rating from 1 to 5 stars"
    )
    comment = models.TextField(blank=True)
    
    # Work details (for external reviews)
    project_title = models.CharField(
        max_length=300,
        blank=True,
        help_text="Title of project worked on"
    )
    work_period = models.CharField(
        max_length=100,
        blank=True,
        help_text="e.g., 'Jan 2024 - Mar 2024'"
    )

    # Verification
    is_verified = models.BooleanField(
        default=False,
        help_text="Admin verified this review is legitimate"
    )
    verification_token = models.CharField(
        max_length=100,
        blank=True,
        help_text="Token sent to reviewer email for verification"
    )
    verified_at = models.DateTimeField(null=True, blank=True)

    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = "Review"
        verbose_name_plural = "Reviews"
        indexes = [
            models.Index(fields=['reviewee', '-created_at']),
            models.Index(fields=['review_type', 'is_verified']),
        ]

    def __str__(self):
        reviewer_name = self.reviewer.get_full_name() if self.reviewer else self.reviewer_name
        reviewee_name = self.reviewee.get_full_name() or self.reviewee.username
        return f"Review by {reviewer_name} for {reviewee_name} ({self.rating}★)"

    def save(self, *args, **kwargs):
        # Auto-verify platform reviews
        if self.review_type == 'platform':
            self.is_verified = True
        
        super().save(*args, **kwargs)
        
        # Update reviewee's average rating
        self.update_reviewee_rating()

    def update_reviewee_rating(self):
        """Update the reviewee's average rating"""
        if self.reviewee:
            verified_reviews = Review.objects.filter(
                reviewee=self.reviewee,
                is_verified=True
            )
            avg_rating = verified_reviews.aggregate(Avg('rating'))['rating__avg'] or 0
            self.reviewee.rating_avg = round(avg_rating, 2)
            self.reviewee.save(update_fields=['rating_avg'])


# ============================================================
# REVIEW RESPONSE MODEL
# ============================================================
class ReviewResponse(models.Model):
    """Allow users to respond to reviews they received"""
    review = models.OneToOneField(
        Review,
        on_delete=models.CASCADE,
        related_name='response'
    )
    response_text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Review Response"
        verbose_name_plural = "Review Responses"

    def __str__(self):
        return f"Response to review #{self.review.id}"