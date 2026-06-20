// Pure financial calculations. No React, no DOM — so the same logic can be
// unit-tested in Node and later reused when porting to a mobile framework.

// Subtotal / discount / tax / total for a quote or invoice (same item shape).
// Discount (percent or fixed amount) applies to the subtotal BEFORE tax.
// Tax is a single configurable rate (percent). Both are stored per document.
export function docTotals(doc) {
  const items = (doc && doc.items) || [];
  const subtotal = items.reduce(
    (s, it) => s + (Number(it.qty) || 0) * (Number(it.price) || 0),
    0
  );
  let discount = 0;
  if (doc && doc.discountType && Number(doc.discountValue) > 0) {
    discount =
      doc.discountType === 'percent'
        ? Math.round((subtotal * (Number(doc.discountValue) || 0)) / 100)
        : Number(doc.discountValue) || 0;
  }
  discount = Math.min(discount, subtotal); // never below zero
  const taxedBase = subtotal - discount;
  const rate = doc && doc.applyTax ? Number(doc.taxRate) || 0 : 0;
  const tax = Math.round((taxedBase * rate) / 100);
  return { subtotal, discount, tax, total: taxedBase + tax };
}

// Due / paid / remaining for a worker labor entry (mirrors invoiceState).
export function laborState(entry) {
  const due =
    entry && entry.basis === 'measured'
      ? (Number(entry.quantity) || 0) * (Number(entry.unitPrice) || 0)
      : Number(entry && entry.due) || 0;
  const paid = ((entry && entry.payments) || []).reduce(
    (s, p) => s + (Number(p.amount) || 0),
    0
  );
  const remaining = Math.max(0, due - paid);
  return { due, paid, remaining, progress: due > 0 ? Math.min(1, paid / due) : 0 };
}

// Sum of payments actually made across a set of labor entries (cash basis).
function laborPaid(entries) {
  return entries.reduce((s, e) => s + laborState(e).paid, 0);
}

export function invoicePaid(inv) {
  return ((inv && inv.payments) || []).reduce(
    (s, p) => s + (Number(p.amount) || 0),
    0
  );
}

// Derived payment state + status for an invoice.
export function invoiceState(inv) {
  const { subtotal, discount, tax, total } = docTotals(inv);
  const paid = invoicePaid(inv);
  const remaining = Math.max(0, total - paid);
  let status = 'unpaid';
  if (total > 0 && paid >= total) status = 'paid';
  else if (paid > 0) status = 'partial';
  return {
    subtotal,
    discount,
    tax,
    total,
    paid,
    remaining,
    status,
    progress: total > 0 ? Math.min(1, paid / total) : 0,
  };
}

// Per-customer financial summary + profitability.
export function customerFinance(data, customerId) {
  const invoices = data.invoices.filter((i) => i.customerId === customerId);
  const quotes = data.quotes.filter((q) => q.customerId === customerId);
  const expensesList = data.expenses.filter((e) => e.customerId === customerId);

  let invoiceTotal = 0;
  let received = 0;
  invoices.forEach((inv) => {
    const s = invoiceState(inv);
    invoiceTotal += s.total;
    received += s.paid;
  });

  // Project value = invoiced amount; before anything is invoiced, fall back to
  // the value of accepted quotes so the profile is useful early on.
  let projectValue = invoiceTotal;
  if (projectValue === 0) {
    quotes.forEach((q) => {
      if (q.status === 'accepted') projectValue += docTotals(q).total;
    });
  }

  // Project expenses = regular expenses + labor PAYMENTS for this customer (cash basis).
  const regularExpenses = expensesList.reduce((s, e) => s + (Number(e.amount) || 0), 0);
  const laborForCustomer = (data.labor || []).filter((l) => l.customerId === customerId);
  const expenses = regularExpenses + laborPaid(laborForCustomer);

  return {
    projectValue,
    received,
    remaining: Math.max(0, projectValue - received),
    expenses,
    profit: projectValue - expenses,
  };
}

// App-wide dashboard metrics.
export function dashboardMetrics(data) {
  let revenue = 0;
  let outstanding = 0;
  data.invoices.forEach((inv) => {
    const s = invoiceState(inv);
    revenue += s.paid;
    outstanding += s.remaining;
  });
  // Total expenses = regular expenses + all labor payments (project + general/monthly).
  const regularExpenses = data.expenses.reduce((s, e) => s + (Number(e.amount) || 0), 0);
  const laborExpenses = laborPaid(data.labor || []);
  const expenses = regularExpenses + laborExpenses;
  const workersOwed = (data.labor || []).reduce((s, l) => s + laborState(l).remaining, 0);
  return {
    customers: data.customers.length,
    quotes: data.quotes.length,
    invoices: data.invoices.length,
    revenue,
    expenses,
    profit: revenue - expenses,
    outstanding,
    workersOwed,
  };
}
