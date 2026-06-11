import type { User } from '@/generated/prisma/client';
import type { UserRole } from '@/generated/prisma/enums';

type TAuthUser = Pick<User, 'id' | 'email' | 'role' | 'status'>;
/**
 * JWT expiration time string in the format `<number><unit>`.
 * Supported units: `ms`, `s`, `m`, `h`, `d`, `w`, `y`.
 * @example '2h', '30d', '1w', '15ms'
 */
type TJwtExpiresIn = `${number}${'ms' | 's' | 'm' | 'h' | 'd' | 'w' | 'y'}`;

interface JwtUserPayload {
  userId: string;
  email: string;
  role: UserRole;
}

export type { JwtUserPayload, TAuthUser, TJwtExpiresIn };
