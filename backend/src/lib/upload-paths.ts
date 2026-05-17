import fs from 'fs';
import os from 'os';
import path from 'path';
import { logger } from './logger';

const isServerless = process.env.VERCEL === '1' || Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME);

const uploadRoot = isServerless
  ? path.join(os.tmpdir(), 'soundwave-uploads')
  : path.join(process.cwd(), 'uploads');

export const uploadsStaticDir = uploadRoot;
export const avatarUploadDir = path.join(uploadRoot, 'avatar');

export const ensureUploadDirs = () => {
  try {
    fs.mkdirSync(avatarUploadDir, { recursive: true });
    logger.info('Upload directory ready', {
      avatarUploadDir,
      isServerless,
      writableRoot: isServerless ? os.tmpdir() : process.cwd(),
    });
  } catch (error) {
    logger.error('Failed to prepare upload directory', {
      error,
      avatarUploadDir,
      cwd: process.cwd(),
      tmpdir: os.tmpdir(),
      isServerless,
    });
    throw error;
  }
};

export const resolveAvatarPath = (filename: string) => path.join(avatarUploadDir, filename);
