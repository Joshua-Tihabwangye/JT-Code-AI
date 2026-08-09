import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApiClient } from '@/lib/api/client';
import { listConnectors, listConnectorAccounts, createConnectorAccount, testConnectorAccount } from '@/features/integrations/api';
import { Button, Card, CardContent, CardHeader, CardTitle, Badge, Spinner, Alert, Modal, Input } from '@/shared/components';
import { cn } from '@/shared/utils';

export function IntegrationsPage() {
  const client = useApiClient();
  const queryClient = useQueryClient();
  const [showConnectDialog, setShowConnectDialog] = useState<string | null>(null);
  const [error, setError] = useState('');

  const connectors = useQuery({ queryKey: ['connectors'], queryFn: () => listConnectors(client) });
  const accounts = useQuery({ queryKey: ['connector-accounts'], queryFn: () => listConnectorAccounts(client) });

  const connectMutation = useMutation({
    mutationFn: ({ connectorId, config }: { connectorId: string; config: Record<string, unknown> }) =>
      createConnectorAccount(client, connectorId, config),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connector-accounts'] });
      setShowConnectDialog(null);
    },
    onError: () => setError('Failed to connect account'),
  });

  const testMutation = useMutation({
    mutationFn: (accountId: string) => testConnectorAccount(client, accountId),
    onError: () => setError('Connection test failed'),
  });

  return (
    <section className="workspace">
      <header className="workspace-header">
        <div>
          <p className="eyebrow">INTEGRATIONS</p>
          <h1>Integrations</h1>
        </div>
      </header>

      {error && (
        <Alert variant="destructive" className="mb-4" onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Connected Accounts */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Connected Accounts</CardTitle>
        </CardHeader>
        <CardContent>
          {accounts.isLoading ? (
            <div className="flex items-center justify-center py-8"><Spinner size="lg" /></div>
          ) : accounts.data?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No connected accounts yet</p>
              <p className="text-sm mt-1">Connect your first service from the Available Integrations below</p>
            </div>
          ) : (
            <div className="space-y-3">
              {accounts.data?.map((account) => (
                <div key={account.id} className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <span className="text-xl">{account.connector.icon || '🔗'}</span>
                    </div>
                    <div>
                      <div className="font-medium">{account.name}</div>
                      <div className="text-sm text-muted-foreground">{account.connector.name}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={account.status === 'active' ? 'success' : account.status === 'error' ? 'destructive' : 'secondary'}>
                      {account.status}
                    </Badge>
                    <Button variant="ghost" size="sm" onClick={() => testMutation.mutate(account.id)} disabled={testMutation.isPending}>
                      Test
                    </Button>
                    <Button variant="ghost" size="sm">Configure</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Available Integrations */}
      <Card>
        <CardHeader>
          <CardTitle>Available Integrations</CardTitle>
        </CardHeader>
        <CardContent>
          {connectors.isLoading ? (
            <div className="flex items-center justify-center py-8"><Spinner size="lg" /></div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {connectors.data?.map((connector) => {
                const isConnected = accounts.data?.some(a => a.connector_id === connector.id);
                return (
                  <Card key={connector.id} className={cn('cursor-pointer transition-all hover:shadow-md', isConnected && 'ring-2 ring-primary/50')}>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="p-3 rounded-xl bg-primary/10 text-primary text-2xl">
                          {connector.icon || '🔗'}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold">{connector.name}</h4>
                          <p className="text-sm text-muted-foreground mt-1">{connector.description}</p>
                          <div className="flex flex-wrap gap-1 mt-3">
                            {connector.category && <Badge variant="outline" className="text-xs">{connector.category}</Badge>}
                            {connector.auth_type && <Badge variant="secondary" className="text-xs">{connector.auth_type}</Badge>}
                          </div>
                        </div>
                      </div>
                      {isConnected ? (
                        <Button variant="outline" className="w-full mt-4" disabled>Already Connected</Button>
                      ) : (
                        <Button className="w-full mt-4" onClick={() => setShowConnectDialog(connector.id)}>
                          Connect
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Connect Modal */}
      {showConnectDialog && (
        <Modal
          isOpen={!!showConnectDialog}
          onClose={() => setShowConnectDialog(null)}
          title="Connect Account"
          description="Enter your credentials to connect this service"
        >
          <div className="space-y-4">
            <Alert variant="default">
              <p className="text-sm">This would open the OAuth flow or ask for API credentials depending on the service.</p>
            </Alert>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setShowConnectDialog(null)}>Cancel</Button>
              <Button onClick={() => connectMutation.mutate({ connectorId: showConnectDialog!, config: {} })} disabled={connectMutation.isPending}>
                {connectMutation.isPending ? <Spinner size="sm" /> : 'Connect'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </section>
  );
}