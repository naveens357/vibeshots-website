// Opens WhatsApp to one number with the message already typed; the user just presses Send.
import type { ComponentChildren } from 'preact';
import { waLinkTo } from '../lib/messages';

interface Props { phone: string | null | undefined; message: string; children: ComponentChildren; small?: boolean }

export function WhatsAppButton({ phone, message, children, small = false }: Props) {
  const href = waLinkTo(phone, message);
  if (!href) return <span class={`wa-btn off${small ? ' sm' : ''}`} title="Add a phone number first">{children}</span>;
  return (
    <a class={`wa-btn${small ? ' sm' : ''}`} href={href} target="_blank" rel="noopener" title={message}>
      <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm5.3 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.3-.7-2.8-1.1-4.6-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.9s.7-2.1 1-2.4c.3-.3.6-.3.8-.3h.6c.2 0 .4 0 .6.5l.9 2.1c.1.2.1.4 0 .6l-.4.6-.4.4c-.1.2-.3.3-.1.6.2.3.8 1.4 1.8 2.2 1.2 1 2.2 1.4 2.5 1.5.3.2.5.1.7-.1l.9-1.1c.2-.3.4-.2.7-.1l2 1c.3.1.5.2.5.3.1.1.1.6-.1 1.2Z"/></svg>
      {children}
    </a>
  );
}
