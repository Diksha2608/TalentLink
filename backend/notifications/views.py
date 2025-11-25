from django.utils import timezone
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from rest_framework.exceptions import ValidationError

from .models import Notification
from .serializers import NotificationSerializer

class NotificationPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100

class NotificationViewSet(viewsets.ModelViewSet):
    """
    Endpoints for authenticated user's notifications:

    GET    /api/notifications/                 -> list (paginated)
    POST   /api/notifications/                 -> create
    POST   /api/notifications/mark-all-read/   -> mark all as read
    POST   /api/notifications/{id}/mark-read/  -> mark one as read
    GET    /api/notifications/unread-count/    -> returns { "count": N }
    """
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = NotificationPagination

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        # Automatically assign the current user
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['get'], url_path='unread-count')
    def unread_count(self, request):
        count = self.get_queryset().filter(is_read=False).count()
        return Response({'count': count}, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'], url_path='mark-all-read')
    def mark_all_read(self, request):
        qs = self.get_queryset().filter(is_read=False)
        updated = qs.update(is_read=True, read_at=timezone.now())
        return Response({'updated': updated, 'status': 'ok'}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], url_path='mark-read')
    def mark_read(self, request, pk=None):
        notif = self.get_object()
        if notif.user_id != request.user.id:
            raise ValidationError('Not allowed')
        if not notif.is_read:
            notif.is_read = True
            notif.read_at = timezone.now()
            notif.save(update_fields=['is_read', 'read_at'])
        return Response({'id': notif.id, 'is_read': True, 'status': 'ok'}, status=status.HTTP_200_OK)
