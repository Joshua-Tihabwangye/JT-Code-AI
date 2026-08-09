from django.urls import path
from apps.identity.views import MeView
from apps.identity.webhooks import clerk_webhook

urlpatterns = [
    path('me/', MeView.as_view(), name='me'),
    path('webhooks/clerk/', clerk_webhook, name='clerk-webhook'),
]
