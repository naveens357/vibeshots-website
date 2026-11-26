// Team pay: what each person earned (event fees + salary months), was paid, and is still owed.
// Owners see everyone and record payments; staff see only their own.
import { useState } from 'preact/hooks';
import { api, useApi } from '../lib/api';
import { bsLabel, todayIso } from '../lib/bs';
import { type PayData, balances, monthKey, monthLabel, salaryMonths } from '../lib/finance';
import { npr } from '../lib/money';
import { METHOD_LABEL, ROLE_LABEL, STAFF_PAY_LABEL, type Me, type Role } from '../lib/types';
import { ErrorNote, Loading, useSave } from '../ui/forms';
import { StaffPaymentForm } from '../ui/MoneyForms';

export function Pay({ me }: { me: Me }) {
  const { data, error, loading, setData } = useApi<PayData>('/pay');
  const [open, setOpen] = useState<number | null>(me.access === 'owner' ? null : me.personId);
  const [paying, setPaying] = useState<{ personId: number; amount: number } | 'any' | null>(null);
  const del = useSave();
  const owner = me.access === 'owner';
  if (loading && !data) return <Loading />;
  if (!data) return <ErrorNote error={error} />;

  const rows = balances(data).filter((r) => r.earned || r.paid || r.person.active);
  const today = todayIso();
  const remove = (id: number) => confirm('Delete this payment?') && del.run(async () => setData(await api<PayData>(`/staff-payments/${id}`, 'DELETE')));

  return (
    <section>
      <header class="page-head">
        <div><p class="eyebrow">Team</p><h1>{owner ? 'Team pay' : 'My pay'}</h1></div>
        {owner && <button class="btn" onClick={() => setPaying('any')}>Record payment</button>}
      </header>
      <ErrorNote error={error || del.error} />
      {paying && (
        <StaffPaymentForm title="Payment to a team member" people={data.people}
          personId={typeof paying === 'object' ? paying.personId : undefined} amount={typeof paying === 'object' ? paying.amount : undefined}
          onCancel={() => setPaying(null)}
          onSave={async (v) => { setData(await api<PayData>('/staff-payments', 'POST', v)); setPaying(null); }} />
      )}
      <table class="tbl">
        <thead><tr><th>Person</th><th class="num">Event fees</th><th class="num">Salary</th><th class="num">Paid</th><th class="num">Owed</th><th /></tr></thead>
        <tbody>{rows.map((r) => (
          <>
            <tr onClick={() => setOpen(open === r.person.id ? null : r.person.id)}>
              <td><b>{r.person.name}</b>{!r.person.active && <small> · inactive</small>}</td>
              <td class="num">{npr(r.fees)}</td>
              <td class="num">{npr(r.salary)}{r.salary > 0 && <><br /><small class="muted">{salaryMonths(r.person, monthKey(today)).length} months</small></>}</td>
              <td class="num">{npr(r.paid)}</td>
              <td class={`num${r.balance < 0 ? ' neg' : ''}`}><b>{npr(r.balance)}</b>{r.balance < 0 && <><br /><small>paid ahead</small></>}</td>
              <td>{owner && r.balance > 0 && <button class="btn sm" onClick={(e) => { e.stopPropagation(); setPaying({ personId: r.person.id, amount: r.balance }); }}>Pay</button>}</td>
            </tr>
            {open === r.person.id && (
              <tr class="detail"><td colSpan={6}>
                <div class="cols">
                  <div>
                    <h3 class="sub">Earned</h3>
                    <table class="tbl compact"><tbody>
                      {data.fees.filter((f) => f.person_id === r.person.id).map((f) => (
                        <tr class={f.date > today ? 'inactive' : ''}>
                          <td>{bsLabel(f.date)}</td><td>{f.title} · {f.event_name}<br /><small class="muted">{ROLE_LABEL[f.role as Role] ?? f.role}{f.date > today ? ' · upcoming' : ''}</small></td><td class="num">{npr(f.fee)}</td>
                        </tr>
                      ))}
                      {salaryMonths(r.person, monthKey(today)).map((k) => (
                        <tr><td>{monthLabel(k)}</td><td>Salary</td><td class="num">{npr(r.person.monthly_salary)}</td></tr>
                      ))}
                    </tbody></table>
                  </div>
                  <div>
                    <h3 class="sub">Paid</h3>
                    {data.paid.filter((s) => s.person_id === r.person.id).length === 0 ? <p class="muted">Nothing paid yet.</p> : (
                      <table class="tbl compact"><tbody>
                        {data.paid.filter((s) => s.person_id === r.person.id).map((s) => (
                          <tr>
                            <td>{bsLabel(s.date)}</td><td>{STAFF_PAY_LABEL[s.kind] ?? s.kind} · {METHOD_LABEL[s.method] ?? s.method}{s.note && <><br /><small class="muted">{s.note}</small></>}</td>
                            <td class="num">{npr(s.amount)}</td>
                            <td>{owner && <button class="link danger" onClick={() => remove(s.id)}>Delete</button>}</td>
                          </tr>
                        ))}
                      </tbody></table>
                    )}
                  </div>
                </div>
              </td></tr>
            )}
          </>
        ))}</tbody>
      </table>
      <p class="muted">Owed = event fees for shoots up to today + salary for each BS month since the salary start − payments. Upcoming shoots are shown faded and not counted yet.</p>
    </section>
  );
}
