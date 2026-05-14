import bcryptjs from 'bcryptjs';

const SALT_ROUNDS = 10;

export const hashPassword = async (password: string): Promise<string> => {
  const hash = await bcryptjs.hash(password, SALT_ROUNDS);
  return hash;
};

export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  const isValid = await bcryptjs.compare(password, hash);
  return isValid;
};
