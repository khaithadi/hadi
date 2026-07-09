import { prisma } from '@/lib/db';
import { requireRole } from '@/lib/auth/rbac';
import { expenseCreateSchema } from '@/lib/validators';
import { ok, fail, handle } from '@/lib/api';

export async function GET(req: Request) {
  return handle(async () => {
    const session = await requireRole('host', 'admin');
    const propertyId = new URL(req.url).searchParams.get('property') || undefined;
    const expenses = await prisma.expense.findMany({
      where: { hostId: session.sub, ...(propertyId ? { propertyId } : {}) },
      include: { property: { select: { title: true } } },
      orderBy: { date: 'desc' },
    });
    return ok({ data: expenses });
  });
}

export async function POST(req: Request) {
  return handle(async () => {
    const session = await requireRole('host', 'admin');
    const input = expenseCreateSchema.parse(await req.json());

    // A property, if given, must belong to the host.
    if (input.propertyId) {
      const owned = await prisma.property.findFirst({
        where: { id: input.propertyId, hostId: session.sub },
        select: { id: true },
      });
      if (!owned) return fail('not_found', 'Property not found', 404);
    }

    const expense = await prisma.expense.create({
      data: {
        hostId: session.sub,
        propertyId: input.propertyId || null,
        category: input.category,
        amount: input.amount,
        note: input.note || null,
        date: new Date(input.date),
      },
    });
    return ok({ expense }, 201);
  });
}
