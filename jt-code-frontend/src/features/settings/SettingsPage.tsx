import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react_query';
import { useApiClient } from '@/lib/api/client';
import { getUserProfile, updateUserProfile, getOrganization, updateOrganization, getConsents, updateConsent } from '@/features/settings/api';
import { Button, Input, Card, CardContent, CardHeader, CardTitle, Alert, Badge, Tabs, TabsList, TabsTrigger, TabsContent, Switch } from '@/shared/components';
import { formatDate } from '@/shared/utils';

export function SettingsPage() {
  const client = useApiClient();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'profile' | 'organization' | 'billing' | 'integrations' | 'privacy'>('profile');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const user = useQuery({ queryKey: ['user-profile'], queryFn: () => getUserProfile(client) });
  const organization = useQuery({ queryKey: ['organization'], queryFn: () => getOrganization(client) });
  const consents = useQuery({ queryKey: ['consents'], queryFn: () => getConsents(client) });

  const updateProfileMutation = useMutation({
    mutationFn: (data: { name: string; email: string; timezone: string; locale: string }) => updateUserProfile(client, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      setSuccess('Profile updated successfully');
      setTimeout(() => setSuccess(''), 3000);
    },
    onError: () => setError('Failed to update profile'),
  });

  const updateOrgMutation = useMutation({
    mutationFn: (data: { name: string; slug: string; timezone: string }) => updateOrganization(client, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization'] });
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
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'organization', label: 'Organization', icon: '🏢' },
    { id: 'billing', label: 'Billing', icon: '💳' },
    { id: 'integrations', label: 'Integrations', icon: '🔗' },
    { id: 'privacy', label: 'Privacy', icon: '🔒' },
  ];

  return (
    <section className="workspace">
      <header className="workspace-header">
        <div>
          <p className="eyebrow">SETTINGS</p>
          <h1>Settings</h1>
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
        <TabsList className="grid grid-cols-5">
          {tabs.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id} className="gap-2">
              <span>{tab.icon}</span> {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
            </CardHeader>
            <CardContent>
              {user.data && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    updateProfileMutation.mutate({
                      name: formData.get('name') as string,
                      email: formData.get('email') as string,
                      timezone: formData.get('timezone') as string,
                      locale: formData.get('locale') as string,
                    });
                  }}
                  className="space-y-4 max-w-md"
                >
                  <div className="grid gap-4 md:grid-cols-2">
                    <Input
                      label="Name"
                      name="name"
                      defaultValue={user.data.name}
                      required
                    />
                    <Input
                      label="Email"
                      name="email"
                      type="email"
                      defaultValue={user.data.email}
                      required
                    />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Input
                      label="Timezone"
                      name="timezone"
                      defaultValue={user.data.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone}
                    />
                    <Input
                      label="Locale"
                      name="locale"
                      defaultValue={user.data.locale || navigator.language}
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button type="submit" disabled={updateProfileMutation.isPending}>
                      {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="organization">
          <Card>
            <CardHeader>
              <CardTitle>Organization</CardTitle>
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
                  className="space-y-4 max-w-md"
                >
                  <Input
                    label="Organization Name"
                    name="name"
                    defaultValue={organization.data.name}
                    required
                  />
                  <Input
                    label="Slug"
                    name="slug"
                    defaultValue={organization.data.slug}
                    helperText="Used in URLs and API paths"
                    required
                  />
                  <Input
                    label="Timezone"
                    name="timezone"
                    defaultValue={organization.data.timezone}
                  />
                  <div className="flex justify-end">
                    <Button type="submit" disabled={updateOrgMutation.isPending}>
                      {updateOrgMutation.isPending ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Members</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-muted-foreground">Member management coming soon</div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing">
          <Card>
            <CardHeader>
              <CardTitle>Billing</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-muted-foreground">Billing settings coming soon</div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations">
          <Card>
            <CardHeader>
              <CardTitle>Connected Integrations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-muted-foreground">Integration management coming soon</div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy">
          <Card>
            <CardHeader>
              <CardTitle>Privacy & Consent</CardTitle>
            </CardHeader>
            <CardContent>
              {consents.data?.map((consent) => (
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

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Data Export & Deletion</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div>
                    <div className="font-medium">Export My Data</div>
                    <div className="text-sm text-muted-foreground">Download all your data in a portable format</div>
                  </div>
                  <Button variant="outline">Export Data</Button>
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg border border-destructive/20 bg-destructive/5">
                  <div>
                    <div className="font-medium text-destructive">Delete My Account</div>
                    <div className="text-sm text-muted-foreground">Permanently delete your account and all data</div>
                  </div>
                  <Button variant="destructive">Delete Account</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </section>
  );
}