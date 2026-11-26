// WhatsApp messages the dashboard prepares. Each builder returns plain text;
// `waLinkTo` turns it into a click-to-chat link for a phone number.
import { waUrl } from '../../lib/whatsapp';
import { fullLabel, timeLabel } from './bs';
import { crewByPerson, type CrewMember } from './crew';
import { ROLE_LABEL, type Role, type StudioEvent } from './types';

/** Nepali mobile "98XXXXXXXX" -> "97798XXXXXXXX"; other numbers keep their digits. */
export function waNumber(phone: string | null | undefined): string | null {
  const digits = (phone || '').replace(/\D/g, '').replace(/^00/, '');
  if (!digits) return null;
  if (digits.length === 10 && digits.startsWith('9')) return `977${digits}`;
  return digits;
}

export const waLinkTo = (phone: string | null | undefined, text: string) => {
  const n = waNumber(phone);
  return n ? waUrl(n, text) : null;
};

const when = (e: StudioEvent) =>
  `📅 ${fullLabel(e.date)}\n⏰ ${e.call_time ? `Call time ${timeLabel(e.call_time)}` : 'Time to be confirmed'}${e.end_time ? `, until about ${timeLabel(e.end_time)}` : ''}`;
const where = (e: StudioEvent) => [e.venue && `📍 ${e.venue}`, e.map_url && `🗺️ ${e.map_url}`].filter(Boolean).join('\n');
const crewLine = (c: CrewMember) => `• ${c.name} (${c.roles.map((r) => ROLE_LABEL[r]).join(' + ')})${c.phone ? ` ${c.phone}` : ''}`;

interface BriefContext { title: string; client_name: string; client_phone: string | null; package?: string | null }

/** Full shoot brief for one crew member. */
export function crewBrief(e: StudioEvent, ctx: BriefContext, person: { name: string; person_id: number }, roles: Role[]) {
  const partners = crewByPerson(e.crew).filter((c) => c.person_id !== person.person_id);
  return [
    `Namaste ${person.name.split(' ')[0]} 🙏`,
    `Shoot brief from Vibeshots Nepal`,
    '',
    `🎬 ${ctx.title}: ${e.name}`,
    when(e),
    where(e),
    '',
    `Your role: ${roles.map((r) => ROLE_LABEL[r]).join(' + ')}`,
    partners.length ? `Shooting with:\n${partners.map(crewLine).join('\n')}` : 'You are the only crew on this event.',
    '',
    `Client: ${ctx.client_name}${ctx.client_phone ? `, ${ctx.client_phone}` : ''}`,
    ctx.package ? `Package: ${ctx.package}` : '',
    e.notes ? `Notes: ${e.notes}` : '',
    '',
    'Please reply to confirm. Thank you!',
  ].join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

/** Booking confirmation to the client, listing every event. */
export function clientConfirmation(b: { title: string; client: { name: string }; events: StudioEvent[]; package?: string | null }) {
  const events = [...b.events].sort((x, y) => x.date.localeCompare(y.date));
  const eventBlocks = events.map((e) => [
    `✨ ${e.name}`,
    when(e),
    where(e),
    e.crew.length ? `Team: ${crewByPerson(e.crew).map((c) => c.name).join(', ')}` : '',
  ].filter(Boolean).join('\n'));
  return [
    `Namaste ${b.client.name} 🙏`,
    `Thank you for booking Vibeshots Nepal${b.package ? ` (${b.package} package)` : ''}. Here are your confirmed dates:`,
    eventBlocks.join('\n\n'),
    'If anything changes, just message us here. We look forward to it!\n— Team Vibeshots',
  ].join('\n\n');
}
