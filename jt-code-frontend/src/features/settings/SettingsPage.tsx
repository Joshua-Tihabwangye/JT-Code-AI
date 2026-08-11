import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useUser, useClerk } from '@clerk/react';
import { useApiClient } from '@/lib/api/client';
import { getUserProfile, updateUserProfile, getOrganization, updateOrganization, getConsents, updateConsent } from '@/features/settings/api';
import { Button, Input, Textarea, Card, CardContent, CardHeader, CardTitle, Alert, Badge, Tabs, TabsList, TabsTrigger, TabsContent, Switch } from '@/shared/components';
import { useTheme } from '@/lib/theme';
import {
  User,
  Building2,
  CreditCard,
  Shield,
  Bell,
  Moon,
  Download,
  Trash2,
  Pencil,
  Lock,
  ArrowRight,
  Key,
  Smartphone,
} from 'lucide-react';
import type { UserProfile, Organization, ConsentRecord } from '@/features/settings/api';

export function SettingsPage() {
  const client = useApiClient();
  const queryClient = useQueryClient();
  const { resolvedTheme, setTheme } = useTheme();
  const clerkUser = useUser();
  const clerk = useClerk();
  const [activeTab, setActiveTab] = useState<string>('profile');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [emailNotifications, setEmailNotifications] = useState(true);

  const user = useQuery({ queryKey: ['user-profile'], queryFn: () => getUserProfile(client) });
  const organization = useQuery({ queryKey: ['organization'], queryFn: () => getOrganization(client) });
  const consents = useQuery({ queryKey: ['consents'], queryFn: () => getConsents(client) });

  const [profileForm, setProfileForm] = useState<Partial<UserProfile>>({});

  useEffect(() => {
    const clerk = clerkUser.user;
    const backend = user.data;
    setProfileForm({
      first_name: clerk?.firstName ?? backend?.first_name ?? '',
      last_name: clerk?.lastName ?? backend?.last_name ?? '',
      email: clerk?.primaryEmailAddress?.emailAddress ?? backend?.email ?? '',
      job_title: clerk?.unsafeMetadata?.job_title?.toString() ?? backend?.job_title ?? '',
      contact: backend?.contact ?? '',
      country: backend?.country ?? '',
      timezone: backend?.timezone ?? clerk?.unsafeMetadata?.timezone?.toString() ?? Intl.DateTimeFormat().resolvedOptions().timeZone,
      bio: backend?.bio ?? clerk?.unsafeMetadata?.bio?.toString() ?? '',
    });
  }, [user.data, clerkUser.user]);

  const updateProfileMutation = useMutation({
    mutationFn: (data: Partial<UserProfile>) => updateUserProfile(client, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      setSuccess('Profile updated successfully');
      setTimeout(() => setSuccess(''), 3000);
    },
    onError: () => setError('Failed to update profile'),
  });

  const updateOrgMutation = useMutation({
    mutationFn: (data: Partial<Organization>) => updateOrganization(client, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['organization'] });
      setSuccess('Organization updated');
      setTimeout(() => setSuccess(''), 3000);
    },
    onError: () => setError('Failed to update organization'),
  });

  const updateConsentMutation = useMutation({
    mutationFn: ({ consentType, status }: { consentType: string; status: 'granted' | 'denied' }) =>
      updateConsent(client, consentType, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['consents'] }),
  });

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'workspace', label: 'Workspace', icon: Building2 },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'privacy', label: 'Privacy', icon: Shield },
  ];

  function handleProfileChange(field: keyof UserProfile, value: string) {
    setProfileForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleProfileSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = { ...profileForm };
    delete payload.email;
    updateProfileMutation.mutate(payload);
  }

  function handleProfileReset() {
    const clerk = clerkUser.user;
    const backend = user.data;
    setProfileForm({
      first_name: clerk?.firstName ?? backend?.first_name ?? '',
      last_name: clerk?.lastName ?? backend?.last_name ?? '',
      email: clerk?.primaryEmailAddress?.emailAddress ?? backend?.email ?? '',
      job_title: clerk?.unsafeMetadata?.job_title?.toString() ?? backend?.job_title ?? '',
      contact: backend?.contact ?? '',
      country: backend?.country ?? '',
      timezone: backend?.timezone ?? clerk?.unsafeMetadata?.timezone?.toString() ?? Intl.DateTimeFormat().resolvedOptions().timeZone,
      bio: backend?.bio ?? clerk?.unsafeMetadata?.bio?.toString() ?? '',
    });
  }

  function openClerkProfile() {
    if (clerk.openUserProfile) {
      clerk.openUserProfile();
    } else {
      window.open('/app/settings', '_self');
    }
  }

  const planName = 'Pro';

  return (
    <section className="workspace">
      <header className="workspace-header">
        <div>
          <p className="eyebrow">Settings</p>
          <h1>Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your profile, preferences, and workspace settings.</p>
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

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="inline-flex h-auto w-auto p-1 bg-secondary rounded-xl">
          {tabs.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id} className="inline-flex items-center gap-2 px-4 py-2 text-sm">
              <tab.icon size={16} />
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Profile */}
        <TabsContent value="profile">
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
                    <Input label="Job title" value={profileForm.job_title || ''} onChange={(e) => handleProfileChange('job_title', e.target.value)} placeholder="AI Engineer" />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Input label="Contact" value={profileForm.contact || ''} onChange={(e) => handleProfileChange('contact', e.target.value)} placeholder="+1 (555) 000-0000" />
                    <Input label="Country" value={profileForm.country || ''} onChange={(e) => handleProfileChange('country', e.target.value)} placeholder="United States" />
                  </div>
                  <Input label="Timezone" value={profileForm.timezone || ''} onChange={(e) => handleProfileChange('timezone', e.target.value)} />
                  <Textarea label="Bio" value={profileForm.bio || ''} onChange={(e) => handleProfileChange('bio', e.target.value)} placeholder="Tell us about yourself..." rows={3} />
                  <p className="text-xs text-muted-foreground -mt-3">Briefly describe yourself. This will be shown to teammates.</p>

                  <div className="flex items-center gap-3 pt-2">
                    <Button type="submit" disabled={updateProfileMutation.isPending}>
                      {updateProfileMutation.isPending ? 'Saving...' : 'Save changes'}
                    </Button>
                    <Button type="button" variant="outline" onClick={handleProfileReset}>Cancel</Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card className="border-border/60">
                <CardContent className="p-6 flex flex-col items-center text-center relative">
                  <div className="relative mb-4">
                    <div className="w-28 h-28 rounded-full bg-secondary flex items-center justify-center overflow-hidden border-2 border-border">
                      {clerkUser.user?.imageUrl ? (
                        <img src={clerkUser.user.imageUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <User size={40} className="text-muted-foreground" />
                      )}
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      className="absolute bottom-1 right-1 h-8 w-8 rounded-full p-0"
                      onClick={openClerkProfile}
                      title="Edit profile"
                      aria-label="Edit profile"
                    >
                      <Pencil size={14} />
                    </Button>
                  </div>
                  <div className="text-base font-semibold text-foreground">
                    {clerkUser.user?.fullName || `${profileForm.first_name || ''} ${profileForm.last_name || ''}`.trim() || 'Your profile'}
                  </div>
                  <div className="text-sm text-muted-foreground">{clerkUser.user?.primaryEmailAddress?.emailAddress}</div>
                  <Badge variant="secondary" className="mt-2">{planName} plan</Badge>
                </CardContent>
              </Card>

              <Card className="border-border/60">
                <CardHeader>
                  <CardTitle className="text-base text-foreground">Preferences</CardTitle>
                  <p className="text-sm text-muted-foreground">Customize your experience.</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-3">
                      <Bell size={18} className="text-muted-foreground" />
                      <div>
                        <div className="font-medium text-sm text-foreground">Email notifications</div>
                        <div className="text-xs text-muted-foreground">Receive email updates about your activity.</div>
                      </div>
                    </div>
                    <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
                  </div>
                  <div className="flex items-center justify-between py-2 border-t border-border">
                    <div className="flex items-center gap-3">
                      <Moon size={18} className="text-muted-foreground" />
                      <div>
                        <div className="font-medium text-sm text-foreground">Dark mode</div>
                        <div className="text-xs text-muted-foreground">Switch between light and dark themes.</div>
                      </div>
                    </div>
                    <Switch checked={resolvedTheme === 'dark'} onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')} />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="mt-6 flex items-start gap-3 p-4 rounded-xl border border-border bg-card/50">
            <Lock size={18} className="text-muted-foreground mt-0.5" />
            <div>
              <div className="text-sm font-medium text-foreground">Your data is encrypted and secure.</div>
              <div className="text-xs text-muted-foreground">
                We never share your data with third parties. Learn more in our <a href="#" className="text-primary hover:underline">Privacy Policy</a>.
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Workspace */}
        <TabsContent value="workspace">
          <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
            <Card className="border-border/60">
              <CardHeader>
                <CardTitle className="text-base text-foreground">Organization</CardTitle>
                <p className="text-sm text-muted-foreground">Manage your team workspace settings.</p>
              </CardHeader>
              <CardContent>
                {organization.data && (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const formData = new FormData(e.currentTarget);
                      updateOrgMutation.mutate({
                        name: formData.get('name') as string,
                        slug: formData.get('slug') as string,
                        timezone: formData.get('timezone') as string,
                      });
                    }}
                    className="space-y-4 max-w-2xl"
                  >
                    <Input label="Organization Name" name="name" defaultValue={organization.data.name} required />
                    <Input label="Slug" name="slug" defaultValue={organization.data.slug} helperText="Used in URLs and API paths" required />
                    <Input label="Timezone" name="timezone" defaultValue={organization.data.timezone} />
                    <div className="flex justify-end">
                      <Button type="submit" disabled={updateOrgMutation.isPending}>
                        {updateOrgMutation.isPending ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card className="border-border/60">
                <CardHeader>
                  <CardTitle className="text-base text-foreground">API keys</CardTitle>
                  <p className="text-sm text-muted-foreground">Manage access keys for external integrations.</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-card/50">
                    <div className="flex items-center gap-3">
                      <Key size={18} className="text-primary" />
                      <div>
                        <div className="text-sm font-medium text-foreground">Production API key</div>
                        <div className="text-xs text-muted-foreground">Last used 2 hours ago</div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => alert('API key management coming soon')}>Manage</Button>
                  </div>
                  <Button variant="outline" className="w-full" onClick={() => alert('Create new API key coming soon')}>Create new key</Button>
                </CardContent>
              </Card>

              <Card className="border-border/60">
                <CardHeader>
                  <CardTitle className="text-base text-foreground">Danger zone</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-3">
                      <Trash2 size={18} className="text-destructive" />
                      <div>
                        <div className="font-medium text-sm text-destructive">Delete organization</div>
                        <div className="text-xs text-muted-foreground">Permanently delete workspace data.</div>
                      </div>
                    </div>
                    <Button variant="destructive" size="sm" onClick={() => { if (confirm('This will permanently delete the organization. Continue?')) alert('Organization deletion request submitted.'); }}>Delete</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Billing */}
        <TabsContent value="billing">
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="text-base text-foreground">Billing</CardTitle>
              <p className="text-sm text-muted-foreground">Manage your subscription and payment details.</p>
            </CardHeader>
            <CardContent className="space-y-4 max-w-2xl">
              <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-card/50">
                <div>
                  <div className="text-sm font-medium text-foreground">Current plan</div>
                  <div className="text-xs text-muted-foreground">{planName}</div>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/app/billing" className="inline-flex items-center">
                    Manage billing <ArrowRight size={14} className="ml-1" />
                  </Link>
                </Button>
              </div>
              <Input label="Payment Method" defaultValue="Visa ending in 4242" disabled />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Privacy */}
        <TabsContent value="privacy">
          <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
            <Card className="border-border/60">
              <CardHeader>
                <CardTitle className="text-base text-foreground">Privacy & Consent</CardTitle>
              </CardHeader>
              <CardContent>
                {consents.data?.map((consent: ConsentRecord) => (
                  <div key={consent.id} className="flex items-center justify-between py-3 border-b last:border-0">
                    <div>
                      <div className="font-medium text-foreground">{consent.consent_type.replace(/_/g, ' ')}</div>
                      <div className="text-sm text-muted-foreground">Version {consent.version}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={consent.status === 'granted' ? 'success' : 'secondary'}>{consent.status}</Badge>
                      {consent.status === 'granted' ? (
                        <Button variant="ghost" size="sm" onClick={() => updateConsentMutation.mutate({ consentType: consent.consent_type, status: 'denied' })}>
                          Revoke
                        </Button>
                      ) : (
                        <Button variant="ghost" size="sm" onClick={() => updateConsentMutation.mutate({ consentType: consent.consent_type, status: 'granted' })}>
                          Grant
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card className="border-border/60">
                <CardHeader>
                  <CardTitle className="text-base text-foreground">Data & privacy</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-3">
                      <Download size={18} className="text-muted-foreground" />
                      <div>
                        <div className="font-medium text-sm text-foreground">Export data</div>
                        <div className="text-xs text-muted-foreground">Download all your data in a portable format.</div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => {
                      const blob = new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), user: profileForm }, null, 2)], { type: 'application/json' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = 'jt-code-data.json';
                      a.click();
                      URL.revokeObjectURL(url);
                    }}>Export</Button>
                  </div>
                  <div className="flex items-center justify-between py-2 border-t border-border">
                    <div className="flex items-center gap-3">
                      <Trash2 size={18} className="text-destructive" />
                      <div>
                        <div className="font-medium text-sm text-destructive">Delete account</div>
                        <div className="text-xs text-muted-foreground">Permanently delete your account and all data.</div>
                      </div>
                    </div>
                    <Button variant="destructive" size="sm" onClick={() => { if (confirm('This will permanently delete your account and all data. Continue?')) alert('Account deletion request submitted.'); }}>Delete</Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/60">
                <CardHeader>
                  <CardTitle className="text-base text-foreground">Security</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-3">
                      <Key size={18} className="text-muted-foreground" />
                      <div>
                        <div className="font-medium text-sm text-foreground">Password</div>
                        <div className="text-xs text-muted-foreground">Last changed 3 months ago</div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => window.open('/app/settings', '_self')}>Change</Button>
                  </div>
                  <div className="flex items-center justify-between py-2 border-t border-border">
                    <div className="flex items-center gap-3">
                      <Smartphone size={18} className="text-muted-foreground" />
                      <div>
                        <div className="font-medium text-sm text-foreground">Two-factor auth</div>
                        <div className="text-xs text-muted-foreground">Not enabled</div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => alert('Two-factor authentication setup coming soon')}>Enable</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </section>
  );
}
