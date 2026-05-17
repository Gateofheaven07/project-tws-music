const LEGACY_UPLOAD_PATH = '/uploads/avatar/';
const IMAGE_DATA_URL_PATTERN = /^data:image\/(jpeg|jpg|png|webp);base64,/i;
const EXTERNAL_URL_PATTERN = /^https?:\/\//i;

export const normalizeAvatar = (avatar?: string | null): string | null => {
  if (!avatar) {
    return null;
  }

  if (avatar.includes(LEGACY_UPLOAD_PATH)) {
    return null;
  }

  if (IMAGE_DATA_URL_PATTERN.test(avatar) || EXTERNAL_URL_PATTERN.test(avatar)) {
    return avatar;
  }

  return null;
};

export const createAvatarDataUrl = (file: Express.Multer.File): string => {
  return `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
};
