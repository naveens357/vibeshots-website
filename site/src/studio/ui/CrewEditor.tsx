// Assign people and roles to one event. Fees default to each person's per-event rate.
import { useState } from 'preact/hooks';
import { useApi } from '../lib/api';
import { fullLabel } from '../lib/bs';
import { ROLES, ROLE_LABEL, type Person, type Role, type StudioEvent } from '../lib/types';
import { ErrorNote, useSave } from './forms';

interface Row { person_id: number; role: Role; fee: number | null }
interface Props { event: StudioEvent; onSave: (crew: Row[]) => Promise<unknown>; onCancel: () => void }

export function CrewEditor({ event, onSave, onCancel }: Props) {
  const { data: people } = useApi<Person[]>('/people');
  const [rows, setRows] = useState<Row[]>(event.crew.map((c) => ({ person_id: c.person_id, role: c.role, fee: c.fee ?? null })));
  const save = useSave();
  const active = (people ?? []).filter((p) => p.active !== false);
  const update = (i: number, patch: Partial<Row>) => setRows(rows.map((r, j) => (j === i ? { ...r, ...patch } : r)));
  const add = () => {
    const p = active.find((x) => !rows.some((r) => r.person_id === x.id)) ?? active[0];
    if (p) setRows([...rows, { person_id: p.id, role: p.roles[0] ?? 'photographer', fee: null }]);
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); save.run(() => onSave(rows)); }}>
      <h2>Crew · {event.name} <small class="muted">{fullLabel(event.date)}</small></h2>
      {active.length === 0 && <p class="muted">Add people on the <a href="#/people">People</a> page first.</p>}
      <table class="tbl compact">
        <thead><tr><th>Person</th><th>Role</th><th class="num">Fee (NPR)</th><th /></tr></thead>
        <tbody>
          {rows.map((r, i) => (
            <tr>
              <td>
                <select value={r.person_id} onChange={(e) => update(i, { person_id: Number(e.currentTarget.value) })}>
                  {active.map((p) => <option value={p.id}>{p.name}</option>)}
                </select>
              </td>
              <td>
                <select value={r.role} onChange={(e) => update(i, { role: e.currentTarget.value as Role })}>
                  {ROLES.map((role) => <option value={role}>{ROLE_LABEL[role]}</option>)}
                </select>
              </td>
              <td class="num">
                <input type="number" min="0" step="500" placeholder="their rate" value={r.fee ?? ''}
                  onInput={(e) => update(i, { fee: e.currentTarget.value === '' ? null : Number(e.currentTarget.value) })} />
              </td>
              <td><button type="button" class="link danger" onClick={() => setRows(rows.filter((_, j) => j !== i))}>Remove</button></td>
            </tr>
          ))}
        </tbody>
      </table>
      <p><button type="button" class="btn ghost sm" onClick={add} disabled={!active.length}>+ Add person</button></p>
      <ErrorNote error={save.error} />
      <div class="row"><button class="btn" disabled={save.busy}>Save crew</button><button type="button" class="btn ghost" onClick={onCancel}>Cancel</button></div>
    </form>
  );
}
