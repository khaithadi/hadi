import { prisma } from '@/lib/db';
import { requireUser } from '@/lib/auth/rbac';
import { hashPassword, verifyPassword } from '@/lib/auth/password';
import { createSession, setSessionCookie } from '@/lib/auth/session';
import { accountUpdateSchema } from '@/lib/validators';
import { ok, fail, handle } from '@/lib/api';

// Update the signed-in user's profile (name / phone) and, optionally, their password.
export async function PATCH(req: Request) {
  return handle(async () => {
    const session = await requireUser();
    const input = accountUpdateSchema.parse(await req.json());

    const user = await prisma.user.findUnique({ where: { id: session.sub } });
    if (!user) return fail('not_found', 'User not found', 404);

    const phone = input.phone && input.phone.length > 0 ? input.phone : null;
    if (phone && phone !== user.phone) {
      const clash = await prisma.user.findFirst({ where: { phone, NOT: { id: user.id } } });
      if (clash) return fail('conflict', 'This phone number is already in use', 409);
    }

    const data: { fullName: string; phone: string | null; passwordHash?: string } = {
      fullName: input.fullName,
      phone,
    };

    if (input.newPassword) {
      const okPw = await verifyPassword(input.currentPassword ?? '', user.passwordHash);
      if (!okPw) return fail('bad_password', 'Current password is incorrect', 403);
      data.passwordHash = await hashPassword(input.newPassword);
    }

    const updated = await prisma.user.update({ where: { id: user.id }, data });

    // The session carries the display name — refresh the cookie if it changed.
    if (updated.fullName !== session.name) {
      const token = await createSession({ sub: updated.id, role: updated.role, name: updated.fullName, locale: updated.locale });
      await setSessionCookie(token);
    }

    return ok({ id: updated.id, fullName: updated.fullName, phone: updated.phone });
  });
}
