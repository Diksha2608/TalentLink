# backend/messaging/views.py
from django.shortcuts import render

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from .models import Message
from .serializers import MessageSerializer

class MessageViewSet(viewsets.ModelViewSet):
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Message.objects.filter(Q(sender=user) | Q(recipient=user))

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save(sender=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def conversations(self, request):
        user = request.user
        messages = self.get_queryset()
        users_in_conversation = set()
        
        for msg in messages:
            if msg.sender != user:
                users_in_conversation.add(msg.sender)
            else:
                users_in_conversation.add(msg.recipient)
        
        from users.serializers import UserSerializer
        return Response(UserSerializer(list(users_in_conversation), many=True).data)

    @action(detail=False, methods=['get'])
    def with_user(self, request):
        other_user_id = request.query_params.get('user_id')
        messages = self.get_queryset().filter(
            Q(sender_id=other_user_id, recipient=request.user) |
            Q(sender=request.user, recipient_id=other_user_id)
        ).order_by('created_at')
        serializer = self.get_serializer(messages, many=True)
        return Response(serializer.data)