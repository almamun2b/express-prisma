import { QueryBuilder } from '@/app/builder/queryBuilder';
import { prisma } from '@/app/config/prisma';
import { AppError } from '@/app/utils/appError';
import { Codes } from '@/app/utils/codes';
import { excludeUndefined } from '@/app/utils/exclude';
import { fileUploader } from '@/app/utils/fileUploader';
import { comparePassword, hashPassword } from '@/app/utils/hash';
import { logger } from '@/app/utils/logger';
import { pick } from '@/app/utils/pick';
import { AuthProviderName, Prisma, UserStatus } from '@/generated/prisma/client';
import { StatusCodes } from 'http-status-codes';
import { UserConstants, UserMessages } from './user.constants';
import type {
  TChangePasswordInput,
  TCreateUserInput,
  TUpdateProfileInput,
  TUpdateStatusRoleInput,
  TUserQueryOptions,
} from './user.types';

// Without QueryBuilder
const getAllUsersFromDBManually = async (query: TUserQueryOptions = {}) => {
  const {
    page = 1,
    limit = 10,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    searchTerm,
    ...filters
  } = pick(query, [...UserConstants.USER_FILTERABLE_FIELDS]);

  const andConditions: Prisma.UserWhereInput[] = [];

  // 1. Search term match (OR logic across multiple fields)
  if (searchTerm) {
    andConditions.push({
      OR: UserConstants.USER_SEARCHABLE_FIELDS.map((field) => ({
        [field]: {
          contains: searchTerm,
          mode: 'insensitive',
        },
      })),
    });
  }

  // 2. Direct filter matches
  if (filters.role) {
    andConditions.push({ role: filters.role });
  }

  if (filters.status) {
    andConditions.push({ status: filters.status });
  }

  if (filters.isVerified !== undefined) {
    andConditions.push({
      isVerified: filters.isVerified === true || String(filters.isVerified) === 'true',
    });
  }

  if (filters.gender) {
    andConditions.push({ gender: filters.gender });
  }

  // 3. Range filters
  if (filters.createdAtFrom || filters.createdAtTo) {
    andConditions.push({
      createdAt: {
        ...(filters.createdAtFrom && { gte: new Date(filters.createdAtFrom) }),
        ...(filters.createdAtTo && { lte: new Date(filters.createdAtTo) }),
      },
    });
  }

  if (filters.lastLoginAtFrom || filters.lastLoginAtTo) {
    andConditions.push({
      lastLoginAt: {
        ...(filters.lastLoginAtFrom && { gte: new Date(filters.lastLoginAtFrom) }),
        ...(filters.lastLoginAtTo && { lte: new Date(filters.lastLoginAtTo) }),
      },
    });
  }

  if (filters.dateOfBirthFrom || filters.dateOfBirthTo) {
    andConditions.push({
      dateOfBirth: {
        ...(filters.dateOfBirthFrom && { gte: new Date(filters.dateOfBirthFrom) }),
        ...(filters.dateOfBirthTo && { lte: new Date(filters.dateOfBirthTo) }),
      },
    });
  }

  if (filters.avatarSizeMin || filters.avatarSizeMax) {
    andConditions.push({
      avatar: {
        size: {
          ...(filters.avatarSizeMin !== undefined && {
            gte: Number(filters.avatarSizeMin),
          }),
          ...(filters.avatarSizeMax !== undefined && {
            lte: Number(filters.avatarSizeMax),
          }),
        },
      },
    });
  }
  // Options
  const where: Prisma.UserWhereInput = andConditions.length > 0 ? { AND: andConditions } : {};

  const skip = (Number(page) - 1) * Number(limit);
  const take = Number(limit);

  const [total, data] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      select: UserConstants.USER_SAFE_SELECT,
      orderBy: {
        [sortBy]: sortOrder,
      },
      skip,
      take,
    }),
  ]);

  const totalPage = Math.ceil(total / Number(limit));

  return {
    meta: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPage,
    },
    data,
  };
};

// With QueryBuilder
const getAllUsersFromDB = async (query: TUserQueryOptions = {}) => {
  const {
    page = 1,
    limit = 10,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    searchTerm,
    ...filters
  } = pick(query, [...UserConstants.USER_FILTERABLE_FIELDS]);

  const result = await new QueryBuilder(prisma.user)
    .search({
      searchText: searchTerm,
      fields: [...UserConstants.USER_SEARCHABLE_FIELDS],
    })
    .filter({
      role: filters.role,
      status: filters.status,
      gender: filters.gender,
      isVerified: filters.isVerified,
    })
    .range({
      createdAt: { from: filters.createdAtFrom, to: filters.createdAtTo },
      lastLoginAt: { from: filters.lastLoginAtFrom, to: filters.lastLoginAtTo },
      dateOfBirth: { from: filters.dateOfBirthFrom, to: filters.dateOfBirthTo },
      'avatar.size': { from: filters.avatarSizeMin, to: filters.avatarSizeMax },
    })
    .sortBy({ sortBy, sortOrder })
    .paginate({ page, limit })
    .select(UserConstants.USER_SAFE_SELECT)
    .executeWithMeta();

  return result;
};

