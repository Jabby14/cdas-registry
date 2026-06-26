import { Request, Response } from 'express';
import prisma from '../config/prisma.js';

export async function getEvents(req: Request, res: Response): Promise<void> {
  const events = await prisma.event.findMany({
    orderBy: { eventDate: 'desc' },
    include: { _count: { select: { attendance: true } } },
  });
  res.json({ events });
}

export async function getEventById(req: Request, res: Response): Promise<void> {
  const event = await prisma.event.findUnique({
    where: { id: req.params.id },
    include: {
      attendance: {
        include: { member: { select: { id: true, fullName: true, membershipNo: true } } },
      },
    },
  });
  if (!event) { res.status(404).json({ message: 'Event not found.' }); return; }
  res.json({ event });
}

export async function createEvent(req: Request, res: Response): Promise<void> {
  const { title, description, location, eventDate } = req.body;
  const event = await prisma.event.create({
    data: { title, description, location, eventDate: new Date(eventDate) },
  });
  res.status(201).json({ event });
}

export async function updateEvent(req: Request, res: Response): Promise<void> {
  const { title, description, location, eventDate } = req.body;
  const event = await prisma.event.update({
    where: { id: req.params.id },
    data: { title, description, location, eventDate: eventDate ? new Date(eventDate) : undefined },
  });
  res.json({ event });
}

export async function deleteEvent(req: Request, res: Response): Promise<void> {
  await prisma.event.delete({ where: { id: req.params.id } });
  res.json({ message: 'Event deleted.' });
}

export async function markAttendance(req: Request, res: Response): Promise<void> {
  const { id: eventId } = req.params;
  const { memberIds } = req.body;
  if (!Array.isArray(memberIds) || memberIds.length === 0) {
    res.status(422).json({ message: 'memberIds must be a non-empty array.' }); return;
  }
  const results = await prisma.$transaction(
    memberIds.map((memberId: string) =>
      prisma.eventAttendance.upsert({
        where: { eventId_memberId: { eventId, memberId } },
        update: { attended: true, markedAt: new Date() },
        create: { eventId, memberId, attended: true },
      })
    )
  );
  res.json({ message: `Attendance marked for ${results.length} member(s).` });
}

export async function getMyAttendance(req: Request, res: Response): Promise<void> {
  if (!req.user!.memberId) {
    res.status(404).json({ message: 'No member profile linked.' }); return;
  }
  const attendance = await prisma.eventAttendance.findMany({
    where: { memberId: req.user!.memberId },
    include: { event: true },
    orderBy: { markedAt: 'desc' },
  });
  res.json({ attendance });
}