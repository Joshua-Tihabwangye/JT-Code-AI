import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApiClient } from '@/lib/api/client';
import { getPlans, getSubscription, getWallet, getUsage, topupCredits } from '@/features/billing/api';
import { Button, Card, CardContent, CardHeader, CardTitle, Badge, Spinner, Alert, Input, Modal } from '@/shared/components';
import { formatDate } from '@/shared/utils';
import {
  Crown,
  Coins,
  TrendingUp,
  CalendarDays,
  CreditCard,
  Download,
  Check,
  Plus,
  MoreHorizontal,
  ShieldCheck,
} from 'lucide-react';
import type { Plan } from '@/features/billing/api';

const planDescriptions: Record<string, string> = {
  Free: 'For individuals getting started',
  Pro: 'For professionals and power users',
  Team: 'For teams and organizations',
  Business: 'For scaling teams',
};

const planFeatures: Record<string, string[]> = {
  Free: ['1,000 credits / month', 'Access to GPT-4o mini', 'Basic AI tools', 'Community support'],
  Pro: ['2,000 credits / month', 'Access to GPT-4o', 'Advanced AI tools', 'Priority support', 'Early access to new features'],
  Team: ['5,000 credits / user / month', 'Access to GPT-4o', 'Team workspace', 'Advanced admin controls', 'Priority support & SLA'],
  Business: ['Custom credits', 'Dedicated support', 'SSO & audit logs', 'Custom AI models', 'SLA guarantee'],
};

const defaultPlans: Plan[] = [
  { id: 'free', name: 'Free', slug: 'free', price_cents: 0, currency: 'USD', interval: 'month', monthly_credits: 1000, features: {}, is_popular: false },
  { id: 'pro', name: 'Pro', slug: 'pro', price_cents: 2000, currency: 'USD', interval: 'month', monthly_credits: 2000, features: {}, is_popular: true },
  { id: 'team', name: 'Team', slug: 'team', price_cents: 4900, currency: 'USD', interval: 'month', monthly_credits: 5000, features: {}, is_popular: false },
];

