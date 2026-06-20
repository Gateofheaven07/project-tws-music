import 'dotenv/config';
import { prisma } from '../lib/prisma';
import { hashPassword } from '../lib/auth/password';

/**
 * Seed script buat bikin akun Super Admin pertama.
 * Jalankan: npx ts-node src/prisma/seed.ts
 *
 * Konfigurasi lewat .env:
 *   ADMIN_EMAIL=admin@soundwave.com
 *   ADMIN_PASSWORD=SuperSecret123
 */
async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.error('❌ ADMIN_EMAIL dan ADMIN_PASSWORD harus diset di file .env');
    process.exit(1);
  }

  // Cek apakah user dengan email ini sudah ada
  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    // Kalau sudah ada tapi belum SUPER_ADMIN, upgrade role-nya
    if (existing.role !== 'SUPER_ADMIN') {
      await prisma.user.update({
        where: { email },
        data: { role: 'SUPER_ADMIN' },
      });
      console.log(`✅ User ${email} sudah ada, role di-upgrade ke SUPER_ADMIN.`);
    } else {
      console.log(`ℹ️  Super Admin ${email} sudah ada. Skip.`);
    }
  } else {
    // Bikin akun Super Admin baru
    const hashedPassword = await hashPassword(password);

    const admin = await prisma.user.create({
      data: {
        email,
        username: 'superadmin',
        password: hashedPassword,
        role: 'SUPER_ADMIN',
      },
    });

    console.log(`✅ Super Admin berhasil dibuat!`);
    console.log(`   Email    : ${admin.email}`);
    console.log(`   Username : ${admin.username}`);
    console.log(`   Role     : ${admin.role}`);
  }

  const hashedPassword = await hashPassword(password);

  // Bikin dummy Admin
  const adminEmail = 'moderator@soundwave.com';
  let dummyAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!dummyAdmin) {
    dummyAdmin = await prisma.user.create({
      data: {
        email: adminEmail,
        username: 'moderator_admin',
        password: hashedPassword,
        role: 'ADMIN',
      },
    });
    console.log(`✅ Dummy Admin berhasil dibuat! (${adminEmail})`);
  }

  // Bikin dummy User
  const userEmail = 'user1@soundwave.com';
  let dummyUser = await prisma.user.findUnique({ where: { email: userEmail } });
  if (!dummyUser) {
    dummyUser = await prisma.user.create({
      data: {
        email: userEmail,
        username: 'regular_user',
        password: hashedPassword,
        role: 'USER',
      },
    });
    console.log(`✅ Dummy User berhasil dibuat! (${userEmail})`);
  }
}

main()
  .catch((error) => {
    console.error('❌ Seed error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
