import uuid
from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    supabase_user_id = models.CharField(max_length=255, unique=True, db_index=True)
    username = models.CharField(max_length=150, unique=True, null=True, blank=True)
    email = models.EmailField(blank=True)
    full_name = models.CharField(max_length=255, blank=True)
    display_name = models.CharField(max_length=255, blank=True)
    avatar_url = models.URLField(blank=True)
    job_title = models.CharField(max_length=255, blank=True)
    contact = models.CharField(max_length=255, blank=True)
    country = models.CharField(max_length=100, blank=True)
    timezone = models.CharField(max_length=100, blank=True)
    bio = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = 'supabase_user_id'
    REQUIRED_FIELDS: list[str] = []
