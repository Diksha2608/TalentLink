from django.dispatch import receiver
from django_rest_passwordreset.signals import reset_password_token_created
from django.core.mail import send_mail
from django.conf import settings

@receiver(reset_password_token_created)
def password_reset_token_created(sender, instance, reset_password_token, *args, **kwargs):
    # Build the frontend link
    frontend_url = f"{settings.FRONTEND_URL}/reset-password/{reset_password_token.key}"
    
    subject = "Password Reset for Your Account"
    message = f"Click the link below to reset your password:\n\n{frontend_url}\n\nIf you didn’t request this, please ignore this email."
    
    send_mail(
        subject,
        message,
        settings.DEFAULT_FROM_EMAIL,
        [reset_password_token.user.email],
        fail_silently=False,
    )
