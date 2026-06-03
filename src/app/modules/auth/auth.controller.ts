import { AppError } from "@/app/utils/AppError";
import { catchAsync } from "@/app/utils/catchAsync";
import { sendResponse } from "@/app/utils/sendResponse";
import { clearAuthCookies, setAuthCookies } from "@/app/utils/setCookie";
import { StatusCodes } from "http-status-codes";
import { AuthMessages } from "./auth.constants";
import { AuthServices } from "./auth.service";
import type { AuthTypes } from "./auth.types";

const register = catchAsync(async (req, res) => {
  const result = await AuthServices.register(req.body);

  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: result.message,
    path: req.originalUrl,
  });
});

const resendVerificationCode = catchAsync(async (req, res) => {
  const result = await AuthServices.resendVerificationCode(req.body);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: result.message,
    path: req.originalUrl,
  });
});

const verifyEmail = catchAsync(async (req, res) => {
  const result = await AuthServices.verifyEmail(req.body);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: result.message,
    path: req.originalUrl,
  });
});

const login = catchAsync(async (req, res) => {
  const result = await AuthServices.login(req.body);

  setAuthCookies(res, result.tokens);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: result.message,
    path: req.originalUrl,
    data: {
      ...result.tokens,
      user: result.user,
    },
  });
});

const refreshToken = catchAsync(async (req, res) => {
  const token: AuthTypes.TRefreshTokenInput["refreshToken"] =
    req.cookies?.refreshToken ?? req.body?.refreshToken;

  if (!token) {
    throw new AppError(
      StatusCodes.UNAUTHORIZED,
      AuthMessages.REFRESH_TOKEN_MISSING,
    );
  }

  const result = await AuthServices.refreshToken(token);

  setAuthCookies(res, result.tokens);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: result.message,
    path: req.originalUrl,
    data: result.tokens,
  });
});

const logout = catchAsync(async (req, res) => {
  const token: AuthTypes.TLogoutInput["refreshToken"] =
    req.cookies?.refreshToken ?? req.body?.refreshToken;

  if (!token) {
    throw new AppError(
      StatusCodes.UNAUTHORIZED,
      AuthMessages.REFRESH_TOKEN_MISSING,
    );
  }

  const result = await AuthServices.logout(token);

  clearAuthCookies(res);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: result.message,
    path: req.originalUrl,
  });
});

const forgotPassword = catchAsync(async (req, res) => {
  const result = await AuthServices.forgotPassword(req.body);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: result.message,
    path: req.originalUrl,
  });
});

const resendForgotPassword = catchAsync(async (req, res) => {
  const result = await AuthServices.resendForgotPassword(req.body);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: result.message,
    path: req.originalUrl,
  });
});

const resetPassword = catchAsync(async (req, res) => {
  const result = await AuthServices.resetPassword(req.body);

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
