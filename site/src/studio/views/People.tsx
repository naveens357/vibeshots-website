// Team members: who can log in, their roles and how they are paid (owners).
import { useState } from 'preact/hooks';
import { api, useApi } from '../lib/api';
import { npr } from '../lib/money';
import { ROLES, ROLE_LABEL, type Person, type Role } from '../lib/types';
import { ErrorNote, Field, Loading, useForm, useSave } from '../ui/forms';

const ACCESS_LABEL = { owner: 'Owner (everything)', staff: 'Staff (own shoots)', none: 'No login (freelancer)' };
const PAY_LABEL = { per_event: 'Per event', salary: 'Monthly salary', both: 'Salary + per event' };

export function People({ myId }: { myId: number }) {
  const { data, error, loading, reload } = useApi<Person[]>('/people');
  const [editing, setEditing] = useState<Person | 'new' | null>(null);

  return (
    <section>
      <header class="page-head">
        <div><p class="eyebrow">Team</p><h1>People</h1></div>
        <button class="btn" onClick={() => setEditing('new')}>Add person</button>
      </header>
      {editing && <div class="card"><PersonForm person={editing === 'new' ? null : editing} myId={myId} onDone={() => { setEditing(null); reload(); }} onCancel={() => setEditing(null)} /></div>}
      <ErrorNote error={error} />
      {loading && <Loading />}
      {data && (
        <table class="tbl">
          <thead><tr><th>Name</th><th>Roles</th><th>Phone</th><th>Login</th><th>Pay</th><th /></tr></thead>
          <tbody>
            {data.map((p) => (
              <tr class={p.active ? '' : 'inactive'}>
                <td><b>{p.name}</b>{!p.active && <small> · inactive</small>}<br /><small class="muted">{p.email}</small></td>
                <td>{p.roles.map((r) => ROLE_LABEL[r]).join(', ') || '—'}</td>
                <td>{p.phone || '—'}</td>
                <td>{ACCESS_LABEL[p.access ?? 'none']}</td>
                <td>{PAY_LABEL[p.pay_type ?? 'per_event']}<br /><small class="muted">{[p.monthly_salary && `${npr(p.monthly_salary)}/month`, p.event_rate && `${npr(p.event_rate)}/event`].filter(Boolean).join(' · ')}</small></td>
                <td><button class="link" onClick={() => setEditing(p)}>Edit</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}

function PersonForm({ person, myId, onDone, onCancel }: { person: Person | null; myId: number; onDone: () => void; onCancel: () => void }) {
  const form = useForm({
    name: person?.name ?? '', phone: person?.phone ?? '', email: person?.email ?? '', access: person?.access ?? 'none',
    roles: person?.roles ?? ([] as Role[]), pay_type: person?.pay_type ?? 'per_event',
    monthly_salary: person?.monthly_salary ?? null, event_rate: person?.event_rate ?? null,
    active: person?.active ?? true, notes: person?.notes ?? '',
  });
  const save = useSave();
  const v = form.values;
  const toggleRole = (r: Role) => form.set('roles', v.roles.includes(r) ? v.roles.filter((x) => x !== r) : [...v.roles, r]);
  const isMe = person?.id === myId;

  return (
    <form onSubmit={(e) => { e.preventDefault(); save.run(async () => { await api(person ? `/people/${person.id}` : '/people', person ? 'PUT' : 'POST', v); onDone(); }); }}>
      <h2>{person ? `Edit ${person.name}` : 'Add person'}</h2>
      <div class="grid">
        <Field label="Name"><input required value={v.name} onInput={form.on('name')} /></Field>
        <Field label="WhatsApp number"><input value={v.phone} onInput={form.on('phone')} placeholder="98XXXXXXXX" /></Field>
        <Field label="Email" hint="Used for the email-code login"><input type="email" value={v.email} onInput={form.on('email')} /></Field>
        <Field label="Dashboard access">
          <select value={v.access} onChange={form.on('access')} disabled={isMe}>
            {Object.entries(ACCESS_LABEL).map(([k, l]) => <option value={k}>{l}</option>)}
          </select>
        </Field>
        <Field label="Roles" wide>
          <span class="checks">{ROLES.map((r) => (
            <label><input type="checkbox" checked={v.roles.includes(r)} onChange={() => toggleRole(r)} /> {ROLE_LABEL[r]}</label>
          ))}</span>
        </Field>
        <Field label="Pay">
          <select value={v.pay_type} onChange={form.on('pay_type')}>{Object.entries(PAY_LABEL).map(([k, l]) => <option value={k}>{l}</option>)}</select>
        </Field>
        {v.pay_type !== 'per_event' && <Field label="Monthly salary (NPR)"><input type="number" min="0" step="500" value={v.monthly_salary ?? ''} onInput={form.on('monthly_salary')} /></Field>}
        {v.pay_type !== 'salary' && <Field label="Rate per event (NPR)"><input type="number" min="0" step="500" value={v.event_rate ?? ''} onInput={form.on('event_rate')} /></Field>}
        <Field label="Notes" wide><textarea rows={2} value={v.notes} onInput={form.on('notes')} /></Field>
        {person && !isMe && <label class="checks"><input type="checkbox" checked={v.active} onChange={(e) => form.set('active', e.currentTarget.checked)} /> Active (untick when someone leaves; their past shoots stay)</label>}
      </div>
      <ErrorNote error={save.error} />
      <div class="row"><button class="btn" disabled={save.busy}>Save</button><button type="button" class="btn ghost" onClick={onCancel}>Cancel</button></div>
    </form>
  );
}
