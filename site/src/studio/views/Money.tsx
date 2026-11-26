// Money overview (owners): a BS month or the fiscal year, what came in, what went out,
// staff pay and profit; who still owes; one-off and monthly studio costs.
import { useState } from 'preact/hooks';
import packages from '../../data/packages.json';
import { api, useApi } from '../lib/api';
import { bsLabel, todayIso } from '../lib/bs';
import {
  type FinanceData, type MonthKey, type StudioCost, bookingBalance, costsInMonth, fiscalYear, monthKey, monthLabel, monthRange, nextMonth, signed, summarizeMonth,
} from '../lib/finance';
import { paymentReminder } from '../lib/messages';
import { npr } from '../lib/money';
import { CATEGORY_LABEL, METHOD_LABEL } from '../lib/types';
import { ErrorNote, Loading, useSave } from '../ui/forms';
import { ExpenseForm, StudioCostForm, type CostValues } from '../ui/MoneyForms';
import { WhatsAppButton } from '../ui/WhatsAppButton';

interface Owing { id: number; title: string; package: string | null; total_price: number | null; discount: number | null; client_name: string; client_phone: string | null; paid: number; first_date: string | null }

export function Money() {
  const [view, setView] = useState<'month' | 'year'>('month');
  const [month, setMonth] = useState<MonthKey>(monthKey(todayIso()));
  const months = view === 'month' ? [month] : fiscalYear(monthRange(month).from);
  const from = monthRange(months[0]).from;
  const to = monthRange(months.at(-1)!).to;
  const { data, error, loading, reload } = useApi<FinanceData>(`/finance?from=${from}&to=${to}`);
  const owing = useApi<Owing[]>('/outstanding');
  const [adding, setAdding] = useState<'expense' | 'cost' | StudioCost | null>(null);
  const save = useSave();

  const rows = data ? months.map((k) => summarizeMonth(data, k)) : [];
  const total = rows.reduce((t, r) => ({
    income: t.income + r.income, costs: t.costs + r.costs, staffPay: t.staffPay + r.staffPay, profit: t.profit + r.profit,
  }), { income: 0, costs: 0, staffPay: 0, profit: 0 });
  const maxBar = Math.max(1, ...rows.map((r) => Math.max(r.income, r.costs + r.staffPay)));
  const title = view === 'month' ? monthLabel(month) : `Fiscal year ${months[0].slice(0, 4)}/${months.at(-1)!.slice(2, 4)}`;
  const totalDue = (owing.data ?? []).reduce((s, o) => s + bookingBalance(o, [{ amount: o.paid, kind: 'payment' }]).due, 0);

  const saveCost = async (v: CostValues) => {
    const id = adding && typeof adding === 'object' ? adding.id : null;
    await api(id ? `/studio-costs/${id}` : '/studio-costs', id ? 'PUT' : 'POST', v);
    setAdding(null); reload();
  };
  const delExpense = (id: number) => confirm('Delete this expense?') && save.run(async () => { await api(`/expenses/${id}`, 'DELETE'); reload(); });

  return (
    <section>
      <header class="page-head">
        <div><p class="eyebrow">Money</p><h1>{title}</h1></div>
        <div class="row">
          <select value={view} onChange={(e) => setView(e.currentTarget.value as 'month' | 'year')} style="width:auto">
            <option value="month">Month</option><option value="year">Fiscal year (Shrawan–Asar)</option>
          </select>
          <button class="btn ghost" onClick={() => setMonth(nextMonth(month, view === 'month' ? -1 : -12))}>← Previous</button>
          <button class="btn ghost" onClick={() => setMonth(monthKey(todayIso()))}>Now</button>
          <button class="btn ghost" onClick={() => setMonth(nextMonth(month, view === 'month' ? 1 : 12))}>Next →</button>
        </div>
      </header>
      <ErrorNote error={error || save.error} />
      {loading && !data && <Loading />}
      {data && (
        <>
          <div class="stats">
            <div><b>{npr(total.income)}</b><span>received from clients</span></div>
            <div><b>{npr(total.costs)}</b><span>expenses & studio costs</span></div>
            <div><b>{npr(total.staffPay)}</b><span>team pay earned</span></div>
            <div class={total.profit < 0 ? 'bad' : 'good'}><b>{npr(total.profit)}</b><span>profit</span></div>
          </div>

          {view === 'year' ? (
            <div class="card">
              <table class="tbl compact money">
                <thead><tr><th>Month</th><th class="num">In</th><th class="num">Expenses</th><th class="num">Team pay</th><th class="num">Profit</th><th /></tr></thead>
                <tbody>{rows.map((r) => (
                  <tr onClick={() => { setMonth(r.key); setView('month'); }} style="cursor:pointer">
                    <td>{monthLabel(r.key)}</td>
                    <td class="num">{npr(r.income)}</td><td class="num">{npr(r.costs)}</td><td class="num">{npr(r.staffPay)}</td>
                    <td class={`num${r.profit < 0 ? ' neg' : ''}`}>{npr(r.profit)}</td>
                    <td class="bars"><span class="bar in" style={`width:${(r.income / maxBar) * 100}%`} /><span class="bar out" style={`width:${((r.costs + r.staffPay) / maxBar) * 100}%`} /></td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          ) : (
            <MonthDetail data={data} k={month} summary={rows[0]} onDeleteExpense={delExpense} />
          )}
        </>
      )}

      <section class="group">
        <h2>Still to collect <small>{npr(totalDue)}</small></h2>
        {(owing.data ?? []).length === 0 ? <p class="muted">Nobody owes anything.</p> : (
          <table class="tbl">
            <thead><tr><th>Booking</th><th>First event</th><th class="num">Price</th><th class="num">Paid</th><th class="num">Due</th><th /></tr></thead>
            <tbody>{(owing.data ?? []).map((o) => {
              const m = bookingBalance(o, [{ amount: o.paid, kind: 'payment' }]);
              return (
                <tr>
                  <td><a href={`#/bookings/${o.id}`}><b>{o.title}</b></a><br /><small class="muted">{o.client_name}</small></td>
                  <td>{o.first_date ? bsLabel(o.first_date) : '—'}</td>
                  <td class="num">{npr(m.price)}</td><td class="num">{npr(m.paid)}</td><td class="num"><b>{npr(m.due)}</b></td>
                  <td><WhatsAppButton small phone={o.client_phone} message={paymentReminder({ ...o, client: { name: o.client_name } }, m, packages.paymentMethods)}>Remind</WhatsAppButton></td>
                </tr>
              );
            })}</tbody>
          </table>
        )}
      </section>

      <section class="group">
        <h2>Studio costs
          <button class="btn sm" onClick={() => setAdding('cost')}>Add monthly cost</button>
          <button class="btn ghost sm" onClick={() => setAdding('expense')}>Add one-off studio expense</button>
        </h2>
        {adding === 'expense' && <ExpenseForm studio title="One-off studio expense" onCancel={() => setAdding(null)}
          onSave={async (v) => { await api('/expenses', 'POST', v); setAdding(null); reload(); }} />}
        {(adding === 'cost' || (adding && typeof adding === 'object')) && (
          <StudioCostForm title={typeof adding === 'object' ? `Edit ${adding.name}` : 'Monthly cost'} initial={typeof adding === 'object' ? adding : undefined}
            onCancel={() => setAdding(null)} onSave={saveCost} />
        )}
        <table class="tbl">
          <thead><tr><th>Monthly cost</th><th>Category</th><th>Running</th><th class="num">Per month</th><th /></tr></thead>
          <tbody>
            {(data?.studio_costs ?? []).map((c) => (
              <tr class={c.end_date && c.end_date < todayIso() ? 'inactive' : ''}>
                <td><b>{c.name}</b></td><td>{CATEGORY_LABEL[c.category] ?? c.category}</td>
                <td>{bsLabel(c.start_date)} – {c.end_date ? bsLabel(c.end_date) : 'now'}</td>
                <td class="num">{npr(c.amount)}</td>
                <td><button class="link" onClick={() => setAdding(c)}>Edit</button></td>
              </tr>
            ))}
            {(data?.studio_costs ?? []).length === 0 && <tr><td colSpan={5} class="muted">No monthly costs yet (rent, internet, software…).</td></tr>}
          </tbody>
        </table>
      </section>
    </section>
  );
}

function MonthDetail({ data, k, summary: s, onDeleteExpense }: { data: FinanceData; k: MonthKey; summary: ReturnType<typeof summarizeMonth>; onDeleteExpense: (id: number) => void }) {
  const inK = (iso: string) => monthKey(iso) === k;
  const payments = data.payments.filter((p) => inK(p.date));
  const expenses = data.expenses.filter((x) => inK(x.date));
  const fixed = costsInMonth(data.studio_costs, k);
  return (
    <div class="cols">
      <div class="card">
        <h3 class="sub">Received <small class="muted">{npr(s.income)}</small></h3>
        {payments.length === 0 ? <p class="muted">No payments this month.</p> : (
          <table class="tbl compact"><tbody>{payments.map((p) => (
            <tr>
              <td>{bsLabel(p.date)}</td>
              <td><a href={`#/bookings/${p.booking_id}`}>{p.title}</a><br /><small class="muted">{METHOD_LABEL[p.method] ?? p.method}{p.note ? ` · ${p.note}` : ''}</small></td>
              <td class={`num${p.kind === 'refund' ? ' neg' : ''}`}>{npr(signed(p))}</td>
            </tr>
          ))}</tbody></table>
        )}
      </div>
      <div class="card">
        <h3 class="sub">Spent <small class="muted">{npr(s.costs + s.staffPay)}</small></h3>
        <dl class="kv">
          <dt>Shoot expenses</dt><dd>{npr(s.shootCosts)}</dd>
          <dt>Studio one-offs</dt><dd>{npr(s.studioCosts)}</dd>
          <dt>Monthly costs</dt><dd>{npr(s.monthlyCosts)}{fixed.length > 0 && <small class="muted"> ({fixed.map((c) => c.name).join(', ')})</small>}</dd>
          <dt>Event fees</dt><dd>{npr(s.eventFees)}</dd>
          <dt>Salaries</dt><dd>{npr(s.salaries)}</dd>
        </dl>
        {expenses.length > 0 && (
          <table class="tbl compact" style="margin-top:12px"><tbody>{expenses.map((x) => (
            <tr>
              <td>{bsLabel(x.date)}</td>
              <td>{x.title ? <a href={`#/bookings/${x.booking_id}`}>{x.title}</a> : 'Studio'}<br /><small class="muted">{CATEGORY_LABEL[x.category] ?? x.category}{x.note ? ` · ${x.note}` : ''}</small></td>
              <td class="num">{npr(x.amount)}</td>
              <td>{!x.booking_id && <button class="link danger" onClick={() => onDeleteExpense(x.id)}>Delete</button>}</td>
            </tr>
          ))}</tbody></table>
        )}
      </div>
    </div>
  );
}
