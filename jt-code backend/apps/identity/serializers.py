from rest_framework import serializers
from apps.identity.models import User

class UserSerializer(serializers.ModelSerializer):
    clerkUserId = serializers.CharField(source='clerk_user_id', read_only=True)
    displayName = serializers.CharField(source='display_name', read_only=True)
    avatarUrl = serializers.URLField(source='avatar_url', read_only=True)
    class Meta:
        model = User
        fields = ('id', 'clerkUserId', 'email', 'displayName', 'avatarUrl')
