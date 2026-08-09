from __future__ import annotations

from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from django.http import HttpRequest, JsonResponse
from svix.webhooks import Webhook, WebhookVerificationError
from apps.identity.models import User

@csrf_exempt
def clerk_webhook(request: HttpRequest):
    if request.method != 'POST':
        return JsonResponse({'detail': 'Method not allowed.'}, status=405)
    if not settings.CLERK_WEBHOOK_SIGNING_SECRET:
        return JsonResponse({'detail': 'Webhook is not configured.'}, status=503)
    try:
        event = Webhook(settings.CLERK_WEBHOOK_SIGNING_SECRET).verify(request.body, {
            'svix-id': request.headers.get('svix-id', ''),
            'svix-timestamp': request.headers.get('svix-timestamp', ''),
            'svix-signature': request.headers.get('svix-signature', ''),
        })
    except WebhookVerificationError:
        return JsonResponse({'detail': 'Invalid webhook signature.'}, status=400)

    event_type = event.get('type')
    data = event.get('data', {})
    clerk_id = data.get('id')
    if not clerk_id:
        return JsonResponse({'detail': 'Missing Clerk user id.'}, status=400)

    if event_type in {'user.created', 'user.updated'}:
        emails = data.get('email_addresses') or []
        primary_id = data.get('primary_email_address_id')
        email = next((item.get('email_address', '') for item in emails if item.get('id') == primary_id), '')
        display_name = ' '.join(filter(None, [data.get('first_name'), data.get('last_name')])).strip()
        User.objects.update_or_create(clerk_user_id=clerk_id, defaults={
            'email': email,
            'display_name': display_name,
            'avatar_url': data.get('image_url') or '',
            'is_active': True,
        })
    elif event_type == 'user.deleted':
        User.objects.filter(clerk_user_id=clerk_id).update(is_active=False)
    return JsonResponse({'received': True})
