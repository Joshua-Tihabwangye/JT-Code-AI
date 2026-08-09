from __future__ import annotations

import os
from pathlib import Path
from typing import Any

import cloudinary
import dj_database_url
import sentry_sdk
from django.core.exceptions import ImproperlyConfigured
from sentry_sdk.integrations.celery import CeleryIntegration
from sentry_sdk.integrations.django import DjangoIntegration
from sentry_sdk.integrations.redis import RedisIntegration

BASE_DIR = Path(__file__).resolve().parents[2]


def env(name: str, default: str | None = None, *, required: bool = False) -> str:
    value = os.getenv(name, default)
    if required and not value:
        raise ImproperlyConfigured(f'Missing required environment variable: {name}')
    return value or ''


def env_bool(name: str, default: bool = False) -> bool:
    return env(name, str(default)).lower() in {'1', 'true', 'yes', 'on'}


def env_list(name: str, default: str = '') -> list[str]:
    return [item.strip() for item in env(name, default).split(',') if item.strip()]


def env_float(name: str, default: float) -> float:
    return float(env(name, str(default)))


SECRET_KEY = env('DJANGO_SECRET_KEY', 'unsafe-local-development-key-change-me')
DEBUG = env_bool('DJANGO_DEBUG', False)
ALLOWED_HOSTS = env_list('DJANGO_ALLOWED_HOSTS', 'localhost,127.0.0.1')

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'corsheaders',
    'rest_framework',
    'drf_spectacular',
    'apps.core',
    'apps.identity',
    'apps.conversations',
    'apps.assets',
    'apps.events',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'apps.core.middleware.RequestContextMiddleware',
]

ROOT_URLCONF = 'config.urls'
TEMPLATES = [{
    'BACKEND': 'django.template.backends.django.DjangoTemplates',
    'DIRS': [],
    'APP_DIRS': True,
    'OPTIONS': {'context_processors': [
        'django.template.context_processors.request',
        'django.contrib.auth.context_processors.auth',
        'django.contrib.messages.context_processors.messages',
    ]},
}]
WSGI_APPLICATION = 'config.wsgi.application'
ASGI_APPLICATION = 'config.asgi.application'

DATABASES = {
    'default': dj_database_url.config(
        default=env('DATABASE_URL', 'postgresql://postgres:postgres@localhost:5432/jtcode'),
        conn_max_age=int(env('DATABASE_CONN_MAX_AGE', '60')),
        conn_health_checks=True,
    )
}

AUTH_USER_MODEL = 'identity.User'
AUTH_PASSWORD_VALIDATORS: list[dict[str, Any]] = []
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STORAGES = {
    'default': {'BACKEND': 'django.core.files.storage.FileSystemStorage'},
    'staticfiles': {'BACKEND': 'whitenoise.storage.CompressedManifestStaticFilesStorage'},
}

CORS_ALLOWED_ORIGINS = env_list('CORS_ALLOWED_ORIGINS', 'http://localhost:5173')
CSRF_TRUSTED_ORIGINS = env_list('CSRF_TRUSTED_ORIGINS', 'http://localhost:5173')
CORS_ALLOW_CREDENTIALS = False

REDIS_URL = env('REDIS_URL', 'redis://localhost:6379/0')
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.redis.RedisCache',
        'LOCATION': REDIS_URL,
        'TIMEOUT': 300,
        'OPTIONS': {'socket_connect_timeout': 3, 'socket_timeout': 3},
        'KEY_PREFIX': 'jt-code',
    }
}

CELERY_BROKER_URL = env('CELERY_BROKER_URL', 'redis://localhost:6379/1')
CELERY_RESULT_BACKEND = env('CELERY_RESULT_BACKEND', 'redis://localhost:6379/2')
CELERY_TASK_ACKS_LATE = True
CELERY_TASK_REJECT_ON_WORKER_LOST = True
CELERY_TASK_TRACK_STARTED = True
CELERY_TASK_TIME_LIMIT = 600
CELERY_TASK_SOFT_TIME_LIMIT = 540
CELERY_BROKER_CONNECTION_RETRY_ON_STARTUP = True
CELERY_BEAT_SCHEDULE = {
    'publish-kafka-outbox': {
        'task': 'apps.events.tasks.publish_outbox_batch',
        'schedule': 2.0,
    },
}

