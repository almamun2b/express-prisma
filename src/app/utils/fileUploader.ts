import type { AdminAndResourceOptions, UploadApiOptions } from 'cloudinary';
import type { Request } from 'express';
import fs from 'fs';
import { StatusCodes } from 'http-status-codes';
import multer, { type FileFilterCallback } from 'multer';
import path from 'path';
import { cloudinary } from '../config/cloudinary';
import type { SingleDeleteOptions, UploadOptions } from '../types/fileUploads.types';
import { AppError } from './appError';
import { Codes } from './codes';
import { logger } from './logger';

const Messages = {
  ONLY_FILE_TYPES_ARE_ALLOWED: (fileTypes: string[]) =>
    `Only ${fileTypes.join(', ').toUpperCase()} files are allowed!`,
  FAILED_TO_DELETE: (filePath: string) => `Failed to delete ${filePath}`,
  FAILED_TO_UPLOAD: 'Failed to upload file to Cloudinary',
} as const;

const DEFAULT_ALLOWED_FILE_TYPE = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  webp: 'image/webp',
} as const;
const DEFAULT_MAX_SIZE_BYTES = 5 * 1024 * 1024;
const UPLOAD_DIR = '/uploads';
const CLOUDINARY_FOLDER = 'api-template';

const fullUploadDir = path.join(process.cwd(), UPLOAD_DIR);

if (!fs.existsSync(fullUploadDir)) {
  fs.mkdirSync(fullUploadDir, { recursive: true });
}

const handleFileFilter = (
  _req: Request,
  file: Express.Multer.File,
  callback: FileFilterCallback,
  fileTypes: Record<string, string> = DEFAULT_ALLOWED_FILE_TYPE
): void => {
  const allowedMimes = Object.values(fileTypes);
  const allowedExts = Object.keys(fileTypes);

  const isAllowedMime = allowedMimes.includes(file.mimetype);
  const extRegex = new RegExp(`\\.(${allowedExts.join('|')})$`, 'i');
  const isAllowedExt = extRegex.test(file.originalname.toLowerCase());

  if (isAllowedMime && isAllowedExt) {
    callback(null, true);
  } else {
    const err = new AppError(
      StatusCodes.BAD_REQUEST,
      Messages.ONLY_FILE_TYPES_ARE_ALLOWED(allowedExts),
      Codes.BAD_REQUEST
    );
    callback(err);
  }
};

const storage = multer.diskStorage({
  destination: function (_req, _file, callback) {
    callback(null, fullUploadDir);
  },
  filename: function (_req, file, callback) {
    callback(null, file.originalname);
  },
});

const deleteLocalFile = async (filePath: string) => {
  try {
    await fs.promises.unlink(filePath);
  } catch (err: unknown) {
    const error = err as NodeJS.ErrnoException;
    if (error.code !== 'ENOENT') {
      logger.error(Messages.FAILED_TO_DELETE(filePath), error);
    }
  }
};

const upload = multer({
  storage,
  fileFilter: handleFileFilter,
  limits: { fileSize: DEFAULT_MAX_SIZE_BYTES },
});

const uploadWithOptions = (options?: UploadOptions): multer.Multer => {
  const { fileTypes = DEFAULT_ALLOWED_FILE_TYPE, ...multerOptions } = options ?? {};

  const fileFilter = (
    req: Request,
    file: Express.Multer.File,
    callback: FileFilterCallback
  ): void => handleFileFilter(req, file, callback, fileTypes);

  return multer({
    storage,
    fileFilter,
    limits: { fileSize: DEFAULT_MAX_SIZE_BYTES },
    ...multerOptions,
  });
};

const uploadToCloudinary = async (file: Express.Multer.File, options?: UploadApiOptions) => {
  try {
    const result = await cloudinary.uploader.upload(file.path, {
      public_id: `${path.parse(file.originalname).name}-${Date.now()}`,
      folder: CLOUDINARY_FOLDER,
      resource_type: 'auto',
      ...options,
    });

    return result;
  } catch (error) {
    logger.error(Messages.FAILED_TO_UPLOAD, error);
    throw error;
  } finally {
    await deleteLocalFile(file.path);
  }
};

const uploadMultipleToCloudinary = async (files: Express.Multer.File[]) => {
  const uploadPromises = files.map((file) => uploadToCloudinary(file));
  return Promise.all(uploadPromises);
};

const deleteSingleAsset = (
  publicId: string,
  options: SingleDeleteOptions = {}
): Promise<{ result: string }> => {
  return cloudinary.uploader.destroy(publicId, options);
};

const deleteMultipleAssets = (
  publicIds: string[],
  options: AdminAndResourceOptions = {}
): Promise<{ result: string }> => {
  return cloudinary.api.delete_resources(publicIds, options);
};

export const fileUploader = {
  upload,
  uploadWithOptions,
  deleteSingleAsset,
  deleteMultipleAssets,
  uploadToCloudinary,
  uploadMultipleToCloudinary,
};
