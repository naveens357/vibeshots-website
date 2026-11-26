// Money maths for the dashboard, by Bikram Sambat month. Pure functions over
// the rows the API returns, so they can be tested on their own.
//
// Rules (cash in, costs when they happen):
//   income        client payments by payment date, minus refunds
//   costs         shoot + studio expenses by date, monthly studio costs for every BS month they run
//   staff pay     event fees by event date (events up to today), salary for every BS month from
//                 "salary since" (or the day they were added) up to the current month
//   profit        income − costs − staff pay
import { BS_MONTHS, addDays, bsMonthLength, fromBs, toBs, todayIso } from './bs';

/** BS month as a sortable key "2083-07" (month 0-based, two digits). */
export type MonthKey = string;
export const monthKey = (iso: string): MonthKey => {
  const b = toBs(iso);
  return `${b.year}-${String(b.month).padStart(2, '0')}`;
};
const parseKey = (k: MonthKey) => ({ year: Number(k.slice(0, 4)), month: Number(k.slice(5)) });
export const monthLabel = (k: MonthKey) => { const { year, month } = parseKey(k); return `${BS_MONTHS[month]} ${year}`; };
export const nextMonth = (k: MonthKey, n = 1): MonthKey => {
  const { year, month } = parseKey(k);
  const m = month + n;
  return `${year + Math.floor(m / 12)}-${String(((m % 12) + 12) % 12).padStart(2, '0')}`;
};
/** First and last AD day of a BS month. */
export function monthRange(k: MonthKey) {
  const { year, month } = parseKey(k);
  const from = fromBs({ year, month, day: 1 });
  return { from, to: addDays(from, bsMonthLength(year, month) - 1) };
}
/** BS months from `a` to `b` inclusive (empty if a > b). */
export function monthsBetween(a: MonthKey, b: MonthKey): MonthKey[] {
  const out: MonthKey[] = [];
  for (let k = a; k <= b && out.length < 1200; k = nextMonth(k)) out.push(k);
  return out;
}

export interface Payment { id: number; booking_id: number; date: string; amount: number; kind: 'payment' | 'refund'; method: string; note: string | null; title?: string; client_name?: string }
export interface Expense { id: number; booking_id: number | null; date: string; amount: number; category: string; note: string | null; title?: string | null }
export interface StudioCost { id: number; name: string; category: string; amount: number; start_date: string; end_date: string | null }
export interface PayPerson { id: number; name: string; phone: string | null; pay_type: string; monthly_salary: number | null; event_rate: number | null; salary_since: string | null; created_at: string; active: number }
export interface Fee { person_id: number; role: string; fee: number; date: string; event_name: string; title: string }
export interface StaffPayment { id: number; person_id: number; name: string; date: string; amount: number; kind: string; method: string; note: string | null }
export interface PayData { people: PayPerson[]; fees: Fee[]; paid: StaffPayment[] }
export interface FinanceData extends PayData { payments: Payment[]; expenses: Expense[]; studio_costs: StudioCost[] }

const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);
const inMonth = (k: MonthKey) => (iso: string) => monthKey(iso) === k;
export const signed = (p: Pick<Payment, 'amount' | 'kind'>) => (p.kind === 'refund' ? -p.amount : p.amount);

/** Salary months a person has earned up to (and including) `upTo`'s BS month. */
export function salaryMonths(p: PayPerson, upTo: MonthKey): MonthKey[] {
  if (!p.monthly_salary || p.pay_type === 'per_event') return [];
  return monthsBetween(monthKey(p.salary_since || p.created_at.slice(0, 10)), upTo);
}

/** Monthly studio costs that apply in a BS month. */
export const costsInMonth = (costs: StudioCost[], k: MonthKey) =>
  costs.filter((c) => monthKey(c.start_date) <= k && (!c.end_date || monthKey(c.end_date) >= k));

export interface MonthSummary {
  key: MonthKey; income: number; shootCosts: number; studioCosts: number; monthlyCosts: number;
  eventFees: number; salaries: number; costs: number; staffPay: number; profit: number;
}

export function summarizeMonth(d: FinanceData, k: MonthKey, today = todayIso()): MonthSummary {
  const m = inMonth(k);
  const income = sum(d.payments.filter((p) => m(p.date)).map(signed));
  const expenses = d.expenses.filter((x) => m(x.date));
  const shootCosts = sum(expenses.filter((x) => x.booking_id).map((x) => x.amount));
  const studioCosts = sum(expenses.filter((x) => !x.booking_id).map((x) => x.amount));
  const monthlyCosts = k <= monthKey(today) ? sum(costsInMonth(d.studio_costs, k).map((c) => c.amount)) : 0;
  const eventFees = sum(d.fees.filter((f) => m(f.date) && f.date <= today).map((f) => f.fee));
  const salaries = k <= monthKey(today) ? sum(d.people.filter((p) => salaryMonths(p, k).includes(k)).map((p) => p.monthly_salary ?? 0)) : 0;
  const costs = shootCosts + studioCosts + monthlyCosts;
  const staffPay = eventFees + salaries;
  return { key: k, income, shootCosts, studioCosts, monthlyCosts, eventFees, salaries, costs, staffPay, profit: income - costs - staffPay };
}

export interface PersonBalance { person: PayPerson; fees: number; salary: number; earned: number; paid: number; balance: number }

/** Earned (event fees for events up to today + salary months) minus paid, per person. */
export function balances(d: PayData, today = todayIso()): PersonBalance[] {
  const now = monthKey(today);
  return d.people.map((person) => {
    const fees = sum(d.fees.filter((f) => f.person_id === person.id && f.date <= today).map((f) => f.fee));
    const salary = salaryMonths(person, now).length * (person.monthly_salary ?? 0);
    const paid = sum(d.paid.filter((s) => s.person_id === person.id).map((s) => s.amount));
    return { person, fees, salary, earned: fees + salary, paid, balance: fees + salary - paid };
  });
}

/** Price after discount, money received (net of refunds) and what is still due. */
export function bookingBalance(b: { total_price: number | null; discount: number | null }, payments: Pick<Payment, 'amount' | 'kind'>[]) {
  const price = (b.total_price ?? 0) - (b.discount ?? 0);
  const paid = sum(payments.map(signed));
  return { price, paid, due: Math.max(0, price - paid) };
}

/** The current BS month and the 11 before it, oldest first. */
export const lastTwelveMonths = (today = todayIso()) => monthsBetween(nextMonth(monthKey(today), -11), monthKey(today));

/** BS fiscal year (Shrawan to Asar) containing a date: its 12 month keys. */
export function fiscalYear(iso = todayIso()): MonthKey[] {
  const b = toBs(iso);
  const startYear = b.month >= 3 ? b.year : b.year - 1; // Shrawan is month 3
  return monthsBetween(`${startYear}-03`, `${startYear + 1}-02`);
}

