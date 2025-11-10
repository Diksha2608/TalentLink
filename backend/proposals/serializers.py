from rest_framework import serializers
from .models import Proposal
from users.serializers import UserSerializer, FreelancerProfileSerializer

class ProposalSerializer(serializers.ModelSerializer):
    project_title = serializers.CharField(source='project.title', read_only=True)
    project_id = serializers.IntegerField(source='project.id', read_only=True)
    freelancer_id = serializers.IntegerField(source='freelancer.id', read_only=True)
    
    # Add full freelancer profile data
    freelancer = serializers.SerializerMethodField()
    
    class Meta:
        model = Proposal
        fields = [
            'id', 'project', 'project_id', 'project_title', 'freelancer', 'freelancer_id',
            'cover_letter', 'bid_amount', 'estimated_time', 
            'status', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'status', 'created_at', 'updated_at']
    
    def get_freelancer(self, obj):
        """
        Return full freelancer data including profile, skills, portfolio, etc.
        """
        freelancer_user = obj.freelancer
        
        # Get basic user data
        user_data = UserSerializer(freelancer_user, context=self.context).data
        
        # Get freelancer profile data if exists
        try:
            profile = freelancer_user.freelancer_profile
            profile_data = FreelancerProfileSerializer(profile, context=self.context).data
            
            # Merge user data into profile data structure
            # This matches what FreelancerCard expects
            result = {
                'id': freelancer_user.id,
                'first_name': freelancer_user.first_name,
                'last_name': freelancer_user.last_name,
                'email': freelancer_user.email,
                'avatar': user_data.get('avatar'),
                'bio': freelancer_user.bio,
                'location': freelancer_user.location,
                'rating_avg': freelancer_user.rating_avg,
                'is_top_rated': freelancer_user.rating_avg >= 4.5,
                
                # Profile fields
                'hourly_rate': profile_data.get('hourly_rate'),
                'skills': profile_data.get('skills', []),
                'availability': profile_data.get('availability'),
                'portfolio': profile_data.get('portfolio'),
                'portfolio_files': profile_data.get('portfolio_files', []),
                'role_title': profile_data.get('role_title'),
                'social_links': profile_data.get('social_links', {}),
                'languages': profile_data.get('languages', []),
                'experiences': profile_data.get('experiences', []),
                'education': profile_data.get('education', []),
                'projects_completed': profile_data.get('projects_completed', 0),
                'total_earnings': profile_data.get('total_earnings', 0),
            }
            
            return result
            
        except Exception as e:
            print(f"Error getting freelancer profile: {e}")
            # Fallback to basic user data
            return {
                'id': freelancer_user.id,
                'first_name': freelancer_user.first_name,
                'last_name': freelancer_user.last_name,
                'email': freelancer_user.email,
                'avatar': user_data.get('avatar'),
                'bio': freelancer_user.bio,
                'location': freelancer_user.location,
                'rating_avg': freelancer_user.rating_avg,
                'is_top_rated': freelancer_user.rating_avg >= 4.5,
                'projects_completed': 0,
            }