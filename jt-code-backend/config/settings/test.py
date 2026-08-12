from config.settings.base import *  # noqa: F403

DEBUG = False
PASSWORD_HASHERS = ['django.contrib.auth.hashers.MD5PasswordHasher']
CELERY_TASK_ALWAYS_EAGER = True
CELERY_TASK_EAGER_PROPAGATES = True
CACHES = {'default': {'BACKEND': 'django.core.cache.backends.locmem.LocMemCache'}}
DATABASES = {'default': {'ENGINE': 'django.db.backends.sqlite3', 'NAME': ':memory:'}}

# Provide default Supabase settings so tests can authenticate
SUPABASE_JWT_SECRET = env('SUPABASE_JWT_SECRET', 'test-jwt-secret')
SUPABASE_JWT_AUDIENCE = env('SUPABASE_JWT_AUDIENCE', '')
SUPABASE_URL = env('SUPABASE_URL', 'http://localhost:3000')
SUPABASE_WEBHOOK_SIGNING_SECRET = env('SUPABASE_WEBHOOK_SIGNING_SECRET', '')
