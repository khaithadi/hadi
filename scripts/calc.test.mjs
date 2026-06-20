// Lightweight assertions for the pure calculation layer (run: npm run test:calc).
import { docTotals, invoiceState, customerFinance, dashboardMetrics, laborState } from '../src/lib/calc.js';

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

console.log(fails === 0 ? '\nALL CALC TESTS PASSED' : `\n${fails} FAILURES`);
process.exit(fails ? 1 : 0);
