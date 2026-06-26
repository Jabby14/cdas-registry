import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/prisma.js';
import { generateMembershipNo } from '../utils/membershipNo.js';

function signToken(user: { id: string; email: string; role: string; member?: { id: string } | null }) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      memberId: user.member?.id || null,
    },
    process.env.JWT_SECRET as string,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

function sanitizeUser(user: any) {
  const { passwordHash, ...rest } = user;
  return rest;
}

export async function register(req: Request, res: Response): Promise<void> {
  const { email, password, fullName, phone, address } = req.body;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    res.status(409).json({ message: 'An account with this email already exists.' });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const membershipNo = await generateMembershipNo();

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      role: 'MEMBER',
      member: {
        create: { membershipNo, fullName, phone, address, email },
      },
    },
    include: { member: true },
  });

  const token = signToken(user);
  res.status(201).json({ token, user: sanitizeUser(user) });
}

export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({
    where: { email },
    include: { member: true },
  });

  if (!user || !user.isActive) {
    res.status(401).json({ message: 'Invalid email or password.' });
    return;
  }

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) {
    res.status(401).json({ message: 'Invalid email or password.' });
    return;
  }

  const token = signToken(user);
  res.json({ token, user: sanitizeUser(user) });
}

export async function me(req: Request, res: Response): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    include: { member: true },
  });
  if (!user) {
    res.status(404).json({ message: 'User not found.' });
    return;
  }
  res.json({ user: sanitizeUser(user) });
}
