import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../config/prisma.js';
import { generateMembershipNo } from '../utils/membershipNo.js';

export async function getMembers(req: Request, res: Response): Promise<void> {
  const { search, status, page = '1', limit = '20' } = req.query as Record<string, string>;
  const where: any = {};
  if (status) where.status = status;
  if (search) {
    where.OR = [
      { fullName: { contains: search, mode: 'insensitive' } },
      { membershipNo: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { phone: { contains: search, mode: 'insensitive' } },
    ];
  }
  const skip = (Number(page) - 1) * Number(limit);
  const [members, total] = await Promise.all([
    prisma.member.findMany({ where, skip, take: Number(limit), orderBy: { createdAt: 'desc' } }),
    prisma.member.count({ where }),
  ]);
  res.json({ members, pagination: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / Number(limit)) } });
}

export async function getMemberById(req: Request, res: Response): Promise<void> {
  const member = await prisma.member.findUnique({
    where: { id: req.params.id },
    include: {
      dues: { include: { duesPeriod: true }, orderBy: { createdAt: 'desc' } },
      eventAttendance: { include: { event: true }, orderBy: { markedAt: 'desc' } },
    },
  });
  if (!member) { res.status(404).json({ message: 'Member not found.' }); return; }
  if (req.user!.role === 'MEMBER' && req.user!.memberId !== member.id) {
    res.status(403).json({ message: 'You can only view your own profile.' }); return;
  }
  res.json({ member });
}

export async function getMyProfile(req: Request, res: Response): Promise<void> {
  if (!req.user!.memberId) { res.status(404).json({ message: 'No member profile linked to this account.' }); return; }
  req.params.id = req.user!.memberId;
  return getMemberById(req, res);
}

export async function createMember(req: Request, res: Response): Promise<void> {
  const { fullName, email, phone, address, dateOfBirth, gender, occupation, createLogin, password } = req.body;
  const membershipNo = await generateMembershipNo();
  const data: any = { membershipNo, fullName, email, phone, address, gender, occupation, dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined };
  if (createLogin) {
    if (!email || !password) { res.status(422).json({ message: 'Email and password required to create a login.' }); return; }
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) { res.status(409).json({ message: 'An account with this email already exists.' }); return; }
    data.user = { create: { email, passwordHash: await bcrypt.hash(password, 10), role: 'MEMBER' } };
  }
  const member = await prisma.member.create({ data, include: { user: true } });
  res.status(201).json({ member });
}

export async function updateMember(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const existing = await prisma.member.findUnique({ where: { id } });
  if (!existing) { res.status(404).json({ message: 'Member not found.' }); return; }
  if (req.user!.role === 'MEMBER') {
    if (req.user!.memberId !== id) { res.status(403).json({ message: 'You can only update your own profile.' }); return; }
    const { phone, address, occupation } = req.body;
    const member = await prisma.member.update({ where: { id }, data: { phone, address, occupation } });
    res.json({ member }); return;
  }
  const { fullName, email, phone, address, dateOfBirth, gender, occupation, status } = req.body;
  const member = await prisma.member.update({ where: { id }, data: { fullName, email, phone, address, gender, occupation, status, dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined } });
  res.json({ member });
}

export async function deactivateMember(req: Request, res: Response): Promise<void> {
  const member = await prisma.member.update({ where: { id: req.params.id }, data: { status: 'INACTIVE' } });
  res.json({ message: 'Member deactivated.', member });

}
