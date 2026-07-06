import { UserStatus } from 'generated/prisma/client';
import { StatusCodes } from 'http-status-codes';
import { AppError } from 'src/app/utils/appError';
import { catchAsync } from 'src/app/utils/catchAsync';
import { Codes } from 'src/app/utils/codes';
import { sendResponse } from 'src/app/utils/sendResponse';
import { UserMessages } from './user.constants';
import { UserServices } from './user.service';
import type {
  TChangePasswordInput,
  TCreateUserInput,
  TUpdateProfileInput,
  TUpdateRoleInput,
  TUpdateStatusInput,
  TUserQueryOptions,
} from './user.types';

const getAllUsers = catchAsync(async (req, res) => {
  const query = (req?.validatedQuery as TUserQueryOptions | undefined) ?? {};
  const result = await UserServices.getAllUsersFromDB(query);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: UserMessages.FETCH_SUCCESS,
    path: req.originalUrl,
    data: result.data,
    meta: result.meta,
  });
});

const getAllUsersWithCursor = catchAsync(async (req, res) => {
  const query = (req?.validatedQuery as TUserQueryOptions | undefined) ?? {};
  const result = await UserServices.getAllUsersWithCursor(query);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: UserMessages.FETCH_SUCCESS,
    path: req.originalUrl,
    data: result.data,
    meta: result.meta,
  });
});

const createUser = catchAsync(async (req, res) => {
  const result = await UserServices.createUserInDB(req.body as TCreateUserInput);

  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: UserMessages.CREATE_SUCCESS,
    path: req.originalUrl,
    data: result,
  });
});

const getMyProfile = catchAsync(async (req, res) => {
  const userId = req.user?.id;
  if (!userId) {
    throw new AppError(StatusCodes.UNAUTHORIZED, 'Unauthorized', Codes.UNAUTHORIZED);
  }
  const result = await UserServices.getUserByIdFromDB(userId, true);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: UserMessages.PROFILE_SUCCESS,
    path: req.originalUrl,
    data: result,
  });
});

const updateMyProfile = catchAsync(async (req, res) => {
  const userId = req.user?.id;
  if (!userId) {
    throw new AppError(StatusCodes.UNAUTHORIZED, 'Unauthorized', Codes.UNAUTHORIZED);
  }
  const result = await UserServices.updateUserProfileInDB(
    userId,
    req.body as TUpdateProfileInput,
    req.file
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: UserMessages.UPDATE_SUCCESS,
    path: req.originalUrl,
    data: result,
  });
});

const updateMyAvatar = catchAsync(async (req, res) => {
  const userId = req.user?.id;
  if (!userId) {
    throw new AppError(StatusCodes.UNAUTHORIZED, 'Unauthorized', Codes.UNAUTHORIZED);
  }
  if (!req.file) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Avatar file is required', Codes.BAD_REQUEST);
  }
  const result = await UserServices.updateUserAvatarInDB(userId, req.file);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: UserMessages.AVATAR_UPDATE_SUCCESS,
    path: req.originalUrl,
    data: result,
  });
});

const deleteMyAvatar = catchAsync(async (req, res) => {
  const userId = req.user?.id;
  if (!userId) {
    throw new AppError(StatusCodes.UNAUTHORIZED, 'Unauthorized', Codes.UNAUTHORIZED);
  }
  const result = await UserServices.deleteUserAvatarInDB(userId);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: UserMessages.AVATAR_DELETE_SUCCESS,
    path: req.originalUrl,
    data: result,
  });
});

const changeMyPassword = catchAsync(async (req, res) => {
  const userId = req.user?.id;
  if (!userId) {
    throw new AppError(StatusCodes.UNAUTHORIZED, 'Unauthorized', Codes.UNAUTHORIZED);
  }
  await UserServices.changeUserPasswordInDB(userId, req.body as TChangePasswordInput);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: UserMessages.PASSWORD_CHANGE_SUCCESS,
    path: req.originalUrl,
  });
});

const deactivateMyAccount = catchAsync(async (req, res) => {
  const userId = req.user?.id;
  if (!userId) {
    throw new AppError(StatusCodes.UNAUTHORIZED, 'Unauthorized', Codes.UNAUTHORIZED);
  }
  const result = await UserServices.updateUserStatusOrRoleInDB(userId, {
    status: UserStatus.INACTIVE,
  });

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: UserMessages.DEACTIVATE_SUCCESS,
    path: req.originalUrl,
    data: result,
  });
});

const reactivateMyAccount = catchAsync(async (req, res) => {
  const userId = req.user?.id;
  if (!userId) {
    throw new AppError(StatusCodes.UNAUTHORIZED, 'Unauthorized', Codes.UNAUTHORIZED);
  }
  const result = await UserServices.updateUserStatusOrRoleInDB(userId, {
    status: UserStatus.ACTIVE,
  });

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: UserMessages.REACTIVATE_SUCCESS,
    path: req.originalUrl,
    data: result,
  });
});

const getUserById = catchAsync(async (req, res) => {
  const { id } = req.params;

  if (!id || Array.isArray(id)) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Invalid user ID', Codes.BAD_REQUEST);
  }
  const result = await UserServices.getUserByIdFromDB(id);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: UserMessages.DETAIL_SUCCESS,
    path: req.originalUrl,
    data: result,
  });
});

const updateUserStatus = catchAsync(async (req, res) => {
  const { id } = req.params;
  if (!id || Array.isArray(id)) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Invalid user ID', Codes.BAD_REQUEST);
  }
  const result = await UserServices.updateUserStatusOrRoleInDB(id, req.body as TUpdateStatusInput);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: UserMessages.STATUS_UPDATE_SUCCESS,
    path: req.originalUrl,
    data: result,
  });
});

const updateUserRole = catchAsync(async (req, res) => {
  const { id } = req.params;
  if (!id || Array.isArray(id)) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Invalid user ID', Codes.BAD_REQUEST);
  }
  const result = await UserServices.updateUserStatusOrRoleInDB(id, req.body as TUpdateRoleInput);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: UserMessages.ROLE_UPDATE_SUCCESS,
    path: req.originalUrl,
    data: result,
  });
});

const softDeleteUser = catchAsync(async (req, res) => {
  const { id } = req.params;

  if (!id || Array.isArray(id)) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Invalid user ID', Codes.BAD_REQUEST);
  }
  const result = await UserServices.softDeleteUserInDB(id);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: UserMessages.SOFT_DELETE_SUCCESS,
    path: req.originalUrl,
    data: result,
  });
});

const hardDeleteUser = catchAsync(async (req, res) => {
  const { id } = req.params;
  if (!id || Array.isArray(id)) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Invalid user ID', Codes.BAD_REQUEST);
  }
  const result = await UserServices.hardDeleteUserInDB(id);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: UserMessages.HARD_DELETE_SUCCESS,
    path: req.originalUrl,
    data: result,
  });
});

export const UserControllers = {
  getAllUsers,
  getAllUsersWithCursor,
  getUserById,
  getMyProfile,
  updateMyProfile,
  updateMyAvatar,
  deleteMyAvatar,
  changeMyPassword,
  createUser,
  updateUserStatus,
  updateUserRole,
  deactivateMyAccount,
  reactivateMyAccount,
  softDeleteUser,
  hardDeleteUser,
};
