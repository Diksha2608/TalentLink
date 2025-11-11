# backend/talentlink/urls.py
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny

# Password reset views (from django_rest_passwordreset)
from django_rest_passwordreset.views import (
    ResetPasswordRequestToken,
    ResetPasswordConfirm,
    ResetPasswordValidateToken,
)

# Import your app viewsets
from users.views import (
    UserViewSet,
    FreelancerProfileViewSet,
    SkillViewSet,
    EmailTokenObtainPairView,
)
from projects.views import ProjectViewSet
from proposals.views import ProposalViewSet
from contracts.views import ContractViewSet, ReviewViewSet
from messaging.views import MessageViewSet
from users.views import ClientProfileViewSet  
from notifications.views import NotificationViewSet
from jobs.views import JobViewSet, JobApplicationViewSet 


# ✅ API Root
def api_root(request):
    return JsonResponse({
        "message": "Welcome to TalentLink API 🚀",
        "version": "1.0",
        "endpoints": {
            "admin": "/admin/",
            "api": "/api/",
            "token": "/api/token/",
            "token_refresh": "/api/token/refresh/",
            "register": "/api/users/register/",
            "password_reset": "/api/password_reset/",
        },
    })


# ✅ DRF Routers
router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'profiles/freelancer', FreelancerProfileViewSet, basename='freelancer-profile')
router.register(r'profiles/client', ClientProfileViewSet, basename='client-profile')
router.register(r'skills', SkillViewSet, basename='skill')
router.register(r'projects', ProjectViewSet, basename='project')
router.register(r'proposals', ProposalViewSet, basename='proposal')
router.register(r'contracts', ContractViewSet, basename='contract')
router.register(r'reviews', ReviewViewSet, basename='review')
router.register(r'messages', MessageViewSet, basename='message')
router.register(r'notifications', NotificationViewSet, basename='notification')
router.register(r'job-applications', JobApplicationViewSet, basename='job-application') 
router.register(r'jobs', JobViewSet, basename='job')


# ✅ Password Reset Views (public)
@api_view(['POST'])
@permission_classes([AllowAny])
def password_reset_request(request):
    return ResetPasswordRequestToken.as_view()(request._request)

@api_view(['POST'])
@permission_classes([AllowAny])
def password_reset_validate_token(request):
    return ResetPasswordValidateToken.as_view()(request._request)

@api_view(['POST'])
@permission_classes([AllowAny])
def password_reset_confirm(request):
    return ResetPasswordConfirm.as_view()(request._request)


# ✅ Main URLs
urlpatterns = [
    path('', api_root, name='api-root'),
    path('admin/', admin.site.urls),

    # Core API routes
    path('api/', include(router.urls)),

    # JWT Authentication
    path('api/token/', EmailTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # ✅ Password Reset (no auth required)
# backend/urls.py
    path("api/password_reset/", include("django_rest_passwordreset.urls", namespace="password_reset")),
    path('api/password_reset/validate_token/', password_reset_validate_token, name='password_reset_validate_token'),
    path('api/password_reset/confirm/', password_reset_confirm, name='password_reset_confirm'),
]


# ✅ Serve static & media in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