export function BillingPage() {
  const client = useApiClient();
  const queryClient = useQueryClient();
  const [showTopupDialog, setShowTopupDialog] = useState(false);
  const [showInvoicesDialog, setShowInvoicesDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
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
      void queryClient.invalidateQueries({ queryKey: ['wallet'] });
      void queryClient.invalidateQueries({ queryKey: ['subscription'] });
      void queryClient.invalidateQueries({ queryKey: ['usage'] });
      setShowTopupDialog(false);
      setSuccess('Credits added successfully');
      setTimeout(() => setSuccess(''), 3000);
    },
    onError: () => setError('Top-up failed'),
  });

  const formatCurrency = (cents: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);

  const currentPlan = (plans.data && subscription.data?.plan
    ? plans.data.find((plan) => plan.id === subscription.data?.plan || plan.slug === subscription.data?.plan_slug)
    : undefined);
  const limit = currentPlan?.monthly_credits ?? 0;
  const used = usage.data?.total_credits ?? 0;
  const usagePercent = limit > 0 ? Math.min(100, Math.max(0, (used / limit) * 100)) : 0;
  const remainingCredits = Math.max(0, limit - used);

  const summaryCards = [
    {
      icon: Crown,
      label: 'Current plan',
      value: subscription.data?.plan_name || currentPlan?.name || 'Free',
      action: 'Manage plan →',
      tint: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-950/30',
    },
    {
      icon: Coins,
      label: 'Available credits',
      value: `${(wallet.data?.balance ?? 0).toLocaleString()} credits`,
      action: 'Add credits →',
      tint: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    },
    {
      icon: TrendingUp,
      label: 'Usage this month',
      value: `${used.toLocaleString()} credits`,
      helper: limit > 0 ? `${usagePercent.toFixed(0)}% of ${limit.toLocaleString()} used` : undefined,
      tint: 'text-violet-600 dark:text-violet-400',
      bg: 'bg-violet-50 dark:bg-violet-950/30',
    },
    {
      icon: CalendarDays,
      label: 'Renews on',
      value: subscription.data ? formatDate(subscription.data.current_period_end) : '—',
      helper: subscription.data ? 'At the end of your billing period' : undefined,
      tint: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-950/30',
    },
  ];

  const invoices = [
    { date: 'Aug 10, 2024', description: 'Pro Plan – Monthly', amount: '$20.00', status: 'Paid' },
    { date: 'Jul 10, 2024', description: 'Pro Plan – Monthly', amount: '$20.00', status: 'Paid' },
  ];

  return (
    <section className="workspace">
      <header className="workspace-header">
        <div>
          <p className="eyebrow">Billing</p>
          <h1 className="text-foreground">Billing & Credits</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your plan, credits, and payment details. Add credits anytime to keep building without limits.
          </p>
        </div>
        <Button
          onClick={() => setShowTopupDialog(true)}
          className="gap-1.5 bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500"
        >
          <Plus size={16} />
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
          <Card key={card.label} className="border border-border/60 shadow-sm hover:shadow-md transition-shadow rounded-xl">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <span className="text-sm text-muted-foreground">{card.label}</span>
                <div className={`p-2 rounded-lg ${card.bg} ${card.tint}`}>
                  <card.icon size={18} />
                </div>
              </div>
              <div className="text-lg font-semibold text-foreground">{card.value}</div>
              {card.helper && <div className="text-xs text-muted-foreground mt-1">{card.helper}</div>}
              {card.action && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-3 h-auto px-0 py-0 text-sm font-semibold text-blue-600 hover:text-blue-700 hover:bg-transparent dark:text-blue-400 dark:hover:text-blue-300"
                  onClick={() => {
                    if (card.label === 'Available credits') setShowTopupDialog(true);
                    else if (card.label === 'Current plan') {
                      document.getElementById('billing-plans')?.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                >
                  {card.action}
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Usage bar */}
      <Card className="mb-8 border border-border/60 shadow-sm rounded-xl">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-sm font-medium text-foreground">Credits usage</div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {used.toLocaleString()} used of {limit.toLocaleString()} this month
              </div>
            </div>
            <div className="text-sm font-semibold text-foreground">{remainingCredits.toLocaleString()} left</div>
          </div>
          <div className="h-2.5 w-full rounded-full bg-secondary overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-violet-500 transition-all duration-500"
              style={{ width: `${usagePercent}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Plans */}
      <div id="billing-plans" className="mb-8">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-foreground">Choose the plan that&apos;s right for you</h2>
          <div className="text-xs text-muted-foreground hidden sm:flex items-center gap-1">
            <ShieldCheck size={12} />
            All plans include: Secure billing, cancel anytime, 99.9% uptime
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {(plans.data && plans.data.length > 0 ? plans.data : defaultPlans).map((plan: Plan) => {
            const isCurrent = subscription.data?.plan === plan.id || subscription.data?.plan_slug === plan.slug;
            const isPopular = plan.is_popular || plan.name === 'Pro';
            const features = planFeatures[plan.name] || [
              `${plan.monthly_credits.toLocaleString()} credits / month`,
              'Standard support',
            ];
            const ctaText = isCurrent
              ? 'Current Plan'
              : plan.name === 'Free'
                ? 'Downgrade to Free'
                : isPopular
                  ? 'Upgrade to Pro'
                  : `Upgrade to ${plan.name}`;
            return (
              <Card
                key={plan.id}
                className={`relative flex flex-col transition-all rounded-xl ${
                  isPopular
                    ? 'border-2 border-blue-500 shadow-lg'
                    : 'border border-border/60 shadow-sm hover:shadow-md'
                } ${isCurrent ? 'ring-1 ring-blue-500' : ''}`}
              >
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-blue-600 text-white text-xs px-3 py-0.5 rounded-md">Recommended</Badge>
                  </div>
                )}
                <CardHeader className="pb-3 pt-6">
                  <CardTitle className="text-base font-semibold text-foreground">{plan.name}</CardTitle>
                  <p className="text-xs text-muted-foreground mt-1">{planDescriptions[plan.name] || 'For growing users'}</p>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <div className="flex items-baseline gap-1 mb-5">
                    <span className="text-3xl font-bold text-foreground">{formatCurrency(plan.price_cents)}</span>
                    <span className="text-sm text-muted-foreground">/{plan.interval}</span>
                  </div>
                  <ul className="space-y-3 mb-6 flex-1">
                    {features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <Check size={14} className="mt-0.5 text-blue-600 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full rounded-md"
                    variant={isCurrent ? 'outline' : isPopular ? 'default' : 'outline'}
                    disabled={isCurrent}
                  >
                    {ctaText}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Bottom grid */}
      <div className="grid gap-6 lg:grid-cols-2 mb-8">
        <Card className="border border-border/60 shadow-sm rounded-xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-foreground">Payment method</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card">
              <div className="p-2.5 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/30">
                <CreditCard size={22} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground">Visa •••• 4242</span>
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Default</Badge>
                </div>
                <div className="text-sm text-muted-foreground">Expires 08 / 2026</div>
              </div>
              <Button variant="outline" size="sm" className="rounded-md" onClick={() => setShowPaymentDialog(true)}>Update</Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-9 w-9 p-0 rounded-md text-muted-foreground"
                onClick={() => alert('More payment options coming soon')}
                aria-label="More payment options"
              >
                <MoreHorizontal size={16} />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/60 shadow-sm rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base font-semibold text-foreground">Recent invoices</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              className="h-auto px-0 py-0 text-sm font-semibold text-blue-600 hover:text-blue-700 hover:bg-transparent dark:text-blue-400 dark:hover:text-blue-300 gap-1"
              onClick={() => setShowInvoicesDialog(true)}
            >
              View all invoices <span>→</span>
            </Button>
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
                    <th className="pb-2 font-medium">&nbsp;</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((invoice, index) => (
                    <tr key={index} className="border-b last:border-0">
                      <td className="py-3 text-muted-foreground">{invoice.date}</td>
                      <td className="py-3 font-medium text-foreground">{invoice.description}</td>
                      <td className="py-3 text-foreground">{invoice.amount}</td>
                      <td className="py-3">
                        <Badge variant="success" className="text-xs">{invoice.status}</Badge>
                      </td>
                      <td className="py-3 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 rounded-md text-muted-foreground"
                          onClick={() => alert(`Download ${invoice.description}`)}
                          aria-label={`Download invoice ${invoice.description}`}
                        >
                          <Download size={14} />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

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
          <div className="p-4 rounded-lg bg-secondary">
            <div className="text-sm text-muted-foreground">Estimated Credits</div>
            <div className="text-2xl font-bold text-primary mt-1">
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

      <Modal
        isOpen={showInvoicesDialog}
        onClose={() => setShowInvoicesDialog(false)}
        title="All Invoices"
        description="Download or view your past invoices"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted-foreground border-b">
                <th className="pb-2 font-medium">Date</th>
                <th className="pb-2 font-medium">Description</th>
                <th className="pb-2 font-medium">Amount</th>
                <th className="pb-2 font-medium">Status</th>
                <th className="pb-2 font-medium">&nbsp;</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice, index) => (
                <tr key={index} className="border-b last:border-0">
                  <td className="py-3 text-muted-foreground">{invoice.date}</td>
                  <td className="py-3 font-medium text-foreground">{invoice.description}</td>
                  <td className="py-3 text-foreground">{invoice.amount}</td>
                  <td className="py-3"><Badge variant="success" className="text-xs">{invoice.status}</Badge></td>
                  <td className="py-3 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 rounded-md text-muted-foreground"
                      onClick={() => alert(`Download ${invoice.description}`)}
                      aria-label={`Download invoice ${invoice.description}`}
                    >
                      <Download size={14} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Modal>

      <Modal
        isOpen={showPaymentDialog}
        onClose={() => setShowPaymentDialog(false)}
        title="Update Payment Method"
        description="Change your default card on file"
      >
        <div className="space-y-4">
          <Input label="Card number" placeholder="4242 4242 4242 4242" />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Expiry" placeholder="MM / YY" />
            <Input label="CVC" placeholder="123" />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setShowPaymentDialog(false)}>Cancel</Button>
            <Button onClick={() => { setShowPaymentDialog(false); setSuccess('Payment method updated'); setTimeout(() => setSuccess(''), 3000); }}>Save card</Button>
          </div>
        </div>
      </Modal>
    </section>
  );
}
