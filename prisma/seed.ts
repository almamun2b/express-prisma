import { env } from "@/app/config/env";
import { prisma } from "@/app/config/prisma";
import { hashPassword } from "@/app/utils/hash";
import { logger } from "@/app/utils/logger";
import {
  AuthProviderName,
  UserRole,
  UserStatus,
} from "@/generated/prisma/client";

async function main() {
  logger.info("Seeding database...");

  const superAdminPassword = await hashPassword(
    env.defaultUsers.superAdminPassword,
  );

  const superAdmin = await prisma.user.upsert({
    where: { email: env.defaultUsers.superAdminEmail },
    update: {},
    create: {
      email: env.defaultUsers.superAdminEmail,
      username: env.defaultUsers.superAdminEmail.split("@")[0] || null,
      firstName: "Super",
      lastName: "Admin",
      password: superAdminPassword,
      role: UserRole.SUPER_ADMIN,
      status: UserStatus.ACTIVE,
      isVerified: true,
      verifiedAt: new Date(),
      authProviders: {
        create: {
          provider: AuthProviderName.CREDENTIAL,
          providerId: env.defaultUsers.superAdminEmail,
        },
      },
    },
    select: { id: true, email: true },
  });

  const adminPassword = await hashPassword(env.defaultUsers.adminPassword);

  const admin = await prisma.user.upsert({
    where: { email: env.defaultUsers.adminEmail },
    update: {},
    create: {
      email: env.defaultUsers.adminEmail,
      username: env.defaultUsers.adminEmail.split("@")[0] || null,
      firstName: "Admin",
      lastName: "User",
      password: adminPassword,
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
      isVerified: true,
      verifiedAt: new Date(),
      authProviders: {
        create: {
          provider: AuthProviderName.CREDENTIAL,
          providerId: env.defaultUsers.adminEmail,
        },
      },
    },
    select: { id: true, email: true },
  });

  logger.info("Seed completed:", {
    superAdmin: superAdmin.email,
    admin: admin.email,
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    logger.error("Seed error:", error);
    await prisma.$disconnect();
    process.exit(1);
  });
