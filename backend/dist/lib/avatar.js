"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAvatarDataUrl = exports.normalizeAvatar = void 0;
const LEGACY_UPLOAD_PATH = '/uploads/avatar/';
const IMAGE_DATA_URL_PATTERN = /^data:image\/(jpeg|jpg|png|webp);base64,/i;
const EXTERNAL_URL_PATTERN = /^https?:\/\//i;
const normalizeAvatar = (avatar) => {
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
exports.normalizeAvatar = normalizeAvatar;
const createAvatarDataUrl = (file) => {
    return `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
};
exports.createAvatarDataUrl = createAvatarDataUrl;
