import prisma from '../config/prisma.js';

export async function generateMembershipNo(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `CDAS-${year}-`;

  const count = await prisma.member.count({
    where: { membershipNo: { startsWith: prefix } },
  });

  const sequence = String(count + 1).padStart(4, '0');
  return `${prefix}${sequence}`;
}
