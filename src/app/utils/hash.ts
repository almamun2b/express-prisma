import bcrypt from 'bcryptjs';
import { env } from '../config/env';

export const hashPassword = async (password: string): Promise<string> =>
  bcrypt.hash(password, env.bcryptSaltRound);

export const comparePassword = async (password: string, hash: string): Promise<boolean> =>
  bcrypt.compare(password, hash);
