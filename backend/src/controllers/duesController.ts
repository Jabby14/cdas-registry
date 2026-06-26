import { Request, Response } from 'express';
import prisma from '../config/prisma.js';

export async function createDuesPeriod(req: Request, res: Response): Promise<void> {
  const { label, amount, dueDate } = req.body;
  const period = await prisma.duesPeriod.create({
    data: { label, amount, dueDate: new Date(dueDate) },
  });
  const activeMembers = await prisma.member.findMany({
    where: { status: 'ACTIVE' }, select: { id: true },
  });
  if (activeMembers.length > 0) {
    await prisma.dues.createMany({
      data: activeMembers.map((m) => ({ memberId: m.id, duesPeriodId: period.id, status: 'PENDING' })),
      skipDuplicates: true,
    });
  }
  res.status(201).json({ period, membersAssigned: activeMembers.length });
}

export async function getDuesPeriods(req: Request, res: Response): Promise<void> {
  const periods = await prisma.duesPeriod.findMany({
    orderBy: { dueDate: 'desc' },
    include: { _count: { select: { dues: true } } },
  });
  res.json({ periods });
}

export async function getDues(req: Request, res: Response): Promise<void> {
  const { duesPeriodId, status, memberId } = req.query as Record<string, string>;
  const where: any = {};
  if (duesPeriodId) where.duesPeriodId = duesPeriodId;
  if (status) where.status = status;
  if (memberId) where.memberId = memberId;
  const dues = await prisma.dues.findMany({
    where,
    include: {
      member: { select: { id: true, fullName: true, membershipNo: true } },
      duesPeriod: true,
    },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ dues });
}

export async function getMyDues(req: Request, res: Response): Promise<void> {
  if (!req.user!.memberId) {
    res.status(404).json({ message: 'No member profile linked to this account.' });
    return;
  }
  const dues = await prisma.dues.findMany({
    where: { memberId: req.user!.memberId },
    include: { duesPeriod: true },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ dues });
}

export async function markDuesPaid(req: Request, res: Response): Promise<void> {
  const { amountPaid, paymentRef } = req.body;
  const dues = await prisma.dues.update({
    where: { id: req.params.id },
    data: { status: 'PAID', amountPaid, paymentRef, paidDate: new Date() },
    include: { member: true, duesPeriod: true },
  });
  res.json({ dues });
}

export async function getDuesSummary(req: Request, res: Response): Promise<void> {
  const totalPaid = await prisma.dues.aggregate({
    _sum: { amountPaid: true },
    where: { status: 'PAID' },
  });
  const counts = await prisma.dues.groupBy({
    by: ['status'],
    _count: { status: true },
  });
  res.json({
    totalCollected: totalPaid._sum.amountPaid || 0,
    breakdown: counts.map((c) => ({ status: c.status, count: c._count.status })),
  });
}