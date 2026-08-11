from rest_framework.generics import RetrieveAPIView, RetrieveUpdateAPIView
from rest_framework.permissions import IsAuthenticated
from apps.identity.serializers import UserSerializer, UserProfileSerializer

class MeView(RetrieveAPIView):
    serializer_class = UserSerializer
    def get_object(self):
        return self.request.user

class SettingsProfileView(RetrieveUpdateAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user
