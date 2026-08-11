import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useUser, useClerk } from '@clerk/react';
import { useApiClient } from '@/lib/api/client';
import { getUserProfile, updateUserProfile, getOrganization, updateOrganization, getConsents, updateConsent } from '@/features/settings/api';
import { Button, Input, Textarea, Card, CardContent, CardHeader, CardTitle, Alert, Badge, Tabs, TabsList, TabsTrigger, TabsContent, Switch } from '@/shared/components';
import { formatDate } from '@/shared/utils';
import {
  User,
  Building2,
  CreditCard,
  Shield,
  Bell,
  Moon,
  Monitor,
  Download,
  Trash2,
  Check,
  Pencil,
  Lock,
  ArrowRight,
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
  const [localPrefs, setLocalPrefs] = useState({
    emailNotifications: true,
    pushNotifications: true,
    appearance: 'light' as 'light' | 'dark' | 'system',
    usageSharing: false,
    aiTrainingAllowed: false,
  });

  const user = useQuery({ queryKey: ['user-profile'], queryFn: () => getUserProfile(client) });
  const organization = useQuery({ queryKey: ['organization'], queryFn: () => getOrganization(client) });
  const consents = useQuery({ queryKey: ['consents'], queryFn: () => getConsents(client) });

  const [profileForm, setProfileForm] = useState<Partial<UserProfile>>({});

  useEffect(() => {
    if (user.data) {
      setProfileForm({
        first_name: user.data.first_name || '',
        last_name: user.data.last_name || '',
        contact: user.data.contact || '',
        country: user.data.country || '',
        email: user.data.email || '',
        job_title: user.data.job_title || '',
        timezone: user.data.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
        bio: user.data.bio || '',
      });
    }
  }, [user.data]);

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
      queryClient.invalidateQueries({ queryKey: ['organization'] });
      setSuccess('Workspace updated');
      setTimeout(() => setSuccess(''), 3000);
    },
    onError: () => setError('Failed to update workspace'),
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

  const handleProfileChange = (field: keyof UserProfile, value: string) => {
    setProfileForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(profileForm);
  };

  const handleProfileReset = () => {
    if (!user.data) return;
    setProfileForm({
      first_name: user.data.first_name || '',
      last_name: user.data.last_name || '',
      contact: user.data.contact || '',
      country: user.data.country || '',
      email: user.data.email || '',
      job_title: user.data.job_title || '',
      timezone: user.data.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
      bio: user.data.bio || '',
    });
  };

  const planName = 'Pro'; // Could be pulled from billing subscription if needed.

  return (
    <div className="page-container">
      <header className="workspace-header mb-6">
        <div>
          <p className="eyebrow">SETTINGS</p>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
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
        <TabsList className="inline-flex h-auto w-auto p-1 bg-muted rounded-lg">
          {tabs.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id} className="inline-flex items-center gap-2 px-4 py-2 text-sm">
              <tab.icon size={16} />
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* ===== Profile Tab ===== */}
        <TabsContent value="profile">
          <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Profile information</CardTitle>
                <p className="text-sm text-muted-foreground">Update your personal details and how others see you.</p>
              </CardHeader>
              <CardContent>
                {user.data && (
                  <form onSubmit={handleProfileSubmit} className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-6 mb-6">
                      <div className="relative">
                        <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center overflow-hidden border">
                          {user.data.avatar_url ? (
                            <img src={user.data.avatar_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <User size={32} className="text-muted-foreground" />
                          )}
                        </div>
                        <button
                          type="button"
                          className="absolute bottom-0 right-0 p-1.5 rounded-full bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
                          title="Change avatar"
                        >
                          <Pencil size={12} />
                        </button>
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-foreground">{user.data.name || 'Your profile'}</div>
                        <div className="text-xs text-muted-foreground">{planName} plan</div>
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <Input
                        label="First name"
                        value={profileForm.first_name || ''}
                        onChange={(e) => handleProfileChange('first_name', e.target.value)}
                      />
                      <Input
                        label="Last name"
                        value={profileForm.last_name || ''}
                        onChange={(e) => handleProfileChange('last_name', e.target.value)}
                      />
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <Input
                        label="Contact"
                        value={profileForm.contact || ''}
                        onChange={(e) => handleProfileChange('contact', e.target.value)}
                        placeholder="+1 (555) 000-0000"
                      />
                      <Input
                        label="Country"
                        value={profileForm.country || ''}
                        onChange={(e) => handleProfileChange('country', e.target.value)}
                        placeholder="United States"
                      />
                    </div>
                    <Input
                      label="Email address"
                      type="email"
                      value={profileForm.email || ''}
                      onChange={(e) => handleProfileChange('email', e.target.value)}
                      required
                    />
                    <Input
                      label="Job title"
                      value={profileForm.job_title || ''}
                      onChange={(e) => handleProfileChange('job_title', e.target.value)}
                      placeholder="AI Engineer"
                    />
                    <Input
                      label="Timezone"
                      value={profileForm.timezone || ''}
                      onChange={(e) => handleProfileChange('timezone', e.target.value)}
                    />
                    <Textarea
                      label="Bio"
                      value={profileForm.bio || ''}
                      onChange={(e) => handleProfileChange('bio', e.target.value)}
                      placeholder="Tell us about yourself..."
                      rows={3}
                    />
                    <p className="text-xs text-muted-foreground">Briefly describe yourself. This will be shown to teammates.</p>

                    <div className="flex items-center gap-3 pt-2">
                      <Button
                        type="submit"
                        disabled={updateProfileMutation.isPending}
                      >
                        {updateProfileMutation.isPending ? 'Saving...' : 'Save changes'}
                      </Button>
                      <Button type="button" variant="outline" onClick={handleProfileReset}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Preferences</CardTitle>
                  <p className="text-sm text-muted-foreground">Customize your experience.</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-3">
                      <Bell size={18} className="text-muted-foreground" />
                      <div>
                        <div className="font-medium text-sm">Email notifications</div>
                        <div className="text-xs text-muted-foreground">Receive email updates about your activity.</div>
                      </div>
                    </div>
                    <Switch
                      checked={localPrefs.emailNotifications}
                      onCheckedChange={(checked) => setLocalPrefs({ ...localPrefs, emailNotifications: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between py-2 border-t">
                    <div className="flex items-center gap-3">
                      <Moon size={18} className="text-muted-foreground" />
                      <div>
                        <div className="font-medium text-sm">Dark mode</div>
                        <div className="text-xs text-muted-foreground">Switch between light and dark themes.</div>
                      </div>
                    </div>
                    <Switch
                      checked={localPrefs.appearance === 'dark'}
                      onCheckedChange={(checked) => setLocalPrefs({ ...localPrefs, appearance: checked ? 'dark' : 'light' })}
                    />
                  </div>
                  <div className="flex items-center justify-between py-2 border-t">
                    <div className="flex items-center gap-3">
                      <Monitor size={18} className="text-muted-foreground" />
                      <div>
                        <div className="font-medium text-sm">Improve JT-Code</div>
                        <div className="text-xs text-muted-foreground">Help us improve by sharing anonymous usage data.</div>
                      </div>
                    </div>
                    <Switch
                      checked={localPrefs.usageSharing}
                      onCheckedChange={(checked) => setLocalPrefs({ ...localPrefs, usageSharing: checked })}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Data & privacy</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-3">
                      <Download size={18} className="text-muted-foreground" />
                      <div>
                        <div className="font-medium text-sm">Export data</div>
                        <div className="text-xs text-muted-foreground">Download all your data in a portable format.</div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">Export</Button>
                  </div>
                  <div className="flex items-center justify-between py-2 border-t">
                    <div className="flex items-center gap-3">
                      <Trash2 size={18} className="text-destructive" />
                      <div>
                        <div className="font-medium text-sm text-destructive">Delete account</div>
                        <div className="text-xs text-muted-foreground">Permanently delete your account and all data.</div>
                      </div>
                    </div>
                    <Button variant="destructive" size="sm">Delete</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="mt-6 flex items-start gap-3 p-4 rounded-lg border bg-muted/20">
            <Lock size={18} className="text-muted-foreground mt-0.5" />
            <div>
              <div className="text-sm font-medium">Your data is encrypted and secure.</div>
              <div className="text-xs text-muted-foreground">
                We never share your data with third parties. Learn more in our <a href="#" className="text-primary hover:underline">Privacy Policy</a>.
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ===== Workspace Tab ===== */}
        <TabsContent value="workspace">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Workspace</CardTitle>
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
                  <Input label="Workspace Name" name="name" defaultValue={organization.data.name} required />
                  <Input
                    label="Slug"
                    name="slug"
                    defaultValue={organization.data.slug}
                    helperText="Used in URLs and API paths"
                    required
                  />
                  <Input label="Timezone" name="timezone" defaultValue={organization.data.timezone} />
                  <div className="flex justify-end">
                    <Button type="submit" disabled={updateOrgMutation.isPending}>
                      {updateOrgMutation.isPending ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                  <div className="text-base font-semibold text-foreground">
                    {clerkUser.user?.fullName || `${profileForm.first_name || ''} ${profileForm.last_name || ''}`.trim() || 'Your profile'}
                  </div>
                  <div className="text-sm text-muted-foreground">{clerkUser.user?.primaryEmailAddress?.emailAddress}</div>
                  <Badge variant="secondary" className="mt-2">{planName} plan</Badge>
                </CardContent>
              </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-base">Members</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-muted-foreground">Member management coming soon</div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===== Billing Tab ===== */}
        <TabsContent value="billing">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Billing</CardTitle>
              <p className="text-sm text-muted-foreground">Manage your subscription and payment details.</p>
            </CardHeader>
            <CardContent className="space-y-4 max-w-2xl">
              <div className="flex items-center justify-between p-4 rounded-lg border">
                <div>
                  <div className="text-sm font-medium">Current plan</div>
                  <div className="text-xs text-muted-foreground">{planName}</div>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <a href="/app/billing">Manage billing <ArrowRight size={14} className="ml-1" /></a>
                </Button>
              </div>
              <Input label="Payment Method" defaultValue="Visa ending in 4242" disabled />
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===== Privacy Tab ===== */}
        <TabsContent value="privacy">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Privacy & Consent</CardTitle>
            </CardHeader>
            <CardContent>
              {consents.data?.map((consent: ConsentRecord) => (
                <div key={consent.id} className="flex items-center justify-between py-3 border-b last:border-0">
                  <div>
                    <div className="font-medium">{consent.consent_type.replace(/_/g, ' ')}</div>
                    <div className="text-sm text-muted-foreground">Version {consent.version}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={consent.status === 'granted' ? 'success' : 'secondary'}>
                      {consent.status}
                    </Badge>
                    {consent.status === 'granted' ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => updateConsentMutation.mutate({ consentType: consent.consent_type, status: 'denied' })}
                      >
                        Revoke
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => updateConsentMutation.mutate({ consentType: consent.consent_type, status: 'granted' })}
                      >
                        Grant
                      </Button>
                    )}
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

          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-base">Data Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <Download size={18} className="text-muted-foreground" />
                    <div>
                      <div className="font-medium">Export My Data</div>
                      <div className="text-sm text-muted-foreground">Download all your data in a portable format</div>
                    </div>
                  </div>
                  <Button variant="outline">Export Data</Button>
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg border border-destructive/20 bg-destructive/5">
                  <div className="flex items-center gap-3">
                    <Trash2 size={18} className="text-destructive" />
                    <div>
                      <div className="font-medium text-destructive">Delete My Account</div>
                      <div className="text-sm text-muted-foreground">Permanently delete your account and all data</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
