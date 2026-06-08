import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const url = process.env.DATABASE_URL;
if (!url) {
  throw new Error('DATABASE_URL belum diset di environment.');
}

const prisma = new PrismaClient({
  adapter: new PrismaPg(url),
});

async function main() {
  console.log('--- START SEEDING ---');

  const rawPassword = process.env.SEED_ADMIN_PASSWORD ?? 'admin123';
  const username = process.env.SEED_ADMIN_USERNAME ?? 'admin';
  const nik = process.env.SEED_ADMIN_NIK ?? '1234567890';
  const email = process.env.SEED_ADMIN_EMAIL ?? 'admin@tumbuh.com';
  const nama = process.env.SEED_ADMIN_NAMA ?? 'Super Admin';
  const hashedPassword = await bcrypt.hash(rawPassword, 10);

  const admin = await prisma.user.upsert({
    where: { username },
    update: {
      password: hashedPassword,
      nik,
      email,
      nama,
      role: 'ADMIN',
    },
    create: {
      username,
      nik,
      nama,
      email,
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  console.log('✅ Admin User created/updated:');
  console.log({
    id: admin.id,
    username: admin.username,
    role: admin.role,
  });
  
  console.log(`🚀 Silakan login di Scalar dengan:
     Identifier: ${username}
     Password  : ${rawPassword}`);
  
  console.log('--- SEEDING FINISHED ---');
}

main()
  .catch((e) => {
    console.error('❌ Seeding Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });