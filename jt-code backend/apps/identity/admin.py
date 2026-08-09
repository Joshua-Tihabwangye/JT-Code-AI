from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from apps.identity.models import User

@admin.register(User)
class JTCodeUserAdmin(UserAdmin):
    fieldsets = UserAdmin.fieldsets + (('Clerk', {'fields': ('clerk_user_id', 'display_name', 'avatar_url')}),)
    list_display = ('clerk_user_id', 'email', 'display_name', 'is_active', 'is_staff')
    search_fields = ('clerk_user_id', 'email', 'display_name')
