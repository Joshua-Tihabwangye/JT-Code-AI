from django.urls import path
from apps.identity.views import MeView, SettingsProfileView, AuthPingView
from apps.identity.webhooks import supabase_webhook

urlpatterns = [
    path('auth/ping/', AuthPingView.as_view(), name='auth-ping'),
    path('me/', MeView.as_view(), name='me'),
    path('settings/profile/', SettingsProfileView.as_view(), name='settings-profile'),
    path('webhooks/supabase/', supabase_webhook, name='supabase-webhook'),
]