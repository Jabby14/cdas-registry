import 'dotenv/config';
import { PrismaClient } from './src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL as string });
const p = new PrismaClient({ adapter });

await p.user.update({
  where: { email: 'mofe437@gmail.com' },
  data: { role: 'ADMIN' }
}).then(r => console.log('Done:', r.role));

await p.$disconnect();