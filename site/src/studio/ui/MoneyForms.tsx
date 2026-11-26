// Small forms for money rows: a client payment, an expense, a staff payment, a monthly cost.
import { todayIso } from '../lib/bs';
import { CATEGORY_LABEL, METHOD_LABEL, STAFF_PAY_LABEL } from '../lib/types';
import { BsDateInput } from './BsDateInput';
import { ErrorNote, Field, useForm, useSave } from './forms';

interface FormProps<T> { onSave: (values: T) => Promise<unknown>; onCancel: () => void; title: string }

const Options = ({ labels }: { labels: Record<string, string> }) => <>{Object.entries(labels).map(([k, l]) => <option value={k}>{l}</option>)}</>;
const Buttons = ({ busy, onCancel }: { busy: boolean; onCancel: () => void }) => (
  <div class="row"><button class="btn" disabled={busy}>{busy ? 'Saving…' : 'Save'}</button><button type="button" class="btn ghost" onClick={onCancel}>Cancel</button></div>
);

export function PaymentForm({ onSave, onCancel, title, due }: FormProps<Record<string, unknown>> & { due?: number }) {
  const form = useForm({ date: todayIso(), amount: (due || null) as number | null, kind: 'payment', method: 'esewa', note: '' });
  const save = useSave();
  return (
    <form class="card" onSubmit={(e) => { e.preventDefault(); save.run(() => onSave(form.values)); }}>
      <h2>{title}</h2>
      <div class="grid">
        <Field label="Date (BS)"><BsDateInput value={form.values.date} onChange={(d) => form.set('date', d)} /></Field>
        <Field label="Amount (NPR)"><input type="number" min="1" required value={form.values.amount ?? ''} onInput={form.on('amount')} /></Field>
        <Field label="Type"><select value={form.values.kind} onChange={form.on('kind')}><option value="payment">Payment received</option><option value="refund">Refund given</option></select></Field>
        <Field label="Method"><select value={form.values.method} onChange={form.on('method')}><Options labels={METHOD_LABEL} /></select></Field>
        <Field label="Note" wide><input value={form.values.note} onInput={form.on('note')} placeholder="e.g. Advance 30%, eSewa ref 1234" /></Field>
      </div>
      <ErrorNote error={save.error} />
      <Buttons busy={save.busy} onCancel={onCancel} />
    </form>
  );
}

export function ExpenseForm({ onSave, onCancel, title, studio = false }: FormProps<Record<string, unknown>> & { studio?: boolean }) {
  const form = useForm({ date: todayIso(), amount: null as number | null, category: studio ? 'equipment' : 'travel', note: '' });
  const save = useSave();
  return (
    <form class="card" onSubmit={(e) => { e.preventDefault(); save.run(() => onSave(form.values)); }}>
      <h2>{title}</h2>
      <div class="grid">
        <Field label="Date (BS)"><BsDateInput value={form.values.date} onChange={(d) => form.set('date', d)} /></Field>
        <Field label="Amount (NPR)"><input type="number" min="1" required value={form.values.amount ?? ''} onInput={form.on('amount')} /></Field>
        <Field label="Category"><select value={form.values.category} onChange={form.on('category')}><Options labels={CATEGORY_LABEL} /></select></Field>
        <Field label="Note" wide><input value={form.values.note} onInput={form.on('note')} placeholder="e.g. Taxi to Nagarkot" /></Field>
      </div>
      <ErrorNote error={save.error} />
      <Buttons busy={save.busy} onCancel={onCancel} />
    </form>
  );
}

export function StaffPaymentForm({ onSave, onCancel, title, people, personId, amount }: FormProps<Record<string, unknown>> & { people: { id: number; name: string }[]; personId?: number; amount?: number }) {
  const form = useForm({ person_id: String(personId ?? people[0]?.id ?? ''), date: todayIso(), amount: (amount && amount > 0 ? amount : null) as number | null, kind: 'event', method: 'cash', note: '' });
  const save = useSave();
  return (
    <form class="card" onSubmit={(e) => { e.preventDefault(); save.run(() => onSave({ ...form.values, person_id: Number(form.values.person_id) })); }}>
      <h2>{title}</h2>
      <div class="grid">
        <Field label="Person"><select value={form.values.person_id} onChange={form.on('person_id')}>{people.map((p) => <option value={p.id}>{p.name}</option>)}</select></Field>
        <Field label="Date (BS)"><BsDateInput value={form.values.date} onChange={(d) => form.set('date', d)} /></Field>
        <Field label="Amount (NPR)"><input type="number" min="1" required value={form.values.amount ?? ''} onInput={form.on('amount')} /></Field>
        <Field label="For"><select value={form.values.kind} onChange={form.on('kind')}><Options labels={STAFF_PAY_LABEL} /></select></Field>
        <Field label="Method"><select value={form.values.method} onChange={form.on('method')}><Options labels={METHOD_LABEL} /></select></Field>
        <Field label="Note" wide><input value={form.values.note} onInput={form.on('note')} /></Field>
      </div>
      <ErrorNote error={save.error} />
      <Buttons busy={save.busy} onCancel={onCancel} />
    </form>
  );
}

export interface CostValues { name: string; category: string; amount: number | null; start_date: string; end_date: string | null }

export function StudioCostForm({ onSave, onCancel, title, initial }: FormProps<CostValues> & { initial?: Partial<CostValues> }) {
  const form = useForm<CostValues>({ name: '', category: 'rent', amount: null, start_date: todayIso(), end_date: null, ...initial });
  const save = useSave();
  const v = form.values;
  return (
    <form class="card" onSubmit={(e) => { e.preventDefault(); save.run(() => onSave(v)); }}>
      <h2>{title}</h2>
      <div class="grid">
        <Field label="Name"><input required value={v.name} onInput={form.on('name')} placeholder="e.g. Studio rent" /></Field>
        <Field label="Category"><select value={v.category} onChange={form.on('category')}><Options labels={CATEGORY_LABEL} /></select></Field>
        <Field label="Amount per month (NPR)"><input type="number" min="1" required value={v.amount ?? ''} onInput={form.on('amount')} /></Field>
        <Field label="From (BS)"><BsDateInput value={v.start_date} onChange={(d) => form.set('start_date', d)} /></Field>
        <Field label="Until (BS)" hint="Leave as 'still running' while you keep paying it">
          {v.end_date ? (
            <span class="row"><BsDateInput value={v.end_date} onChange={(d) => form.set('end_date', d)} /><button type="button" class="link" onClick={() => form.set('end_date', null)}>Still running</button></span>
          ) : <button type="button" class="btn ghost sm" onClick={() => form.set('end_date', todayIso())}>Still running · set an end</button>}
        </Field>
      </div>
      <ErrorNote error={save.error} />
      <Buttons busy={save.busy} onCancel={onCancel} />
    </form>
  );
}
