import { create } from 'zustand';

export type PaymentMethodType = 'card' | 'paypal' | 'mtn' | 'airtel';

export interface PaymentMethod {
  id: string;
  type: PaymentMethodType;
  label: string;
  detail?: string;
  default?: boolean;
}

export interface Plan {
  id: string;
  name: string;
  slug: string;
  priceCents: number;
  currency: string;
  interval: string;
  monthlyCredits: number;
  isPopular?: boolean;
  custom?: boolean;
}

export interface InvoiceItem {
  description: string;
  amount: string;
}

export interface Invoice {
  id: string;
  date: string;
  description: string;
  amount: string;
  status: 'Paid' | 'Pending' | 'Failed';
  items: InvoiceItem[];
  paymentMethod: string;
  country: string;
}

export function formatCents(cents: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);
}

function nextMonthISO(): string {
  const d = new Date();
  d.setMonth(d.getMonth() + 1);
  return d.toISOString();
}

const initialPlans: Plan[] = [
  { id: 'free', name: 'Free', slug: 'free', priceCents: 0, currency: 'USD', interval: 'month', monthlyCredits: 1000 },
  { id: 'pro', name: 'Pro', slug: 'pro', priceCents: 2000, currency: 'USD', interval: 'month', monthlyCredits: 2000, isPopular: true },
  { id: 'team', name: 'Team', slug: 'team', priceCents: 4900, currency: 'USD', interval: 'month', monthlyCredits: 5000 },
  { id: 'business', name: 'Business', slug: 'business', priceCents: 0, currency: 'USD', interval: 'month', monthlyCredits: 20000, custom: true },
];

const initialInvoices: Invoice[] = [
  {
    id: 'INV-2024-008',
    date: '2024-08-10',
    description: 'Pro Plan – Monthly',
    amount: '$20.00',
    status: 'Paid',
    items: [{ description: 'Pro Plan (Monthly)', amount: '$20.00' }],
    paymentMethod: 'Visa •••• 4242',
    country: 'UG',
  },
  {
    id: 'INV-2024-007',
    date: '2024-07-10',
    description: 'Pro Plan – Monthly',
    amount: '$20.00',
    status: 'Paid',
    items: [{ description: 'Pro Plan (Monthly)', amount: '$20.00' }],
    paymentMethod: 'Visa •••• 4242',
    country: 'UG',
  },
];

interface BillingState {
  plans: Plan[];
  subscription: { planId: string; planName: string; priceCents: number; currentPeriodEnd: string } | null;
  walletBalance: number;
  usageTotal: number;
  usageByType: Record<string, number>;
  invoices: Invoice[];
  paymentMethods: PaymentMethod[];
  country: string;
  selectPlan: (planId: string) => void;
  topUp: (amountUsd: number) => void;
  consumeCredits: (amount: number, type: string) => void;
  setCountry: (country: string) => void;
  addPaymentMethod: (pm: PaymentMethod) => void;
  setDefaultPaymentMethod: (id: string) => void;
}

function invoiceId(seq: number): string {
  return `INV-${new Date().getFullYear()}-${String(seq).padStart(3, '0')}`;
}

export const useBillingStore = create<BillingState>((set, get) => ({
  plans: initialPlans,
  subscription: { planId: 'pro', planName: 'Pro', priceCents: 2000, currentPeriodEnd: nextMonthISO() },
  walletBalance: 1500,
  usageTotal: 500,
  usageByType: { Chat: 500 },
  invoices: initialInvoices,
  paymentMethods: [{ id: 'pm-1', type: 'card', label: 'Visa •••• 4242', detail: 'Expires 08/2026', default: true }],
  country: 'UG',

  selectPlan: (planId) => {
    const plan = get().plans.find((p) => p.id === planId);
    if (!plan) return;
    const defaultPm = get().paymentMethods.find((p) => p.default) ?? get().paymentMethods[0];
    const amount = plan.custom ? 0 : plan.priceCents;
    const seq = get().invoices.length + 1;
    const invoice: Invoice = {
      id: invoiceId(seq),
      date: new Date().toISOString().slice(0, 10),
      description: `${plan.name} Plan – Monthly`,
      amount: plan.custom ? 'Custom' : formatCents(amount),
      status: 'Paid',
      items: plan.custom ? [] : [{ description: `${plan.name} Plan (Monthly)`, amount: formatCents(amount) }],
      paymentMethod: defaultPm?.label ?? 'Card',
      country: get().country,
    };
    set((s) => ({
      subscription: { planId: plan.id, planName: plan.name, priceCents: amount, currentPeriodEnd: nextMonthISO() },
      walletBalance: s.walletBalance + plan.monthlyCredits,
      invoices: [invoice, ...s.invoices],
    }));
  },

  topUp: (amountUsd) => {
    const credits = Math.round(amountUsd * 100);
    const defaultPm = get().paymentMethods.find((p) => p.default) ?? get().paymentMethods[0];
    const cents = Math.round(amountUsd * 100);
    const seq = get().invoices.length + 1;
    const invoice: Invoice = {
      id: invoiceId(seq),
      date: new Date().toISOString().slice(0, 10),
      description: `Credit top-up (${credits.toLocaleString()} credits)`,
      amount: formatCents(cents),
      status: 'Paid',
      items: [{ description: 'Credit top-up', amount: formatCents(cents) }],
      paymentMethod: defaultPm?.label ?? 'Card',
      country: get().country,
    };
    set((s) => ({ walletBalance: s.walletBalance + credits, invoices: [invoice, ...s.invoices] }));
  },

  consumeCredits: (amount, type) => {
    set((s) => ({
      walletBalance: Math.max(0, s.walletBalance - amount),
      usageTotal: s.usageTotal + amount,
      usageByType: { ...s.usageByType, [type]: (s.usageByType[type] ?? 0) + amount },
    }));
  },

  setCountry: (country) => set({ country }),
  addPaymentMethod: (pm) => set((s) => ({ paymentMethods: [...s.paymentMethods, pm] })),
  setDefaultPaymentMethod: (id) =>
    set((s) => ({ paymentMethods: s.paymentMethods.map((p) => ({ ...p, default: p.id === id })) })),
}));
