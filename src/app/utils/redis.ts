import { createHash, randomInt } from "crypto";

const RedisConstants = {
  OTP_LENGTH: 6,
  OTP_TTL_SECONDS: 10 * 60,
  OTP_COOLDOWN_SECONDS: 2 * 60,
  OTP_TLT_KEY_PREFIX: "otp:",
  OTP_COOLDOWN_KEY_PREFIX: "otp:cooldown:",

  ACCESS_TOKEN_BLACKLIST_PREFIX: "blacklist:at:",
  REFRESH_TOKEN_BLACKLIST_PREFIX: "blacklist:rt:",
  FORGOT_PASS_TOKEN_BLACKLIST_PREFIX: "blacklist:fp:",

  FORGOT_PASS_COOLDOWN_SECONDS: 2 * 60,
  FORGOT_PASS_COOLDOWN_KEY_PREFIX: "fp:cooldown:",
} as const;

const generateOtp = (): string => {
  let otp = "";
  for (let i = 0; i < RedisConstants.OTP_LENGTH; i++) {
    otp += randomInt(0, 10).toString();
  }
  return otp;
};

const getOtpRedisKey = (email: string): string =>
  `${RedisConstants.OTP_TLT_KEY_PREFIX}${email}`;

const getOtpCooldownRedisKey = (email: string): string =>
  `${RedisConstants.OTP_COOLDOWN_KEY_PREFIX}${email}`;

const getAccessTokenBlacklistRedisKey = (token: string): string => {
  const tokenHash = createHash("sha256").update(token).digest("hex");
  return `${RedisConstants.ACCESS_TOKEN_BLACKLIST_PREFIX}${tokenHash}`;
};

const getRefreshTokenBlacklistRedisKey = (token: string): string => {
  const tokenHash = createHash("sha256").update(token).digest("hex");
  return `${RedisConstants.REFRESH_TOKEN_BLACKLIST_PREFIX}${tokenHash}`;
};

const getForgotPassCooldownRedisKey = (email: string): string =>
  `${RedisConstants.FORGOT_PASS_COOLDOWN_KEY_PREFIX}${email}`;

const getForgotPassTokenBlacklistRedisKey = (token: string): string => {
  const tokenHash = createHash("sha256").update(token).digest("hex");
  return `${RedisConstants.FORGOT_PASS_TOKEN_BLACKLIST_PREFIX}${tokenHash}`;
};

const redis = {
  generateOtp,
  getOtpRedisKey,
  getOtpCooldownRedisKey,
  getAccessTokenBlacklistRedisKey,
  getRefreshTokenBlacklistRedisKey,
  getForgotPassCooldownRedisKey,
  getForgotPassTokenBlacklistRedisKey,
};

export { redis, RedisConstants };
