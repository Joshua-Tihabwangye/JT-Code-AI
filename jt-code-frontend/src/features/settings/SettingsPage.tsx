import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useUser, supabase } from '@/lib/supabase';
import { useApiClient } from '@/lib/api/client';
import { getUserProfile, updateUserProfile, deleteAccount } from '@/features/settings/api';
import { Button, Input, Select, Card, CardContent, CardHeader, CardTitle, Alert } from '@/shared/components';
import { User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { COUNTRY_METADATA, getCountryMetadata, type CountryMetadata } from '@/features/auth/lib/countryMetadata';
import { formatPhoneNumberForCountry } from '@/features/auth/lib/phone';
import { useLanguage } from '@/i18n/useLanguage';
import type { UserProfile } from '@/features/settings/api';

function resolveCountry(value?: string): CountryMetadata {
  if (value) {
    const byCode = getCountryMetadata(value);
    if (byCode) return byCode;
    const byName = COUNTRY_METADATA.find((c) => c.name.toLowerCase() === value.toLowerCase());
    if (byName) return byName;
  }
  return getCountryMetadata('UG') ?? COUNTRY_METADATA[0]!;
}

export function SettingsPage() {
  const { t } = useTranslation();
  const { currentLanguage, setLanguage, languages } = useLanguage();
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
    const country = resolveCountry(backend?.country);
    const tz = backend?.timezone || '';
    const timezoneInCountry = country.timezones.includes(tz) ? tz : (country.timezones[0] ?? '');
    setProfileForm({
      first_name: backend?.first_name || '',
      last_name: backend?.last_name || '',
      email: backend?.email || supabaseUser?.email || '',
      country: country.code,
      contact: backend?.contact || '',
      timezone: timezoneInCountry,
    });
    setAvatarUrl(supabaseMeta.avatar_url || '');
  }, [user.data, supabaseUser]);

  const updateProfileMutation = useMutation({
    mutationFn: (data: Partial<UserProfile>) => updateUserProfile(client, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      setSuccess(t('settings.profileUpdated'));
      setTimeout(() => setSuccess(''), 3000);
    },
    onError: () => setError(t('settings.updateProfileError')),
  });

  const deleteAccountMutation = useMutation({
    mutationFn: () => deleteAccount(client),
    onSuccess: async () => {
      await supabase.auth.signOut();
      window.location.href = '/sign-in';
    },
    onError: () => setError(t('settings.deleteAccountError')),
  });

  function handleDeleteAccount() {
    if (window.confirm(t('settings.deleteAccountConfirm'))) {
      deleteAccountMutation.mutate();
    }
  }

  function handleProfileChange(field: keyof UserProfile, value: string) {
    setProfileForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleCountryChange(code: string) {
    const country = getCountryMetadata(code);
    if (!country) return;
    setProfileForm((prev) => ({
      ...prev,
      country: country.code,
      timezone: country.timezones[0] ?? '',
    }));
  }

  function handleContactBlur(value: string) {
    const country = getCountryMetadata(profileForm.country || '');
    if (!country) return;
    const formatted = formatPhoneNumberForCountry(value, country.code);
    if (formatted && formatted !== value) {
      setProfileForm((prev) => ({ ...prev, contact: formatted }));
    }
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

  function handleProfileReset() {
    const backend = user.data;
    const supabaseMeta = supabaseUser?.user_metadata as { avatar_url?: string } || {};
    const country = resolveCountry(backend?.country);
    const tz = backend?.timezone || '';
    const timezoneInCountry = country.timezones.includes(tz) ? tz : (country.timezones[0] ?? '');
    setProfileForm({
      first_name: backend?.first_name || '',
      last_name: backend?.last_name || '',
      email: backend?.email || supabaseUser?.email || '',
      country: country.code,
      contact: backend?.contact || '',
      timezone: timezoneInCountry,
    });
    setAvatarUrl(supabaseMeta.avatar_url || '');
  }

  const selectedCountry = getCountryMetadata(profileForm.country || '');
  const countryOptions = COUNTRY_METADATA.map((c) => ({
    value: c.code,
    label: `${c.flag} ${c.name} (${c.dialCode})`,
  }));
  const timezoneOptions = (selectedCountry?.timezones ?? []).map((tz) => ({ value: tz, label: tz }));

  return (
    <section className="workspace">
      <header className="workspace-header">
        <div>
          <p className="eyebrow">Settings</p>
          <h1>{t('settings.title')}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t('settings.subtitle')}</p>
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
                title={t('settings.updateProfilePicture')}
                aria-label={t('settings.updateProfilePicture')}
              >
                <Pencil size={14} />
                <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
              </label>
            </div>
            <div className="text-base font-semibold text-foreground">
              {supabaseUser?.user_metadata?.full_name || supabaseUser?.user_metadata?.name || `${profileForm.first_name || ''} ${profileForm.last_name || ''}`.trim() || t('settings.yourProfile')}
            </div>
            <div className="text-sm text-muted-foreground">{supabaseUser?.email || profileForm.email}</div>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-base text-foreground">{t('settings.language')}</CardTitle>
            <p className="text-sm text-muted-foreground">{t('settings.languageHelp')}</p>
          </CardHeader>
          <CardContent>
            <div className="w-full max-w-sm">
              <Select
                id="language"
                options={languages.map((l) => ({ value: l.code, label: `${l.nativeName} — ${l.englishName}` }))}
                value={currentLanguage}
                onChange={(e) => setLanguage(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-base text-foreground">{t('settings.profileInformation')}</CardTitle>
            <p className="text-sm text-muted-foreground">{t('settings.profileInformationDesc')}</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfileSubmit} className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <Input label={t('settings.firstName')} value={profileForm.first_name || ''} onChange={(e) => handleProfileChange('first_name', e.target.value)} />
                <Input label={t('settings.lastName')} value={profileForm.last_name || ''} onChange={(e) => handleProfileChange('last_name', e.target.value)} />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <Input
                  label={t('settings.email')}
                  type="email"
                  value={profileForm.email || ''}
                  readOnly
                  aria-readonly="true"
                />
                <div className="w-full">
                  <label htmlFor="country" className="block text-sm font-medium text-foreground mb-1.5">
                    {t('settings.country')}
                  </label>
                  <Select
                    id="country"
                    options={countryOptions}
                    value={profileForm.country || ''}
                    onChange={(e) => handleCountryChange(e.target.value)}
                  />
                  <p className="mt-1.5 text-sm text-muted-foreground">
                    {t('settings.countryHelp')}
                  </p>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="w-full">
                  <label htmlFor="contact" className="block text-sm font-medium text-foreground mb-1.5">
                    {t('settings.contact')}
                  </label>
                  <input
                    id="contact"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    value={profileForm.contact || ''}
                    placeholder={selectedCountry?.phonePlaceholder ?? t('settings.contact')}
                    onChange={(e) => handleProfileChange('contact', e.target.value)}
                    onBlur={(e) => handleContactBlur(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  />
                  <p className="mt-1.5 text-sm text-muted-foreground">
                    {t('settings.contactHelp', { country: selectedCountry?.name ?? t('settings.yourCountry') })}
                  </p>
                </div>
                <div className="w-full">
                  <label htmlFor="timezone" className="block text-sm font-medium text-foreground mb-1.5">
                    {t('settings.timezone')}
                  </label>
                  <Select
                    id="timezone"
                    options={timezoneOptions}
                    placeholder={timezoneOptions.length ? undefined : t('settings.noTimezone')}
                    value={profileForm.timezone || ''}
                    disabled={!timezoneOptions.length}
                    onChange={(e) => handleProfileChange('timezone', e.target.value)}
                  />
                  <p className="mt-1.5 text-sm text-muted-foreground">
                    {t('settings.timezoneHelp')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Button type="submit" disabled={updateProfileMutation.isPending}>
                  {updateProfileMutation.isPending ? t('common.loading') : t('common.saveChanges')}
                </Button>
                <Button type="button" variant="outline" onClick={handleProfileReset}>{t('common.cancel')}</Button>
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
      </div>
    </section>
  );
}
