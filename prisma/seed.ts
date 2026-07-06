import { AuthProviderName, UserRole, UserStatus } from 'generated/prisma/enums';
import { env } from 'src/app/config/env';
import { prisma } from 'src/app/config/prisma';
import { hashPassword } from 'src/app/utils/hash';
import { logger } from 'src/app/utils/logger';

const Messages = {
  SEEDING_DATABASE: 'Seeding database...',
  SEED_COMPLETED: 'Seed completed:',
  SEED_ERROR: 'Seed error:',
} as const;

const superAdminData = {
  email: env.defaultUsers.superAdminEmail,
  password: env.defaultUsers.superAdminPassword,
  username: env.defaultUsers.superAdminEmail.split('@')[0] ?? null,
  firstName: 'Super',
  lastName: 'Admin',
};
const adminData = {
  email: env.defaultUsers.adminEmail,
  password: env.defaultUsers.adminPassword,
  username: env.defaultUsers.adminEmail.split('@')[0] ?? null,
  firstName: 'Admin',
  lastName: 'User',
};

async function main() {
  logger.info(Messages.SEEDING_DATABASE);

  const superAdminPassword = await hashPassword(superAdminData.password);

  const superAdmin = await prisma.user.upsert({
    where: { email: superAdminData.email },
    update: {},
    create: {
      email: superAdminData.email,
      username: superAdminData.username,
      firstName: superAdminData.firstName,
      lastName: superAdminData.lastName,
      password: superAdminPassword,
      role: UserRole.SUPER_ADMIN,
      status: UserStatus.ACTIVE,
      isVerified: true,
      verifiedAt: new Date(),
      authProviders: {
        create: {
          provider: AuthProviderName.CREDENTIAL,
          providerId: superAdminData.email,
        },
      },
    },
    select: { id: true, email: true },
  });

  const adminPassword = await hashPassword(adminData.password);

  const admin = await prisma.user.upsert({
    where: { email: adminData.email },
    update: {},
    create: {
      email: adminData.email,
      username: adminData.username,
      firstName: adminData.firstName,
      lastName: adminData.lastName,
      password: adminPassword,
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
      isVerified: true,
      verifiedAt: new Date(),
      authProviders: {
        create: {
          provider: AuthProviderName.CREDENTIAL,
          providerId: adminData.email,
        },
      },
    },
    select: { id: true, email: true },
  });

  logger.info(Messages.SEED_COMPLETED, {
    superAdmin: superAdmin.email,
    admin: admin.email,
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    logger.error(Messages.SEED_ERROR, error);
    await prisma.$disconnect();
    process.exit(1);
  });
