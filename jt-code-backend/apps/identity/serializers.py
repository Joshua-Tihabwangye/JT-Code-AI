from rest_framework import serializers
from apps.identity.models import User

class UserSerializer(serializers.ModelSerializer):
    supabaseUserId = serializers.CharField(source='supabase_user_id', read_only=True)
    displayName = serializers.CharField(source='display_name', read_only=True)
    avatarUrl = serializers.URLField(source='avatar_url', read_only=True)
    class Meta:
        model = User
        fields = ('id', 'supabaseUserId', 'email', 'displayName', 'avatarUrl')

class UserProfileSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField(read_only=True)
    avatar_url = serializers.URLField(source='avatar_url', required=False, allow_blank=True)

    class Meta:
        model = User
        fields = (
            'id', 'supabase_user_id', 'name', 'full_name', 'first_name', 'last_name', 'email',
            'contact', 'country', 'job_title', 'bio', 'timezone', 'avatar_url',
        )
        read_only_fields = ('id', 'supabase_user_id', 'full_name', 'first_name', 'last_name')

    def get_name(self, obj: User) -> str:
        if obj.full_name:
            return obj.full_name
        if obj.display_name:
            return obj.display_name
        return ' '.join(filter(None, [obj.first_name, obj.last_name])) or obj.email or obj.supabase_user_id

    def update(self, instance, validated_data):
        return super().update(instance, validated_data)
