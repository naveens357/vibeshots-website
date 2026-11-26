// Form building blocks: labelled fields, a small form-state hook and a save button.
import type { ComponentChildren } from 'preact';
import { useState } from 'preact/hooks';

export function Field({ label, hint, children, wide = false }: { label: string; hint?: string; children: ComponentChildren; wide?: boolean }) {
  return (
    <label class={`field${wide ? ' wide' : ''}`}>
      <span class="lab">{label}</span>
      {children}
      {hint && <span class="hint">{hint}</span>}
    </label>
  );
}

type Values = Record<string, any>;

/** Form values plus an `on(name)` handler for inputs, selects and textareas. */
export function useForm<T extends Values>(initial: T) {
  const [values, setValues] = useState<T>(initial);
  const set = <K extends keyof T>(name: K, value: T[K]) => setValues((v) => ({ ...v, [name]: value }));
  const on = (name: keyof T) => (e: Event) => {
    const el = e.currentTarget as HTMLInputElement;
    set(name, (el.type === 'number' ? (el.value === '' ? null : Number(el.value)) : el.value) as T[keyof T]);
  };
  return { values, set, on, setValues };
}

/** Runs an async save, showing progress and any error message. */
export function useSave() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const run = async (fn: () => Promise<unknown>) => {
    setBusy(true);
    setError(null);
    try {
      await fn();
      return true;
    } catch (e) {
      setError((e as Error).message);
      return false;
    } finally {
      setBusy(false);
    }
  };
  return { busy, error, run };
}

export const ErrorNote = ({ error }: { error: string | null }) => (error ? <p class="err" role="alert">{error}</p> : null);
export const Loading = () => <p class="muted">Loading…</p>;
