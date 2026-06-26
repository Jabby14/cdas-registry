import { Request, Response } from 'express';
import prisma from '../config/prisma.js';

export async function getDashboardStats(req: Request, res: Response): Promise<void> {
  const [totalMembers, activeMembers, totalEvents, duesAgg] = await Promise.all([
    prisma.member.count(),
    prisma.member.count({ where: { status: 'ACTIVE' } }),
    prisma.event.count(),
    prisma.dues.aggregate({ _sum: { amountPaid: true }, where: { status: 'PAID' } }),
  ]);
  const pendingDuesCount = await prisma.dues.count({ where: { status: 'PENDING' } });
  const memberGrowth = await prisma.$queryRaw<{ month: string; count: number }[]>`
    SELECT to_char(date_trunc('month', "joinDate"), 'YYYY-MM') AS month, COUNT(*)::int AS count
    FROM members GROUP BY 1 ORDER BY 1 ASC LIMIT 12
  `;
  res.json({
    totalMembers,
    activeMembers,
    inactiveMembers: totalMembers - activeMembers,
    totalEvents,
    totalDuesCollected: duesAgg._sum.amountPaid || 0,
    pendingDuesCount,
    memberGrowth,
  });
}

export async function getAttendanceSummary(req: Request, res: Response): Promise<void> {
  const events = await prisma.event.findMany({
    include: { _count: { select: { attendance: true } } },
    orderBy: { eventDate: 'desc' },
  });
  const totalActiveMembers = await prisma.member.count({ where: { status: 'ACTIVE' } });
  const summary = events.map((e) => ({
    eventId: e.id,
    title: e.title,
    eventDate: e.eventDate,
    attendedCount: e._count.attendance,
    attendanceRate: totalActiveMembers > 0 ? Math.round((e._count.attendance / totalActiveMembers) * 100) : 0,
  }));
  res.json({ summary });
}

export async function exportMembers(req: Request, res: Response): Promise<void> {
  const members = await prisma.member.findMany({ orderBy: { fullName: 'asc' } });
  const headers = ['membershipNo', 'fullName', 'email', 'phone', 'address', 'status', 'joinDate'];
  const rows = members.map((m) =>
    headers.map((h) => {
      const val = (m as any)[h];
      return val instanceof Date ? val.toISOString() : (val ?? '');
    }).join(',')
  );
  const csv = [headers.join(','), ...rows].join('\n');
  res.header('Content-Type', 'text/csv');
  res.attachment('members.csv');
  res.send(csv);
}