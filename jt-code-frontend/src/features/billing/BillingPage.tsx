import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApiClient } from '@/lib/api/client';
import { getPlans, getSubscription, getWallet, getUsage, topupCredits } from '@/features/billing/api';
import { Button, Card, CardContent, CardHeader, CardTitle, Badge, Spinner, Alert, Input, Modal } from '@/shared/components';
import { formatDate, cn } from '@/shared/utils';
import {
  Crown,
  Coins,
  TrendingUp,
  CalendarDays,
  CreditCard,
  Download,
  Check,
  Sparkles,
  MoreHorizontal,
} from 'lucide-react';
import type { Plan, Subscription, Wallet, Usage } from '@/features/billing/api';

export function BillingPage() {
  const client = useApiClient();
  const queryClient = useQueryClient();
  const [showTopupDialog, setShowTopupDialog] = useState(false);
  const [topupAmount, setTopupAmount] = useState(10);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const plans = useQuery({ queryKey: ['plans'], queryFn: () => getPlans(client) });
  const subscription = useQuery({ queryKey: ['subscription'], queryFn: () => getSubscription(client) });
  const wallet = useQuery({ queryKey: ['wallet'], queryFn: () => getWallet(client) });
  const usage = useQuery({ queryKey: ['usage'], queryFn: () => getUsage(client) });

  const topupMutation = useMutation({
    mutationFn: (amount: number) => topupCredits(client, amount),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
      queryClient.invalidateQueries({ queryKey: ['usage'] });
      setShowTopupDialog(false);
      setSuccess('Credits added successfully');
      setTimeout(() => setSuccess(''), 3000);
    },
    onError: () => setError('Top-up failed'),
  });

  const formatCurrency = (cents: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);

  const limit = subscription.data?.plan?.monthly_credits ?? 0;
  const used = usage.data?.total_credits ?? 0;
  const usagePercent = limit > 0 ? Math.min(100, Math.max(0, (used / limit) * 100)) : 0;

  const summaryCards = [
    {
      icon: Crown,
      label: 'Current plan',
      value: subscription.data?.plan?.name || 'Free',
      action: { label: 'Manage plan →', onClick: () => {} },
      accent: 'text-foreground',
    },
    {
      icon: Coins,
      label: 'Available credits',
      value: `${(wallet.data?.balance ?? 0).toLocaleString()} credits`,
      action: { label: 'Add credits →', onClick: () => setShowTopupDialog(true) },
      accent: 'text-foreground',
    },
    {
      icon: TrendingUp,
      label: 'Usage this month',
      value: `${used.toLocaleString()} credits`,
      helper: limit > 0 ? `${usagePercent.toFixed(0)}% of ${limit.toLocaleString()} used` : undefined,
      action: undefined,
      accent: 'text-foreground',
    },
    {
      icon: CalendarDays,
      label: 'Renews on',
      value: subscription.data ? formatDate(subscription.data.current_period_end) : '—',
      helper: subscription.data ? 'In 18 days' : undefined,
      action: undefined,
      accent: 'text-foreground',
    },
  ];

  const planDescription: Record<string, string> = {
    Free: 'For individuals getting started',
    Pro: 'For professionals and power users',
    Team: 'For teams and organizations',
    Business: 'For teams and organizations',
  };

  const invoices = [
    { date: 'Aug 10, 2024', description: 'Pro Plan – Monthly', amount: '$20.00', status: 'Paid' },
    { date: 'Jul 10, 2024', description: 'Pro Plan – Monthly', amount: '$20.00', status: 'Paid' },
  ];

  return (
    <div className="page-container">
      <header className="workspace-header mb-6">
        <div>
          <p className="eyebrow">BILLING</p>
          <h1 className="text-2xl font-bold text-foreground">Billing & Credits</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your plan, credits, and payment details. Add credits anytime to keep building without limits.
          </p>
        </div>
        <Button onClick={() => setShowTopupDialog(true)}>
          <Sparkles size={16} className="mr-2" />
          Add credits
        </Button>
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

      {/* Summary cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {summaryCards.map((card) => (
          <Card key={card.label} className="relative overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="text-sm text-muted-foreground">{card.label}</div>
                <div className="p-2 rounded-lg bg-muted/50">
                  <card.icon size={18} className="text-muted-foreground" />
                </div>
              </div>
              <div className={cn('text-lg font-semibold mb-1', card.accent)}>{card.value}</div>
              {card.helper && <div className="text-xs text-muted-foreground">{card.helper}</div>}
              {card.action && (
                <button
                  type="button"
                  onClick={card.action.onClick}
                  className="mt-3 text-sm font-medium text-primary hover:text-primary/80"
                >
                  {card.action.label}
                </button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Plans */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Choose the plan that&apos;s right for you</h2>
          <div className="text-xs text-muted-foreground hidden sm:block">
            All plans include: Secure billing, cancel anytime, 99.9% uptime
          </div>
        </div>
        {plans.isLoading ? (
          <div className="flex items-center justify-center py-8"><Spinner size="lg" /></div>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            {plans.data?.map((plan: Plan) => {
              const isCurrent = subscription.data?.plan?.id === plan.id;
              const features = Object.entries(plan.features || {});
              return (
                <Card
                  key={plan.id}
                  className={cn(
                    'relative flex flex-col transition-shadow hover:shadow-md',
                    isCurrent && 'ring-2 ring-primary'
                  )}
                >
                  {plan.is_popular && (
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground text-xs">Recommended</Badge>
                    </div>
                  )}
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">{plan.name}</CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">
                      {planDescription[plan.name] || 'For growing users'}
                    </p>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col">
                    <div className="flex items-baseline gap-1 mb-4">
                      <span className="text-3xl font-bold">{formatCurrency(plan.price_cents)}</span>
                      <span className="text-sm text-muted-foreground">/{plan.interval}</span>
                    </div>
                    <ul className="space-y-2 mb-6 flex-1">
                      {features.length > 0 ? (
                        features.map(([key, value]) => (
                          <li key={key} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <Check size={14} className="mt-0.5 text-primary flex-shrink-0" />
                            <span>{key.replace(/_/g, ' ')}: {String(value)}</span>
                          </li>
                        ))
                      ) : (
                        <li className="flex items-start gap-2 text-sm text-muted-foreground">
                          <Check size={14} className="mt-0.5 text-primary flex-shrink-0" />
                          <span>{plan.monthly_credits.toLocaleString()} credits / month</span>
                        </li>
                      )}
                    </ul>
                    <Button
                      className="w-full"
                      variant={isCurrent ? 'outline' : 'default'}
                      disabled={isCurrent}
                    >
                      {isCurrent ? 'Current Plan' : plan.name === 'Free' ? 'Current Plan' : `Manage Plan`}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Payment method + Invoices */}
      <div className="grid gap-6 lg:grid-cols-2 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Payment method</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 p-4 rounded-lg border">
              <div className="p-2 rounded-lg bg-muted/30">
                <CreditCard size={22} className="text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Visa •••• 4242</span>
                  <Badge variant="secondary" className="text-[10px]">Default</Badge>
                </div>
                <div className="text-sm text-muted-foreground">Expires 08 / 2026</div>
              </div>
              <Button variant="outline" size="sm">Update</Button>
              <button type="button" className="p-2 rounded-md hover:bg-muted text-muted-foreground">
                <MoreHorizontal size={16} />
              </button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Recent invoices</CardTitle>
            <button type="button" className="text-sm font-medium text-primary hover:text-primary/80 flex items-center gap-1">
              View all invoices <span>→</span>
            </button>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-muted-foreground border-b">
                    <th className="pb-2 font-medium">Date</th>
                    <th className="pb-2 font-medium">Description</th>
                    <th className="pb-2 font-medium">Amount</th>
                    <th className="pb-2 font-medium">Status</th>
                    <th className="pb-2 font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((invoice, index) => (
                    <tr key={index} className="border-b last:border-0">
                      <td className="py-3 text-muted-foreground">{invoice.date}</td>
                      <td className="py-3 font-medium">{invoice.description}</td>
                      <td className="py-3">{invoice.amount}</td>
                      <td className="py-3">
                        <Badge variant="success" className="text-xs">{invoice.status}</Badge>
                      </td>
                      <td className="py-3 text-right">
                        <button type="button" className="p-1.5 rounded-md hover:bg-muted text-muted-foreground">
                          <Download size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

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
            <div className="text-2xl font-bold text-primary mt-1">
              {(topupAmount / 0.01).toLocaleString()} credits
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setShowTopupDialog(false)}>Cancel</Button>
            <Button
              onClick={() => topupMutation.mutate(topupAmount)}
              disabled={topupMutation.isPending}
            >
              {topupMutation.isPending ? <Spinner size="sm" /> : `Add $${topupAmount} Credits`}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
