import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApiClient } from '@/lib/api/client';
import { getPlans, getSubscription, getWallet, getUsage, topupCredits } from '@/features/billing/api';
import { Button, Card, CardContent, CardHeader, CardTitle, Badge, Spinner, Alert, Input, Modal } from '@/shared/components';
import { formatDate, formatBytes, cn } from '@/shared/utils';

export function BillingPage() {
  const client = useApiClient();
  const queryClient = useQueryClient();
  const [showTopupDialog, setShowTopupDialog] = useState(false);
  const [topupAmount, setTopupAmount] = useState(10);
  const [error, setError] = useState('');

  const plans = useQuery({ queryKey: ['plans'], queryFn: () => getPlans(client) });
  const subscription = useQuery({ queryKey: ['subscription'], queryFn: () => getSubscription(client) });
  const wallet = useQuery({ queryKey: ['wallet'], queryFn: () => getWallet(client) });
  const usage = useQuery({ queryKey: ['usage'], queryFn: () => getUsage(client) });

  const topupMutation = useMutation({
    mutationFn: (amount: number) => topupCredits(client, amount),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
      setShowTopupDialog(false);
    },
    onError: (err) => setError('Top-up failed'),
  });

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);
  };

  return (
    <section className="workspace">
      <header className="workspace-header">
        <div>
          <p className="eyebrow">BILLING</p>
          <h1>Billing & Credits</h1>
        </div>
        <Button onClick={() => setShowTopupDialog(true)}>
          <span>➕</span> Add Credits
        </Button>
      </header>

      {error && (
        <Alert variant="destructive" className="mb-4" onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Credit Wallet */}
      {wallet.data && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Credit Wallet</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                <div className="text-sm text-muted-foreground">Available Balance</div>
                <div className="text-3xl font-bold text-primary">{wallet.data.balance.toFixed(2)} credits</div>
              </div>
              <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <div className="text-sm text-muted-foreground">Reserved</div>
                <div className="text-3xl font-bold text-amber-500">{wallet.data.reserved_balance.toFixed(2)} credits</div>
              </div>
              <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                <div className="text-sm text-muted-foreground">Credit Value</div>
                <div className="text-3xl font-bold text-green-500">${wallet.data.credit_value_usd.toFixed(4)} per credit</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Plan */}
      {subscription.data && (
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Current Plan</CardTitle>
              <Badge variant={subscription.data.status === 'active' ? 'success' : 'secondary'}>
                {subscription.data.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xl font-semibold">{subscription.data.plan?.name}</div>
                <div className="text-muted-foreground">{subscription.data.plan?.interval} • {formatCurrency(subscription.data.plan?.price_cents || 0)}</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-muted-foreground">Renews</div>
                <div className="font-medium">{formatDate(subscription.data.current_period_end)}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Available Plans */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Available Plans</CardTitle>
        </CardHeader>
        <CardContent>
          {plans.isLoading ? (
            <div className="flex items-center justify-center py-8"><Spinner size="lg" /></div>
          ) : (
            <div className="grid gap-4 md:grid-cols-3">
              {plans.data?.map((plan) => (
                <Card key={plan.id} className={cn('relative', subscription.data?.plan?.id === plan.id && 'ring-2 ring-primary')}>
                  {plan.is_popular && (
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2">
                      <Badge variant="secondary" className="text-xs">Popular</Badge>
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle>{plan.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold mb-4">{formatCurrency(plan.price_cents)}<span className="text-sm font-normal text-muted-foreground">/{plan.interval}</span></div>
                    <div className="text-2xl font-bold text-primary mb-4">{plan.monthly_credits.toLocaleString()} credits/month</div>
                    <ul className="space-y-2 mb-6">
                      {Object.entries(plan.features || {}).map(([key, value]) => (
                        <li key={key} className="flex items-center gap-2 text-sm">
                          <span className="text-green-500">✓</span>
                          <span>{key.replace(/_/g, ' ')}: {String(value)}</span>
                        </li>
                      ))}
                    </ul>
                    <Button className="w-full" variant={subscription.data?.plan?.id === plan.id ? 'outline' : 'default'} disabled={subscription.data?.plan?.id === plan.id}>
                      {subscription.data?.plan?.id === plan.id ? 'Current Plan' : 'Select Plan'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Usage Stats */}
      {usage.data && (
        <Card>
          <CardHeader>
            <CardTitle>Usage (Last 30 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {Object.entries(usage.data.by_type || {}).map(([type, data]) => (
                <div key={type} className="p-4 rounded-lg bg-muted/30">
                  <div className="text-sm text-muted-foreground">{type.replace(/_/g, ' ')}</div>
                  <div className="text-2xl font-bold">{data.total_credits.toFixed(2)} credits</div>
                  <div className="text-xs text-muted-foreground">{data.count} operations</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top-up Modal */}
      <Modal
        isOpen={showTopupDialog}
        onClose={() => setShowTopupDialog(false)}
        title="Add Credits"
        description="Purchase additional credits for your account"
      >
        <div className="space-y-4">
          <Input
            label="Amount (USD)"
            type="number"
            min="5"
            max="1000"
            step="5"
            value={topupAmount}
            onChange={(e) => setTopupAmount(parseInt(e.target.value) || 0)}
          />
          <div className="p-4 rounded-lg bg-muted/30">
            <div className="text-sm text-muted-foreground">Estimated Credits</div>
            <div className="text-2xl font-bold text-primary">
              {(topupAmount / 0.01).toLocaleString()} credits
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setShowTopupDialog(false)}>Cancel</Button>
            <Button onClick={() => topupMutation.mutate(topupAmount)} disabled={topupMutation.isPending}>
              {topupMutation.isPending ? <Spinner size="sm" /> : `Add $${topupAmount} Credits`}
            </Button>
          </div>
        </div>
      </Modal>
    </section>
  );
}