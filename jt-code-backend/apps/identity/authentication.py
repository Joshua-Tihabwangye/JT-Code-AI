from __future__ import annotations

from functools import lru_cache
from typing import Any

import jwt
from django.conf import settings
from rest_framework import authentication, exceptions
from apps.identity.models import User

@lru_cache(maxsize=1)
def jwks_client() -> jwt.PyJWKClient:
    if not settings.CLERK_JWKS_URL:
        raise RuntimeError('CLERK_JWKS_URL is not configured.')
    return jwt.PyJWKClient(settings.CLERK_JWKS_URL, cache_keys=True, lifespan=300)

class ClerkJWTAuthentication(authentication.BaseAuthentication):
    keyword = 'Bearer'

    def authenticate(self, request):
        header = authentication.get_authorization_header(request).split()
        if not header:
            return None
        if len(header) != 2 or header[0].decode().lower() != self.keyword.lower():
            raise exceptions.AuthenticationFailed('Invalid authorization header.')
        token = header[1].decode()
        try:
            signing_key = jwks_client().get_signing_key_from_jwt(token)
            options = {'verify_aud': bool(settings.CLERK_AUDIENCE)}
            claims: dict[str, Any] = jwt.decode(
                token,
                signing_key.key,
                algorithms=['RS256'],
                issuer=settings.CLERK_ISSUER or None,
                audience=settings.CLERK_AUDIENCE or None,
                options=options,
                leeway=5,
            )
        except Exception as exc:
            raise exceptions.AuthenticationFailed('Invalid or expired Clerk session token.') from exc

        authorized_parties = settings.CLERK_AUTHORIZED_PARTIES
        if authorized_parties and claims.get('azp') not in authorized_parties:
            raise exceptions.AuthenticationFailed('Token authorized party is not allowed.')
        subject = claims.get('sub')
        if not subject:
            raise exceptions.AuthenticationFailed('Clerk token is missing subject.')

        defaults = {'is_active': True}
        if isinstance(claims.get('email'), str):
            defaults['email'] = claims['email']
        user, _ = User.objects.update_or_create(clerk_user_id=subject, defaults=defaults)
        return user, claims

    def authenticate_header(self, request) -> str:
        return self.keyword
