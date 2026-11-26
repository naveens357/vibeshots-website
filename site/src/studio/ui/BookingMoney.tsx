// Money on a booking: what the client paid and still owes, a WhatsApp reminder,
// and the shoot's own expenses and crew cost.
import { useState } from 'preact/hooks';
import packages from '../../data/packages.json';
import { api } from '../lib/api';
import { bsLabel } from '../lib/bs';
import { bookingBalance, signed } from '../lib/finance';
import { paymentReminder } from '../lib/messages';
import { npr } from '../lib/money';
import { CATEGORY_LABEL, METHOD_LABEL, type Booking } from '../lib/types';
import { ErrorNote, useSave } from './forms';
import { ExpenseForm, PaymentForm } from './MoneyForms';
import { WhatsAppButton } from './WhatsAppButton';

interface Props { b: Booking; onChange: (b: Booking) => void }

export function BookingMoney({ b, onChange }: Props) {
  const [adding, setAdding] = useState<'payment' | 'expense' | null>(null);
  const del = useSave();
  const money = bookingBalance(b, b.payments);
  const crewCost = b.events.flatMap((e) => e.crew).reduce((s, c) => s + (c.fee ?? 0), 0);
  const expenses = b.expenses.reduce((s, x) => s + x.amount, 0);
  const remove = (path: string, what: string) => confirm(`Delete this ${what}?`) && del.run(async () => onChange(await api<Booking>(path, 'DELETE')));
  const save = (path: string) => async (values: Record<string, unknown>) => { onChange(await api<Booking>(path, 'POST', values)); setAdding(null); };

  return (
    <section class="group">
      <h2>Money</h2>
      <div class="stats">
        <div><b>{npr(money.price) || '—'}</b><span>price after discount</span></div>
        <div><b>{npr(money.paid)}</b><span>received</span></div>
        <div class={money.due ? 'alert' : ''}><b>{npr(money.due)}</b><span>still due</span></div>
        <div><b>{npr(money.paid - expenses - crewCost)}</b><span>left after {npr(expenses)} expenses and {npr(crewCost)} crew fees</span></div>
      </div>
      <div class="row" style="margin:12px 0">
        <button class="btn sm" onClick={() => setAdding('payment')}>Record payment</button>
        <button class="btn ghost sm" onClick={() => setAdding('expense')}>Add shoot expense</button>
        {money.due > 0 && <WhatsAppButton small phone={b.client.phone} message={paymentReminder(b, money, packages.paymentMethods)}>Send payment reminder</WhatsAppButton>}
      </div>
      {adding === 'payment' && <PaymentForm title="Record a payment" due={money.due} onCancel={() => setAdding(null)} onSave={save(`/bookings/${b.id}/payments`)} />}
      {adding === 'expense' && <ExpenseForm title="Shoot expense" onCancel={() => setAdding(null)} onSave={(v) => save('/expenses')({ ...v, booking_id: b.id })} />}
      <ErrorNote error={del.error} />

      <div class="cols">
        <div class="card">
          <h3 class="sub">Payments</h3>
          {b.payments.length === 0 ? <p class="muted">No payments yet.</p> : (
            <table class="tbl compact">
              <tbody>{b.payments.map((p) => (
                <tr>
                  <td>{bsLabel(p.date)}</td>
                  <td>{METHOD_LABEL[p.method] ?? p.method}{p.note && <><br /><small class="muted">{p.note}</small></>}</td>
                  <td class={`num${p.kind === 'refund' ? ' neg' : ''}`}>{npr(signed(p))}</td>
                  <td><button class="link danger" onClick={() => remove(`/payments/${p.id}`, 'payment')}>Delete</button></td>
                </tr>
              ))}</tbody>
            </table>
          )}
        </div>
        <div class="card">
          <h3 class="sub">Shoot expenses</h3>
          {b.expenses.length === 0 ? <p class="muted">No expenses yet.</p> : (
            <table class="tbl compact">
              <tbody>{b.expenses.map((x) => (
                <tr>
                  <td>{bsLabel(x.date)}</td>
                  <td>{CATEGORY_LABEL[x.category] ?? x.category}{x.note && <><br /><small class="muted">{x.note}</small></>}</td>
                  <td class="num">{npr(x.amount)}</td>
                  <td><button class="link danger" onClick={() => remove(`/expenses/${x.id}`, 'expense')}>Delete</button></td>
                </tr>
              ))}</tbody>
            </table>
          )}
          {crewCost > 0 && <p class="muted">Crew fees on this booking: {npr(crewCost)}</p>}
        </div>
      </div>
    </section>
  );
}
