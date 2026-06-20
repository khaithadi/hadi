import { todayISO } from './format.js';

// Build an invoice from a quote (copying items + tax). Caller supplies an id
// generator and a numbering function so this stays pure/testable.
export function convertQuoteToInvoice(quote, makeId, nextNumber) {
  return {
    id: makeId(),
    number: nextNumber('invoice'),
    customerId: quote.customerId,
    quoteId: quote.id,
    date: todayISO(),
    applyTax: !!quote.applyTax,
    taxRate: quote.taxRate,
    items: (quote.items || []).map((it) => ({ ...it, id: makeId() })),
    payments: [],
    notes: quote.notes || '',
  };
}
