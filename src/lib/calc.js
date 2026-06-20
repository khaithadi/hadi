// Pure financial calculations. No React, no DOM — so the same logic can be
// unit-tested in Node and later reused when porting to a mobile framework.

// Subtotal / tax / total for a quote or invoice (same item shape).
// Tax is a single configurable rate (percent). taxRate is stored per document.
export function docTotals(doc) {
  const items = (doc && doc.items) || [];
  const subtotal = items.reduce(
    (s, it) => s + (Number(it.qty) || 0) * (Number(it.price) || 0),
    0
  );
  const rate = doc && doc.applyTax ? Number(doc.taxRate) || 0 : 0;
  const tax = Math.round((subtotal * rate) / 100);
  return { subtotal, tax, total: subtotal + tax };
}

export function invoicePaid(inv) {
  return ((inv && inv.payments) || []).reduce(
    (s, p) => s + (Number(p.amount) || 0),
    0
  );
}

// Derived payment state + status for an invoice.
export function invoiceState(inv) {
  const { subtotal, tax, total } = docTotals(inv);
  const paid = invoicePaid(inv);
  const remaining = Math.max(0, total - paid);
  let status = 'unpaid';
  if (total > 0 && paid >= total) status = 'paid';
  else if (paid > 0) status = 'partial';
  return {
    subtotal,
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

  const expenses = expensesList.reduce((s, e) => s + (Number(e.amount) || 0), 0);

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
  const expenses = data.expenses.reduce((s, e) => s + (Number(e.amount) || 0), 0);
  return {
    customers: data.customers.length,
    quotes: data.quotes.length,
    invoices: data.invoices.length,
    revenue,
    expenses,
    profit: revenue - expenses,
    outstanding,
  };
}
