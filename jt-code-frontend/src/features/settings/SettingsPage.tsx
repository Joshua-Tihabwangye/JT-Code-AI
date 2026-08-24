import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useUser, supabase } from '@/lib/supabase';
import { useApiClient } from '@/lib/api/client';
import { getUserProfile, updateUserProfile } from '@/features/settings/api';
import { Button, Input, Card, CardContent, CardHeader, CardTitle, Alert } from '@/shared/components';
import { User, Pencil } from 'lucide-react';
import type { UserProfile } from '@/features/settings/api';

export function SettingsPage() {
  const client = useApiClient();
  const queryClient = useQueryClient();
  const supabaseUser = useUser();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const user = useQuery({ queryKey: ['user-profile'], queryFn: () => getUserProfile(client) });

  const [profileForm, setProfileForm] = useState<Partial<UserProfile>>({});

  useEffect(() => {
    const backend = user.data;
    const supabaseMeta = supabaseUser?.user_metadata as { avatar_url?: string } || {};
    setProfileForm({
      first_name: backend?.first_name || '',
      last_name: backend?.last_name || '',
      email: backend?.email || supabaseUser?.email || '',
      contact: backend?.contact || '',
      country: backend?.country || '',
      timezone: backend?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
    });
    setAvatarUrl(supabaseMeta.avatar_url || '');
  }, [user.data, supabaseUser]);

  const updateProfileMutation = useMutation({
    mutationFn: (data: Partial<UserProfile>) => updateUserProfile(client, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      setSuccess('Profile updated successfully');
      setTimeout(() => setSuccess(''), 3000);
    },
    onError: () => setError('Failed to update profile'),
  });

  function handleProfileChange(field: keyof UserProfile, value: string) {
    setProfileForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleProfileSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = { ...profileForm };
    delete payload.email;
    if (avatarUrl) {
      payload.avatar_url = avatarUrl;
    }
    updateProfileMutation.mutate(payload);
  }

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).slice(2)}.${fileExt}`;

    supabase.storage
      .from('avatars')
      .upload(fileName, file, { cacheControl: 'public, max-age=31536000', upsert: true })
      .then((result) => {
        if (result?.error) throw new Error((result.error as unknown as string) || 'Upload failed');
        const publicUrl = supabase.storage.from('avatars').getPublicUrl(fileName).data.publicUrl;
        setAvatarUrl(publicUrl);
      })
      .catch((err) => {
        console.error('Avatar upload error:', err);
        setError('Failed to upload avatar');
      });
  }

  function handleProfileReset() {
    const backend = user.data;
    const supabaseMeta = supabaseUser?.user_metadata as { avatar_url?: string } || {};
    setProfileForm({
      first_name: backend?.first_name || '',
      last_name: backend?.last_name || '',
      email: backend?.email || supabaseUser?.email || '',
      contact: backend?.contact || '',
      country: backend?.country || '',
      timezone: backend?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
    });
    setAvatarUrl(supabaseMeta.avatar_url || '');
  }

  return (
    <section className="workspace">
      <header className="workspace-header">
        <div>
          <p className="eyebrow">Settings</p>
          <h1>Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your profile information.</p>
        </div>
      </header>

      {error && (
        <Alert variant="destructive" className="mb-4" onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert variant="success" className="mb-4" onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-base text-foreground">Profile information</CardTitle>
            <p className="text-sm text-muted-foreground">Update your personal details and how others see you.</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfileSubmit} className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <Input label="First name" value={profileForm.first_name || ''} onChange={(e) => handleProfileChange('first_name', e.target.value)} />
                <Input label="Last name" value={profileForm.last_name || ''} onChange={(e) => handleProfileChange('last_name', e.target.value)} />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <Input
                  label="Email address"
                  type="email"
                  value={profileForm.email || ''}
                  readOnly
                  aria-readonly="true"
                />
                <Input label="Country" value={profileForm.country || ''} onChange={(e) => handleProfileChange('country', e.target.value)} placeholder="United States" />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <Input label="Contact" value={profileForm.contact || ''} onChange={(e) => handleProfileChange('contact', e.target.value)} placeholder="+1 (555) 000-0000" />
                <Input label="Timezone" value={profileForm.timezone || ''} onChange={(e) => handleProfileChange('timezone', e.target.value)} />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Button type="submit" disabled={updateProfileMutation.isPending}>
                  {updateProfileMutation.isPending ? 'Saving...' : 'Save changes'}
                </Button>
                <Button type="button" variant="outline" onClick={handleProfileReset}>Cancel</Button>
              </div>

              <div className="mt-4">
                <label className="file-label">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      handleAvatarChange(e);
                    }}
                    className="hidden"
                  />
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Profile picture" className="w-12 h-12 rounded-full object-cover" />
                  ) : (
                    <User size={20} className="text-muted-foreground" />
                  )}
                  <span>Update profile picture</span>
                </label>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-border/60">
            <CardContent className="p-6 flex flex-col items-center text-center relative">
              <div className="relative mb-4">
                <div className="w-28 h-28 rounded-full bg-secondary flex items-center justify-center overflow-hidden border-2 border-border">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Profile picture" className="w-full h-full object-cover" />
                  ) : (
                    <User size={40} className="text-muted-foreground" />
                  )}
                </div>
                <label
                  className="absolute bottom-1 right-1 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center cursor-pointer"
                  title="Edit profile picture"
                  aria-label="Edit profile picture"
                >
                  <Pencil size={14} />
                  <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                </label>
              </div>
              <div className="text-base font-semibold text-foreground">
                {supabaseUser?.user_metadata?.full_name || supabaseUser?.user_metadata?.name || `${profileForm.first_name || ''} ${profileForm.last_name || ''}`.trim() || 'Your profile'}
              </div>
              <div className="text-sm text-muted-foreground">{supabaseUser?.email || profileForm.email}</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