const createUserInDB = async (payload: TCreateUserInput) => {
  const { email, username } = payload;

  const existingEmail = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (existingEmail) {
    throw new AppError(StatusCodes.CONFLICT, UserMessages.EMAIL_ALREADY_EXISTS, Codes.CONFLICT);
  }

  if (username) {
    const existingUsername = await prisma.user.findUnique({
      where: { username },
      select: { id: true },
    });

    if (existingUsername) {
      throw new AppError(
        StatusCodes.CONFLICT,
        UserMessages.USERNAME_ALREADY_EXISTS,
        Codes.CONFLICT
      );
    }
  }

  const hashedPassword = await hashPassword(payload.password);

  const safePayload = excludeUndefined(payload);

  const newUser = await prisma.user.create({
    data: {
      ...safePayload,
      password: hashedPassword,
      status: payload.status ?? UserStatus.ACTIVE,
      isVerified: true,
      verifiedAt: new Date(),
      authProviders: {
        create: {
          provider: AuthProviderName.CREDENTIAL,
          providerId: payload.email,
        },
      },
    },
    select: UserConstants.USER_SAFE_SELECT,
  });

  return newUser;
};

const getUserByIdFromDB = async (id: string, isMe = false) => {
  const result = await prisma.user.findFirst({
    where: {
      id,
      ...(isMe && { deletedAt: null }),
    },
    select: UserConstants.USER_SAFE_SELECT,
  });

  if (!result) {
    throw new AppError(StatusCodes.NOT_FOUND, UserMessages.USER_NOT_FOUND, Codes.NOT_FOUND);
  }

  return result;
};

const updateUserProfileInDB = async (
  userId: string,
  payload: TUpdateProfileInput,
  avatarFile?: Express.Multer.File
) => {
  const user = await prisma.user.findFirst({
    where: {
      id: userId,
      deletedAt: null,
    },
    select: {
      id: true,
      avatar: {
        select: {
          id: true,
          publicId: true,
        },
      },
    },
  });

  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, UserMessages.USER_NOT_FOUND, Codes.NOT_FOUND);
  }

  let avatarId: string | undefined = undefined;

  if (avatarFile) {
    const uploadResult = await fileUploader.uploadToCloudinary(avatarFile);
    const avatar = await prisma.avatar.create({
      data: {
        publicId: uploadResult.public_id,
        version: String(uploadResult.version),
        width: uploadResult.width,
        height: uploadResult.height,
        format: uploadResult.format,
        resourceType: uploadResult.resource_type,
        type: uploadResult.type,
        url: uploadResult.secure_url,
        size: uploadResult.bytes,
      },
      select: {
        id: true,
      },
    });

    avatarId = avatar.id;

    if (user.avatar) {
      await fileUploader.deleteSingleAsset(user.avatar.publicId).catch(() => {
        logger.error(`Failed to delete old avatar for user: ${userId}`);
      });
      await prisma.avatar.delete({
        where: { id: user.avatar.id },
        select: { id: true },
      });
    }
  }

  const safePayload = excludeUndefined({
    ...payload,
    dateOfBirth: payload.dateOfBirth ? new Date(payload.dateOfBirth) : undefined,
    avatarId,
  });

  const result = await prisma.user.update({
    where: { id: userId },
    data: { ...safePayload },
    select: UserConstants.USER_SAFE_SELECT,
  });

  return result;
};

const updateUserAvatarInDB = async (userId: string, avatarFile: Express.Multer.File) => {
  const user = await prisma.user.findFirst({
    where: { id: userId, deletedAt: null },
    select: {
      id: true,
      avatar: {
        select: {
          id: true,
          publicId: true,
        },
      },
    },
  });

  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, UserMessages.USER_NOT_FOUND, Codes.NOT_FOUND);
  }

  const uploadResult = await fileUploader.uploadToCloudinary(avatarFile);

  const avatarData: Prisma.AvatarCreateInput = {
    publicId: uploadResult.public_id,
    version: String(uploadResult.version),
    width: uploadResult.width,
    height: uploadResult.height,
    format: uploadResult.format,
    resourceType: uploadResult.resource_type,
    type: uploadResult.type,
    url: uploadResult.secure_url,
    size: uploadResult.bytes,
  };

  const avatar = await prisma.avatar.create({
    data: avatarData,
    select: { id: true },
  });

  if (user.avatar) {
    await fileUploader.deleteSingleAsset(user.avatar.publicId).catch(() => {
      logger.error(`Failed to delete old avatar for user: ${userId}`);
    });
    await prisma.avatar.delete({
      where: { id: user.avatar.id },
      select: { id: true },
    });
  }

  const result = await prisma.user.update({
    where: { id: userId },
    data: { avatarId: avatar.id },
    select: {
      id: true,
      avatar: {
        select: {
          id: true,
          url: true,
        },
      },
    },
  });

  return result;
};

