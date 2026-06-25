import 'server-only';
import { prisma } from '@/lib/db';
import { AuthError } from '@/lib/auth/rbac';
import { notify } from '@/lib/notifications/service';

/**
 * Booking-based messaging. A conversation links a booking's guest with the property's host;
 * either party may open it and exchange messages. Authorization is enforced here: a user may
 * only touch a conversation when they are that booking's guest or the property's host.
 */

function participantsOf(conv: {
  property: { hostId: string; host: { fullName: string } };
  booking: { guestId: string; guest: { fullName: string } } | null;
}) {
  return {
    hostId: conv.property.hostId,
    hostName: conv.property.host.fullName,
    guestId: conv.booking?.guestId ?? null,
    guestName: conv.booking?.guest.fullName ?? null,
  };
}

/** Create (or fetch the existing) conversation for a booking. Returns its id. */
export async function getOrCreateConversationForBooking(userId: string, bookingId: string): Promise<string> {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { property: { select: { id: true, hostId: true } } },
  });
  if (!booking) throw new AuthError(403, 'Booking not found');
  if (userId !== booking.guestId && userId !== booking.property.hostId) {
    throw new AuthError(403, 'Not a participant of this booking');
  }

  const existing = await prisma.conversation.findUnique({ where: { bookingId } });
  if (existing) return existing.id;

  const created = await prisma.conversation.create({
    data: { propertyId: booking.property.id, bookingId },
  });
  return created.id;
}

/** Conversations the user takes part in (as guest or host), newest-activity first. */
export async function listConversations(userId: string) {
  const convs = await prisma.conversation.findMany({
    where: { OR: [{ booking: { guestId: userId } }, { property: { hostId: userId } }] },
    include: {
      property: { select: { title: true, slug: true, hostId: true, host: { select: { fullName: true } }, images: { take: 1, orderBy: { sortOrder: 'asc' } } } },
      booking: { select: { reference: true, guestId: true, guest: { select: { fullName: true } } } },
      messages: { orderBy: { createdAt: 'desc' }, take: 1 },
    },
  });

  // Unread counts (messages sent by the other party, not yet read) in one query.
  const ids = convs.map((c) => c.id);
  const unreadRows = ids.length
    ? await prisma.message.groupBy({
        by: ['conversationId'],
        where: { conversationId: { in: ids }, senderId: { not: userId }, readAt: null },
        _count: { _all: true },
      })
    : [];
  const unreadByConv = new Map(unreadRows.map((r) => [r.conversationId, r._count._all]));

  return convs
    .map((c) => {
      const p = participantsOf(c);
      const iAmHost = p.hostId === userId;
      return {
        id: c.id,
        propertyTitle: c.property.title,
        propertySlug: c.property.slug,
        image: c.property.images[0]?.url ?? null,
        reference: c.booking?.reference ?? null,
        otherName: (iAmHost ? p.guestName : p.hostName) ?? '—',
        lastMessage: c.messages[0]?.body ?? null,
        lastAt: c.messages[0]?.createdAt ?? c.createdAt,
        unread: unreadByConv.get(c.id) ?? 0,
      };
    })
    .sort((a, b) => b.lastAt.getTime() - a.lastAt.getTime());
}

/** Load a conversation thread for a participant, marking incoming messages read. */
export async function getConversationThread(userId: string, conversationId: string) {
  const conv = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      property: { select: { title: true, slug: true, hostId: true, host: { select: { fullName: true } } } },
      booking: { select: { reference: true, guestId: true, guest: { select: { fullName: true } } } },
      messages: { orderBy: { createdAt: 'asc' }, include: { sender: { select: { fullName: true } } } },
    },
  });
  if (!conv) throw new AuthError(403, 'Conversation not found');

  const p = participantsOf(conv);
  if (userId !== p.hostId && userId !== p.guestId) throw new AuthError(403, 'Not a participant');

  await prisma.message.updateMany({
    where: { conversationId, senderId: { not: userId }, readAt: null },
    data: { readAt: new Date() },
  });

  const iAmHost = p.hostId === userId;
  return {
    id: conv.id,
    propertyTitle: conv.property.title,
    propertySlug: conv.property.slug,
    reference: conv.booking?.reference ?? null,
    otherName: (iAmHost ? p.guestName : p.hostName) ?? '—',
    messages: conv.messages.map((m) => ({
      id: m.id,
      body: m.body,
      mine: m.senderId === userId,
      senderName: m.sender.fullName,
      createdAt: m.createdAt,
    })),
  };
}

/** Post a message to a conversation (participant-only) and notify the other party. */
export async function postMessage(userId: string, input: { conversationId: string; body: string; attachmentUrl?: string }) {
  const conv = await prisma.conversation.findUnique({
    where: { id: input.conversationId },
    include: {
      property: { select: { title: true, hostId: true, host: { select: { fullName: true } } } },
      booking: { select: { guestId: true, guest: { select: { fullName: true } } } },
    },
  });
  if (!conv) throw new AuthError(403, 'Conversation not found');

  const p = participantsOf(conv);
  if (userId !== p.hostId && userId !== p.guestId) throw new AuthError(403, 'Not a participant');

  const message = await prisma.message.create({
    data: { conversationId: input.conversationId, senderId: userId, body: input.body, attachmentUrl: input.attachmentUrl },
  });

  const recipientId = userId === p.hostId ? p.guestId : p.hostId;
  const senderName = userId === p.hostId ? p.hostName : p.guestName;
  if (recipientId) {
    await notify({
      userId: recipientId,
      type: 'message_received',
      title: senderName ?? conv.property.title,
      body: input.body.slice(0, 140),
      data: { conversationId: conv.id },
    });
  }

  return message;
}
