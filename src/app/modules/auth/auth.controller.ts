import { StatusCodes } from 'http-status-codes';
import { catchAsync } from 'src/app/utils/catchAsync';
import { sendResponse } from 'src/app/utils/sendResponse';
import { setAuthCookies } from 'src/app/utils/setCookie';
import { AuthServices } from './auth.service';
import type {
  TForgotPasswordInput,
  TLoginInput,
  TRegisterInput,
  TResendVerificationInput,
  TResetPasswordInput,
  TVerifyEmailInput,
} from './auth.types';

const register = catchAsync(async (req, res) => {
  const result = await AuthServices.register(req.body as TRegisterInput);

  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: result.message,
    path: req.originalUrl,
  });
});

const resendVerificationCode = catchAsync(async (req, res) => {
  const result = await AuthServices.resendVerificationCode(req.body as TResendVerificationInput);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: result.message,
    path: req.originalUrl,
  });
});

const verifyEmail = catchAsync(async (req, res) => {
  const result = await AuthServices.verifyEmail(req.body as TVerifyEmailInput);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: result.message,
    path: req.originalUrl,
  });
});

const login = catchAsync(async (req, res) => {
  const result = await AuthServices.login(req.body as TLoginInput);

  setAuthCookies(res, result.tokens);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: result.message,
    path: req.originalUrl,
    data: {
      ...result.user,
    },
  });
});

const refreshToken = catchAsync(async (req, res) => {
  const result = await AuthServices.refreshToken(req, res);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: result.message,
    path: req.originalUrl,
  });
});

const logout = catchAsync(async (req, res) => {
  const result = await AuthServices.logout(req, res);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: result.message,
    path: req.originalUrl,
  });
});

const forgotPassword = catchAsync(async (req, res) => {
  const result = await AuthServices.forgotPassword(req.body as TForgotPasswordInput);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: result.message,
    path: req.originalUrl,
  });
});

const resendForgotPassword = catchAsync(async (req, res) => {
  const result = await AuthServices.resendForgotPassword(req.body as TForgotPasswordInput);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: result.message,
    path: req.originalUrl,
  });
});

const resetPassword = catchAsync(async (req, res) => {
  const result = await AuthServices.resetPassword(req.body as TResetPasswordInput);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: result.message,
    path: req.originalUrl,
  });
});

export const AuthController = {
  register,
  login,
  refreshToken,
  logout,
  forgotPassword,
  resetPassword,
  resendForgotPassword,
  resendVerificationCode,
  verifyEmail,
};
