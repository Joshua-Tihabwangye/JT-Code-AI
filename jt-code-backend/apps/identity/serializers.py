from rest_framework import serializers
from apps.identity.models import User

class UserSerializer(serializers.ModelSerializer):
    clerkUserId = serializers.CharField(source='clerk_user_id', read_only=True)
    displayName = serializers.CharField(source='display_name', read_only=True)
    avatarUrl = serializers.URLField(source='avatar_url', read_only=True)
    class Meta:
        model = User
        fields = ('id', 'clerkUserId', 'email', 'displayName', 'avatarUrl')

class UserProfileSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField(read_only=True)
    avatar_url = serializers.URLField(source='avatar_url', required=False, allow_blank=True)

    class Meta:
        model = User
        fields = (
            'id', 'clerk_user_id', 'name', 'first_name', 'last_name', 'email',
            'contact', 'country', 'job_title', 'bio', 'timezone', 'avatar_url',
        )
        read_only_fields = ('id', 'clerk_user_id')

    def get_name(self, obj: User) -> str:
        if obj.display_name:
            return obj.display_name
        return ' '.join(filter(None, [obj.first_name, obj.last_name])) or obj.email or obj.clerk_user_id
