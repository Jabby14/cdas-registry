import 'dotenv/config';
import bcrypt from 'bcryptjs';
import prisma from '../src/config/prisma.js';


async function main() {
  console.log('Seeding database...');
  const password = await bcrypt.hash('password123', 10);

  // Admin user
  await prisma.user.upsert({
    where: { email: 'admin@cdas.org' },
    update: {},
    create: { email: 'admin@cdas.org', passwordHash: password, role: 'ADMIN' },
  });

  // Members with accounts
  const memberData = [
    { name: 'Adaeze Okonkwo', email: 'adaeze@cdas.org', phone: '08031234567' },
    { name: 'Chinedu Eze', email: 'chinedu@cdas.org', phone: '08039876543' },
    { name: 'Fatima Bello', email: 'fatima@cdas.org', phone: '08051122334' },
    { name: 'Tunde Bakare', email: 'tunde@cdas.org', phone: '08067788990' },
    { name: 'Ngozi Umeh', email: 'ngozi@cdas.org', phone: '08023344556' },
  ];

  const members = [];
  for (let i = 0; i < memberData.length; i++) {
    const m = memberData[i];
    const membershipNo = `CDAS-2026-${String(i + 2).padStart(4, '0')}`;
    const member = await prisma.member.upsert({
      where: { membershipNo },
      update: {},
      create: {
        membershipNo,
        fullName: m.name,
        email: m.email,
        phone: m.phone,
        address: 'Lagos, Nigeria',
        status: 'ACTIVE',
        user: {
          create: { email: m.email, passwordHash: password, role: 'MEMBER' },
        },
      },
    });
    members.push(member);
  }

  // Dues period
  const period = await prisma.duesPeriod.create({
    data: { label: 'Q2 2026', amount: 5000, dueDate: new Date('2026-06-30') },
  });

  // Assign dues
  for (let i = 0; i < members.length; i++) {
    await prisma.dues.create({
      data: {
        memberId: members[i].id,
        duesPeriodId: period.id,
        status: i % 2 === 0 ? 'PAID' : 'PENDING',
        amountPaid: i % 2 === 0 ? 5000 : 0,
        paidDate: i % 2 === 0 ? new Date() : null,
      },
    });
  }

  // Event with attendance
  const event = await prisma.event.create({
    data: {
      title: 'Q2 General Meeting',
      description: 'Review of Q2 activities and financial report.',
      location: 'Community Hall, Lagos',
      eventDate: new Date('2026-06-15'),
    },
  });

  for (let i = 0; i < 3; i++) {
    await prisma.eventAttendance.create({
      data: { eventId: event.id, memberId: members[i].id, attended: true },
    });
  }

  console.log('Seed complete!');
  console.log('Credentials (password: password123):');
  console.log('  Admin:  admin@cdas.org');
  console.log('  Member: adaeze@cdas.org');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());