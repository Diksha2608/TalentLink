from django.db import models
from django.conf import settings

class Notification(models.Model):
    TYPE_MESSAGE = 'message'
    TYPE_PROPOSAL = 'proposal'
    TYPE_CONTRACT = 'contract'
    TYPE_SYSTEM = 'system'

    TYPE_CHOICES = (
        (TYPE_MESSAGE, 'Message'),
        (TYPE_PROPOSAL, 'Proposal'),
        (TYPE_CONTRACT, 'Contract'),
        (TYPE_SYSTEM, 'System'),
    )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name='notifications',
        on_delete=models.CASCADE
    )
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    title = models.CharField(max_length=255, blank=True)
    message = models.TextField(blank=True)
    metadata = models.JSONField(blank=True, null=True)
    is_read = models.BooleanField(default=False)
    read_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.user} - {self.type} - {self.title or ""}'
