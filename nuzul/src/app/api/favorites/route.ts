import { z } from 'zod';
import { prisma } from '@/lib/db';
import { requireUser } from '@/lib/auth/rbac';
import { ok, handle } from '@/lib/api';

const bodySchema = z.object({ propertyId: z.string() });

export async function GET() {
  return handle(async () => {
    const session = await requireUser();
    const favorites = await prisma.favorite.findMany({
      where: { userId: session.sub },
      include: { property: { include: { images: { take: 1, orderBy: { sortOrder: 'asc' } }, wilaya: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return ok({ data: favorites.map((f) => f.property) });
  });
}

// Toggle a favorite on/off.
export async function POST(req: Request) {
  return handle(async () => {
    const session = await requireUser();
    const { propertyId } = bodySchema.parse(await req.json());
    const existing = await prisma.favorite.findUnique({
      where: { userId_propertyId: { userId: session.sub, propertyId } },
    });
    if (existing) {
      await prisma.favorite.delete({ where: { userId_propertyId: { userId: session.sub, propertyId } } });
      return ok({ favorited: false });
    }
    await prisma.favorite.create({ data: { userId: session.sub, propertyId } });
    return ok({ favorited: true });
  });
}
