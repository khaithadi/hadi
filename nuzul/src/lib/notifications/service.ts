import { prisma } from '@/lib/db';
import type { NotificationType } from '@prisma/client';
import { sendPush } from './push';

export interface NotifyInput {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

// Single entry point: persists an in-app notification and fans out to channels.
// Push is active (Web Push); SMS/email/WhatsApp are stubbed adapters (see ./channels).
export async function notify(input: NotifyInput): Promise<void> {
  await prisma.notification.create({
    data: {
      userId: input.userId,
      type: input.type,
      title: input.title,
      body: input.body,
      data: (input.data ?? undefined) as never,
    },
  });

  try {
    await sendPush(input.userId, { title: input.title, body: input.body, data: input.data });
  } catch (err) {
    // Never let a channel failure block the booking transaction.
    console.warn('[notifications] push failed', err);
  }
}