const deleteUserAvatarInDB = async (userId: string) => {
  const user = await prisma.user.findFirst({
    where: { id: userId, deletedAt: null },
    select: {
      id: true,
      avatar: {
        select: {
          id: true,
          publicId: true,
        },
      },
    },
  });

  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, UserMessages.USER_NOT_FOUND, Codes.NOT_FOUND);
  }

  if (!user.avatar) {
    throw new AppError(StatusCodes.NOT_FOUND, UserMessages.AVATAR_NOT_FOUND, Codes.NOT_FOUND);
  }

  await fileUploader.deleteSingleAsset(user.avatar.publicId).catch(() => {
    logger.error(`Failed to delete old avatar for user: ${userId}`);
  });
  const result = await prisma.user.update({
    where: { id: userId },
    data: { avatarId: null },
    select: UserConstants.USER_SAFE_SELECT,
  });
  await prisma.avatar.delete({
    where: { id: user.avatar.id },
    select: { id: true },
  });
  return result;
};

const changeUserPasswordInDB = async (userId: string, payload: TChangePasswordInput) => {
  const { oldPassword, newPassword } = payload;

  const user = await prisma.user.findFirst({
    where: { id: userId, deletedAt: null },
    select: { id: true, password: true },
  });

  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, UserMessages.USER_NOT_FOUND, Codes.NOT_FOUND);
  }

  if (!user.password) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      UserMessages.NO_CREDENTIAL_BASED_LOGIN,
      Codes.BAD_REQUEST
    );
  }

  const isPasswordValid = await comparePassword(oldPassword, user.password);
  if (!isPasswordValid) {
    throw new AppError(
      StatusCodes.UNAUTHORIZED,
      UserMessages.INCORRECT_OLD_PASSWORD,
      Codes.UNAUTHORIZED
    );
  }

  if (oldPassword === newPassword) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      UserMessages.SAME_PASSWORD_ERROR,
      Codes.BAD_REQUEST
    );
  }

  const hashedPassword = await hashPassword(newPassword);

  const result = await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
    select: { id: true },
  });

  return result;
};

const updateUserStatusOrRoleInDB = async (userId: string, payload: TUpdateStatusRoleInput) => {
  const user = await prisma.user.findFirst({
    where: {
      id: userId,
      deletedAt: null,
    },
    select: { id: true },
  });

  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, UserMessages.USER_NOT_FOUND, Codes.NOT_FOUND);
  }

  const updateData: Prisma.UserUpdateInput = {};
  if (payload.role) updateData.role = payload.role;
  if (payload.status) updateData.status = payload.status;

  const result = await prisma.user.update({
    where: { id: userId },
    data: updateData,
    select: UserConstants.USER_SAFE_SELECT,
  });

  return result;
};

const softDeleteUserInDB = async (userId: string) => {
  const user = await prisma.user.findFirst({
    where: {
      id: userId,
      deletedAt: null,
    },
    select: { id: true },
  });

  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, UserMessages.DELETED_USER_NOT_FOUND, Codes.NOT_FOUND);
  }

  const result = await prisma.user.update({
    where: { id: userId },
    data: {
      deletedAt: new Date(),
      status: UserStatus.DELETED,
    },
    select: UserConstants.USER_SAFE_SELECT,
  });

  return result;
};

const hardDeleteUserInDB = async (userId: string) => {
  const user = await prisma.user.findFirst({
    where: {
      id: userId,
    },
    select: {
      id: true,
      avatar: {
        select: {
          id: true,
          publicId: true,
        },
      },
    },
  });

  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, UserMessages.USER_NOT_FOUND, Codes.NOT_FOUND);
  }

  if (user.avatar) {
    await fileUploader.deleteSingleAsset(user.avatar.publicId).catch(() => {
      logger.error(`Failed to delete avatar for user: ${userId}`);
    });
  }

  const result = await prisma.user.delete({
    where: { id: userId },
    select: {
      id: true,
      email: true,
    },
  });

  return result;
};

export const UserServices = {
  getAllUsersFromDB,
  getAllUsersFromDBManually,
  getUserByIdFromDB,
  updateUserProfileInDB,
  updateUserStatusOrRoleInDB,
  softDeleteUserInDB,
  hardDeleteUserInDB,
  updateUserAvatarInDB,
  deleteUserAvatarInDB,
  changeUserPasswordInDB,
  createUserInDB,
};
