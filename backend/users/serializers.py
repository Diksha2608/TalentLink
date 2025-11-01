from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework.exceptions import AuthenticationFailed
from .models import FreelancerProfile, Skill, ClientProfile, PortfolioFile


User = get_user_model()

class EmailTokenObtainSerializer(TokenObtainPairSerializer):
    username_field = User.USERNAME_FIELD 
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Replace username field with email field
        self.fields['email'] = serializers.EmailField(required=True)
        self.fields['password'] = serializers.CharField(write_only=True, required=True)
        # Remove username field if it exists
        self.fields.pop('username', None)

    @classmethod
    def get_token(cls, user):
        return super().get_token(user)

    def validate(self, attrs):
        # Get email and password from the request
        email = attrs.get('email')
        password = attrs.get('password')

        if not email:
            raise AuthenticationFailed('Email is required.')
        
        if not password:
            raise AuthenticationFailed('Password is required.')

        # Find user by email
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise AuthenticationFailed('No account found with this email. Please register first.')

        # Verify password
        if not user.check_password(password):
            raise AuthenticationFailed('Invalid password. Please try again.')

        # Check if user is active
        if not user.is_active:
            raise AuthenticationFailed('This account has been disabled.')

        # Generate refresh and access tokens
        refresh = self.get_token(user)

        data = {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }

        return data


# Rest of serializers...
class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = ['id', 'name', 'slug']

class UserSerializer(serializers.ModelSerializer):
    profile_complete = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'email', 'username', 'first_name', 'last_name', 'role', 'avatar', 'bio', 'location', 'phone','birthdate', 'rating_avg', 'created_at', 'profile_complete']
        read_only_fields = ['id', 'created_at', 'rating_avg']

    def get_profile_complete(self, obj):
        if obj.role == 'freelancer':
            try:
                profile = obj.freelancer_profile
                has_skills = profile.skills.count() > 0
                has_rate = profile.hourly_rate > 0
                has_bio = bool(obj.bio)
                has_portfolio = bool(profile.portfolio)
                return has_skills and has_rate and has_bio and has_portfolio
            except:
                return False
        return True

class PortfolioFileSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()
    
    class Meta:
        model = PortfolioFile
        fields = ['id', 'file', 'file_name', 'file_size', 'file_url', 'uploaded_at']
        read_only_fields = ['id', 'uploaded_at', 'file_url']
    
    def get_file_url(self, obj):
        request = self.context.get('request')
        if obj.file:
            return request.build_absolute_uri(obj.file.url) if request else obj.file.url
        return None


class FreelancerProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    skills = SkillSerializer(many=True, read_only=True)
    skill_ids = serializers.PrimaryKeyRelatedField(
        queryset=Skill.objects.all(),
        write_only=True,
        many=True,
        source='skills',
        required=False
    )
    portfolio_files = PortfolioFileSerializer(many=True, read_only=True)

    class Meta:
        model = FreelancerProfile
        fields = [
            'user', 'hourly_rate', 'skills', 'skill_ids', 'availability',
            'resume_file', 'portfolio', 'intro_video_url', 'social_links',
            'total_earnings', 'projects_completed', 'created_at',
            'category', 'custom_category', 'role_title', 'languages', 
            'experiences', 'education', 'portfolio_files'
        ]
        read_only_fields = ['created_at', 'total_earnings', 'projects_completed', 'portfolio_files']

class ClientProfileMeSerializer(serializers.ModelSerializer):
    id_document_url = serializers.SerializerMethodField()

    class Meta:
        model = ClientProfile
        fields = (
            "company_name", "company_website", "id_document",
            "id_document_url", "is_verified", "verification_submitted_at",
            "projects_posted", "active_projects"
        )
        read_only_fields = ("is_verified", "verification_submitted_at", "projects_posted", "active_projects")

    def get_id_document_url(self, obj):
        request = self.context.get('request')
        if obj.id_document:
            return request.build_absolute_uri(obj.id_document.url) if request else obj.id_document.url
        return None

    def update(self, instance, validated_data):
        # Only stamp when id_document is explicitly provided
        if 'id_document' in validated_data and validated_data['id_document'] is not None:
            instance.verification_submitted_at = timezone.now()
            instance.is_verified = False  # stays pending until admin approves
        return super().update(instance, validated_data)

ClientProfileSerializer = ClientProfileMeSerializer

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8, style={'input_type': 'password'})
    password2 = serializers.CharField(write_only=True, min_length=8, style={'input_type': 'password'})

    class Meta:
        model = User
        fields = ['email', 'username', 'first_name', 'last_name', 'password', 'password2', 'role']

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("A user with this username already exists.")
        return value

    def validate(self, data):
        if data.get('password') != data.get('password2'):
            raise serializers.ValidationError({"password": "Passwords do not match."})
        return data

    def create(self, validated_data):
        validated_data.pop('password2')
        password = validated_data.pop('password')
        
        user = User.objects.create(**validated_data)
        user.set_password(password)
        user.save()
        
        # Auto-create profile based on role
        if user.role == 'freelancer':
            FreelancerProfile.objects.create(user=user, hourly_rate=0)
        elif user.role == 'client':
            ClientProfile.objects.create(user=user)
        
        return user