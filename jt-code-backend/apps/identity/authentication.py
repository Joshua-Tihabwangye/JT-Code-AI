from __future__ import annotations

from typing import Any

import jwt
from django.conf import settings
from rest_framework import authentication, exceptions
from apps.identity.models import User

class SupabaseJWTAuthentication(authentication.BaseAuthentication):
    keyword = 'Bearer'

    def authenticate(self, request):
        header = authentication.get_authorization_header(request).split()
        if not header:
            return None
        if len(header) != 2 or header[0].decode().lower() != self.keyword.lower():
            raise exceptions.AuthenticationFailed('Invalid authorization header.')
        token = header[1].decode()
        try:
            claims: dict[str, Any] = jwt.decode(
                token,
                settings.SUPABASE_JWT_SECRET,
                algorithms=['HS256'],
                audience=settings.SUPABASE_JWT_AUDIENCE or None,
                options={'verify_aud': bool(settings.SUPABASE_JWT_AUDIENCE)},
                leeway=5,
            )
        except jwt.ExpiredSignatureError:
            raise exceptions.AuthenticationFailed('Supabase token has expired.')
        except Exception as exc:
            raise exceptions.AuthenticationFailed('Invalid or expired Supabase session token.') from exc

        subject = claims.get('sub')
        if not subject:
            raise exceptions.AuthenticationFailed('Supabase token is missing subject.')

        defaults: dict[str, Any] = {'is_active': True}
        if isinstance(claims.get('email'), str):
            defaults['email'] = claims['email']
        if isinstance(claims.get('user_metadata'), dict):
            metadata = claims['user_metadata']
            if isinstance(metadata.get('full_name'), str):
                defaults['full_name'] = metadata['full_name']
            if isinstance(metadata.get('name'), str):
                defaults['display_name'] = metadata['name']
            if isinstance(metadata.get('avatar_url'), str):
                defaults['avatar_url'] = metadata['avatar_url']

        user, _ = User.objects.update_or_create(supabase_user_id=subject, defaults=defaults)
        return user, claims

    def authenticate_header(self, request) -> str:
        return self.keyword