CLERK_ISSUER = env('CLERK_ISSUER')
CLERK_JWKS_URL = env('CLERK_JWKS_URL')
CLERK_AUDIENCE = env('CLERK_AUDIENCE')
CLERK_AUTHORIZED_PARTIES = env_list('CLERK_AUTHORIZED_PARTIES')
CLERK_WEBHOOK_SIGNING_SECRET = env('CLERK_WEBHOOK_SIGNING_SECRET')

CLOUDINARY_CLOUD_NAME = env('CLOUDINARY_CLOUD_NAME')
CLOUDINARY_API_KEY = env('CLOUDINARY_API_KEY')
CLOUDINARY_API_SECRET = env('CLOUDINARY_API_SECRET')
CLOUDINARY_UPLOAD_FOLDER = env('CLOUDINARY_UPLOAD_FOLDER', 'jt-code/development')
CLOUDINARY_MAX_UPLOAD_BYTES = int(env('CLOUDINARY_MAX_UPLOAD_BYTES', str(25 * 1024 * 1024)))
cloudinary.config(
    cloud_name=CLOUDINARY_CLOUD_NAME,
    api_key=CLOUDINARY_API_KEY,
    api_secret=CLOUDINARY_API_SECRET,
    secure=True,
)

KAFKA_BOOTSTRAP_SERVERS = env('KAFKA_BOOTSTRAP_SERVERS', 'localhost:9092')
KAFKA_CLIENT_ID = env('KAFKA_CLIENT_ID', 'jt-code-api')
KAFKA_SECURITY_PROTOCOL = env('KAFKA_SECURITY_PROTOCOL', 'PLAINTEXT')
KAFKA_SASL_MECHANISM = env('KAFKA_SASL_MECHANISM')
KAFKA_SASL_USERNAME = env('KAFKA_SASL_USERNAME')
KAFKA_SASL_PASSWORD = env('KAFKA_SASL_PASSWORD')
KAFKA_TOPIC_PREFIX = env('KAFKA_TOPIC_PREFIX', 'jt-code.dev')

AI_PROVIDER = env('AI_PROVIDER', 'disabled')
N8N_SENTRY_RELAY_SECRET = env('N8N_SENTRY_RELAY_SECRET')

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': ['apps.identity.authentication.ClerkJWTAuthentication'],
    'DEFAULT_PERMISSION_CLASSES': ['rest_framework.permissions.IsAuthenticated'],
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 50,
    'EXCEPTION_HANDLER': 'apps.core.exceptions.api_exception_handler',
    'DEFAULT_RENDERER_CLASSES': ['rest_framework.renderers.JSONRenderer'],
}
SPECTACULAR_SETTINGS = {
    'TITLE': 'JT-Code API',
    'DESCRIPTION': 'Django API for JT-Code web and React Native clients.',
    'VERSION': '0.1.0',
    'SERVE_INCLUDE_SCHEMA': False,
    'SECURITY': [{'ClerkBearer': []}],
    'COMPONENT_SPLIT_REQUEST': True,
}

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'jsonish': {'format': '%(asctime)s %(levelname)s %(name)s request_id=%(request_id)s trace_id=%(trace_id)s %(message)s'},
    },
    'filters': {'request_context': {'()': 'apps.core.logging.RequestContextFilter'}},
    'handlers': {'console': {'class': 'logging.StreamHandler', 'formatter': 'jsonish', 'filters': ['request_context']}},
    'root': {'handlers': ['console'], 'level': 'INFO'},
}

SENTRY_DSN = env('SENTRY_DSN')
if SENTRY_DSN:
    sentry_sdk.init(
        dsn=SENTRY_DSN,
        environment=env('SENTRY_ENVIRONMENT', 'development'),
        release=env('SENTRY_RELEASE', 'jt-code-api@0.1.0'),
        integrations=[DjangoIntegration(), CeleryIntegration(), RedisIntegration()],
        traces_sample_rate=env_float('SENTRY_TRACES_SAMPLE_RATE', 0.1),
        profiles_sample_rate=env_float('SENTRY_PROFILES_SAMPLE_RATE', 0.0),
        send_default_pii=False,
        max_request_body_size='never',
    )
