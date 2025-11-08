from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

from users.views import UserViewSet, FreelancerProfileViewSet, SkillViewSet, EmailTokenObtainPairView
from projects.views import ProjectViewSet
from proposals.views import ProposalViewSet
from contracts.views import ContractViewSet, ReviewViewSet
from messaging.views import MessageViewSet
from users.views import ClientProfileViewSet  
from notifications.views import NotificationViewSet

def api_root(request):
    return JsonResponse({
        'message': 'Welcome to TalentLink API',
        'version': '1.0',
        'endpoints': {
            'admin': '/admin/',
            'api': '/api/',
            'token': '/api/token/',
            'token_refresh': '/api/token/refresh/',
            'register': '/api/users/register/',
        }
    })

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

urlpatterns = [
    path('', api_root, name='api-root'),
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api/token/', EmailTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
        # ADD THESE TWO LINES
    path('api/messages/', include('messaging.urls')),  # ← Messages with custom URLs
    path('api/jobs/', include('jobs.urls')),  # ← Jobs routing
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)