from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model
from .models import FreelancerProfile, Skill
from .serializers import (
    UserSerializer, FreelancerProfileSerializer, UserRegistrationSerializer, 
    SkillSerializer, EmailTokenObtainSerializer
)

User = get_user_model()

class EmailTokenObtainPairView(TokenObtainPairView):
    serializer_class = EmailTokenObtainSerializer

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def register(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response(
                UserSerializer(user).data,
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def me(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)
    
    @action(detail=False, methods=['put'])
    def update_me(self, request):
        user = request.user
        serializer = self.get_serializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def upload_resume(self, request):
        try:
            profile = request.user.freelancer_profile
            if 'resume' in request.FILES:
                profile.resume_file = request.FILES['resume']
                profile.save()
                return Response({'detail': 'Resume uploaded successfully.'}, status=status.HTTP_200_OK)
        except FreelancerProfile.DoesNotExist:
            return Response({'detail': 'Freelancer profile not found.'}, status=status.HTTP_404_NOT_FOUND)
        return Response({'detail': 'No resume file provided.'}, status=status.HTTP_400_BAD_REQUEST)

class FreelancerProfileViewSet(viewsets.ModelViewSet):
    queryset = FreelancerProfile.objects.all()
    serializer_class = FreelancerProfileSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get', 'put'])
    def me(self, request):
        try:
            profile = request.user.freelancer_profile
        except FreelancerProfile.DoesNotExist:
            return Response(
                {'detail': 'Freelancer profile not found.'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        if request.method == 'PUT':
            serializer = self.get_serializer(profile, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = self.get_serializer(profile)
        return Response(serializer.data)

class SkillViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Skill.objects.all()
    serializer_class = SkillSerializer
    permission_classes = [AllowAny]