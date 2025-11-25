from rest_framework import serializers
from .models import Notification

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = [
            'id', 'user', 'type', 'title', 'message', 'metadata',
            'is_read', 'read_at', 'created_at'
        ]
        read_only_fields = ['id', 'created_at', 'read_at', 'is_read', 'user']
