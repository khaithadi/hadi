// STUB delivery adapters. Wire to real providers in production (see
// docs/16-notification-architecture.md). Dev driver logs to the console.

export interface OutboundMessage {
  to: string;
  template: string;
  vars: Record<string, string>;
}

export async function sendSms(msg: OutboundMessage): Promise<void> {
  // TODO: integrate a local SMS aggregator. Dev: log only.
  console.info('[sms:stub]', msg.to, msg.template, msg.vars);
}

export async function sendWhatsApp(msg: OutboundMessage): Promise<void> {
  // TODO: WhatsApp Business API. WhatsApp is the highest-open-rate channel in Algeria.
  console.info('[whatsapp:stub]', msg.to, msg.template, msg.vars);
}

export async function sendEmail(msg: OutboundMessage): Promise<void> {
  // TODO: transactional email (Resend/SES). Dev: log only.
  console.info('[email:stub]', msg.to, msg.template, msg.vars);
}
