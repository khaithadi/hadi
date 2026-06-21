// Lightweight assertions for the pure calculation layer (run: npm run test:calc).
import { docTotals, invoiceState, customerFinance, dashboardMetrics, laborState, laborDue, workerRates, dayHours, dayAmount, periodSummary } from '../src/lib/calc.js';

let fails = 0;
const ok = (name, cond) => { console.log((cond ? 'OK  ' : 'XX  ') + name); if (!cond) fails++; };
const eq = (name, a, b) => ok(`${name} (${a} === ${b})`, a === b);

// docTotals with configurable tax
const q = { items: [{ qty: 2, price: 1000 }, { qty: 1, price: 500 }], applyTax: true, taxRate: 19 };
eq('subtotal', docTotals(q).subtotal, 2500);
eq('tax 19%', docTotals(q).tax, 475);
eq('total', docTotals(q).total, 2975);
eq('tax off', docTotals({ ...q, applyTax: false }).tax, 0);
eq('tax 0%', docTotals({ ...q, taxRate: 0 }).tax, 0);
eq('tax 9%', docTotals({ ...q, taxRate: 9 }).tax, 225);

// invoiceState payment logic
const inv = { items: [{ qty: 1, price: 1000 }], applyTax: false, payments: [{ amount: 400 }] };
eq('partial paid', invoiceState(inv).paid, 400);
eq('partial remaining', invoiceState(inv).remaining, 600);
eq('partial status', invoiceState(inv).status, 'partial');
eq('unpaid status', invoiceState({ ...inv, payments: [] }).status, 'unpaid');
eq('paid status', invoiceState({ ...inv, payments: [{ amount: 1000 }] }).status, 'paid');

// customerFinance + dashboard
const data = {
  customers: [{ id: 'c1' }],
  quotes: [{ customerId: 'c1', status: 'accepted', items: [{ qty: 1, price: 5000 }] }],
  invoices: [{ customerId: 'c1', items: [{ qty: 1, price: 10000 }], applyTax: false, payments: [{ amount: 4000 }] }],
  expenses: [{ customerId: 'c1', amount: 3000 }, { customerId: 'c1', amount: 1000 }],
};
const fin = customerFinance(data, 'c1');
eq('projectValue = invoiced', fin.projectValue, 10000);
eq('received', fin.received, 4000);
eq('remaining', fin.remaining, 6000);
eq('expenses', fin.expenses, 4000);
eq('profit = value - expenses', fin.profit, 6000);

// projectValue falls back to accepted quotes when nothing invoiced
const fin2 = customerFinance({ ...data, invoices: [] }, 'c1');
eq('projectValue fallback to accepted quote', fin2.projectValue, 5000);

const m = dashboardMetrics(data);
eq('revenue = sum payments', m.revenue, 4000);
eq('expenses total', m.expenses, 4000);
eq('outstanding = sum remaining', m.outstanding, 6000);
eq('net profit', m.profit, 0);

// ---- discount (applied to subtotal BEFORE tax) ----
const dq = { items: [{ qty: 1, price: 10000 }], applyTax: false };
eq('discount percent', docTotals({ ...dq, discountType: 'percent', discountValue: 10 }).discount, 1000);
eq('discount percent total', docTotals({ ...dq, discountType: 'percent', discountValue: 10 }).total, 9000);
eq('discount amount', docTotals({ ...dq, discountType: 'amount', discountValue: 2500 }).total, 7500);
eq('discount capped at subtotal', docTotals({ ...dq, discountType: 'amount', discountValue: 99999 }).total, 0);
// discount before tax: (10000 - 1000) * 1.19 = 10710
eq('discount then tax', docTotals({ ...dq, applyTax: true, taxRate: 19, discountType: 'percent', discountValue: 10 }).total, 10710);

// ---- laborState ----
const lAmount = { basis: 'amount', due: 20000, payments: [{ amount: 8000 }] };
eq('labor due (amount)', laborState(lAmount).due, 20000);
eq('labor paid', laborState(lAmount).paid, 8000);
eq('labor remaining', laborState(lAmount).remaining, 12000);
const lMeasured = { basis: 'measured', quantity: 40, unitPrice: 1500, payments: [] };
eq('labor due (measured = qty×price)', laborState(lMeasured).due, 60000);

// ---- labor in finance: cash basis, general vs project ----
const ld = {
  customers: [{ id: 'c1' }],
  quotes: [],
  invoices: [{ customerId: 'c1', items: [{ qty: 1, price: 100000 }], applyTax: false, payments: [{ amount: 100000 }] }],
  expenses: [],
  labor: [
    { workerId: 'w1', customerId: 'c1', basis: 'amount', due: 30000, payments: [{ amount: 20000 }] }, // project: 20k paid
    { workerId: 'w2', customerId: null, basis: 'amount', due: 50000, payments: [{ amount: 50000 }] }, // monthly/general: 50k paid
  ],
};
eq('customer expenses = project labor PAID only', customerFinance(ld, 'c1').expenses, 20000);
eq('customer profit = value - paid labor', customerFinance(ld, 'c1').profit, 80000);
const lm = dashboardMetrics(ld);
eq('dashboard expenses = all labor payments', lm.expenses, 70000); // 20k + 50k
eq('dashboard net profit', lm.profit, 30000); // revenue 100k - 70k
eq('workers owed (remaining)', lm.workersOwed, 10000); // only project entry has 10k remaining

// ---- project labor: measured multi-line items ----
const measured = { basis: 'measured', items: [
  { quantity: 25, unit: 'م²', price: 800 },
  { quantity: 12.5, unit: 'م.ط', price: 1200 },
], payments: [] };
eq('labor due from items (25×800 + 12.5×1200)', laborDue(measured), 35000);
eq('labor remaining from items', laborState(measured).remaining, 35000);

// ---- monthly worker timesheet ----
const worker = { dailySalary: 2200, dailyHours: 8 };
const rates = workerRates(worker);
eq('hourly rate = salary/hours', rates.hourly, 275);
eq('overtime rate = 1.5× hourly', rates.overtime, 412.5);
eq('day hours 08:00->14:30 = 6.5', dayHours({ start: '08:00', end: '14:30', overtime: 0 }).regular, 6.5);
eq('day total with overtime', dayHours({ start: '08:00', end: '16:00', overtime: 2 }).total, 10);
// amount: 8 regular ×275 + 2 OT ×412.5 = 2200 + 825 = 3025
eq('day amount regular + OT×1.5', dayAmount({ start: '08:00', end: '16:00', overtime: 2 }, rates), 3025);

const ts = [
  { id: 't1', workerId: 'w1', date: '2026-06-01', start: '08:00', end: '16:00', overtime: 0, paid: false },   // 8h -> 2200
  { id: 't2', workerId: 'w1', date: '2026-06-02', start: '08:00', end: '14:30', overtime: 0, paid: false },   // 6.5h -> 1787.5 ->round
  { id: 't3', workerId: 'w1', date: '2026-05-30', start: '08:00', end: '16:00', overtime: 0, paid: true },    // out of range / paid
];
const ps = periodSummary(ts, 'w1', '2026-06-01', '2026-06-30', rates, { unpaidOnly: true });
eq('period days (unpaid in range)', ps.days.length, 2);
eq('period regular hours', ps.regular, 14.5);
eq('period amount rounded', ps.amount, Math.round(14.5 * 275)); // 3988

console.log(fails === 0 ? '\nALL CALC TESTS PASSED' : `\n${fails} FAILURES`);
process.exit(fails ? 1 : 0);
