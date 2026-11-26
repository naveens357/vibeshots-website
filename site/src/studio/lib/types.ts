// Shapes returned by the studio API (worker/studio).
import type { Expense, Payment } from './finance';
export type { Expense, Payment };
export type Access = 'owner' | 'staff' | 'none';
export type Role = 'photographer' | 'cinematographer' | 'drone' | 'editor';
export const ROLES: Role[] = ['photographer', 'cinematographer', 'drone', 'editor'];
export const ROLE_LABEL: Record<Role, string> = { photographer: 'Photographer', cinematographer: 'Cinematographer', drone: 'Drone', editor: 'Editor' };

export interface Me { personId: number; name: string; email: string; access: 'owner' | 'staff' }

export interface Person {
  id: number; name: string; phone: string | null; email?: string | null; access?: Access; roles: Role[];
  pay_type?: 'salary' | 'per_event' | 'both'; monthly_salary?: number | null; event_rate?: number | null; salary_since?: string | null;
  active?: boolean; notes?: string | null;
}

export interface Client { id: number; name: string; phone: string | null; email: string | null; address: string | null; source: string | null; notes: string | null }

export interface Crew { event_id: number; person_id: number; role: Role; name: string; phone: string | null; fee?: number | null }

export interface StudioEvent {
  id: number; booking_id: number; name: string; date: string; call_time: string | null; end_time: string | null;
  venue: string | null; map_url: string | null; notes: string | null; crew: Crew[];
}

/** An event from the calendar endpoint: includes its booking and client. */
export interface CalendarEvent extends StudioEvent {
  title: string; kind: string; status: string; package: string | null; client_name: string; client_phone: string | null;
}

export type BookingKind = 'wedding' | 'prewedding' | 'commercial' | 'other';
export type BookingStatus = 'tentative' | 'confirmed' | 'completed' | 'cancelled';

export interface BookingSummary {
  id: number; client_id: number; title: string; kind: BookingKind; package: string | null; side: string | null;
  total_price: number | null; discount: number | null; status: BookingStatus; notes: string | null;
  client_name: string; client_phone: string | null; first_date: string | null; last_date: string | null; event_count: number; paid: number;
}

export interface Booking extends Omit<BookingSummary, 'client_name' | 'client_phone' | 'first_date' | 'last_date' | 'event_count' | 'paid'> {
  client: Client; events: StudioEvent[]; payments: Payment[]; expenses: Expense[];
}

export const METHOD_LABEL: Record<string, string> = { cash: 'Cash', esewa: 'eSewa', khalti: 'Khalti', fonepay: 'Fonepay QR', bank: 'Bank transfer', cheque: 'Cheque', other: 'Other' };
export const CATEGORY_LABEL: Record<string, string> = {
  travel: 'Travel', food: 'Food', hotel: 'Hotel', permit: 'Permit (drone etc.)', printing: 'Album & printing', storage: 'Pendrive & storage',
  equipment: 'Equipment', rent: 'Rent', utilities: 'Electricity & internet', software: 'Software', marketing: 'Marketing', other: 'Other',
};
export const STAFF_PAY_LABEL: Record<string, string> = { salary: 'Salary', event: 'Event fees', advance: 'Advance', bonus: 'Bonus' };
