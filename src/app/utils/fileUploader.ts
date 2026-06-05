import type { UploadApiOptions } from "cloudinary";
import type { Request } from "express";
import fs from "fs";
import { StatusCodes } from "http-status-codes";
import multer, { type FileFilterCallback } from "multer";
import path from "path";
import { cloudinary } from "../config/cloudinary";
import type {
  MultipleDeleteOptions,
  SingleDeleteOptions,
  UploadOptions,
} from "../types/fileUploads.types";
import { AppError } from "./appError";
import { logger } from "./logger";

const Messages = {
  ONLY_FILE_TYPES_ARE_ALLOWED: (fileTypes: string[]) =>
    `Only ${fileTypes.join(", ").toUpperCase()} files are allowed!`,
  FAILED_TO_DELETE: (filePath: string) => `Failed to delete ${filePath}`,
  FAILED_TO_UPLOAD: "Failed to upload file to Cloudinary",
} as const;

const DEFAULT_MAX_SIZE_BYTES = 5 * 1024 * 1024;
const DEFAULT_ALLOWED_TYPES = ["jpeg", "jpg", "png", "gif", "webp"];
const UPLOAD_DIR = "/uploads";
const CLOUDINARY_FOLDER = "travel-buddy";

const fullUploadDir = path.join(process.cwd(), UPLOAD_DIR);

if (!fs.existsSync(fullUploadDir)) {
  fs.mkdirSync(fullUploadDir, { recursive: true });
}

const handleFileFilter = (
  req: Request,
  file: Express.Multer.File,
  callback: FileFilterCallback,
  fileTypes: string[],
) => {
  const allowed =
    fileTypes && fileTypes.length > 0 ? fileTypes : DEFAULT_ALLOWED_TYPES;
  const allowedTypes = new RegExp(`\\.(${allowed.join("|")})$`, "i");
  const mimeMatch = allowedTypes.test(file.mimetype);
  const extMatch = allowedTypes.test(file.originalname.toLowerCase());

  if (mimeMatch && extMatch) {
    callback(null, true);
  } else {
    const err = new AppError(
      StatusCodes.BAD_REQUEST,
      Messages.ONLY_FILE_TYPES_ARE_ALLOWED(allowed),
    );
    callback(err);
  }
};

const storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, fullUploadDir);
  },
  filename: function (req, file, callback) {
    callback(null, file.originalname);
  },
});

const deleteLocalFile = async (filePath: string) => {
  try {
    await fs.promises.unlink(filePath);
  } catch (err: unknown) {
    const error = err as NodeJS.ErrnoException;
    if (error.code !== "ENOENT") {
      logger.error(Messages.FAILED_TO_DELETE(filePath), error);
    }
  }
};

const uploadToCloudinary = async (
  file: Express.Multer.File,
  options?: UploadApiOptions,
) => {
  try {
    const result = await cloudinary.uploader.upload(file.path, {
      public_id: `${path.parse(file.originalname).name}-${Date.now()}`,
      folder: CLOUDINARY_FOLDER,
      resource_type: "auto",
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

const upload = (options?: UploadOptions): multer.Multer => {
  const { fileTypes = DEFAULT_ALLOWED_TYPES, ...multerOptions } = options || {};

  const fileFilter = (
    req: Request,
    file: Express.Multer.File,
    callback: FileFilterCallback,
  ): void => handleFileFilter(req, file, callback, fileTypes);

  return multer({
    storage,
    fileFilter,
    limits: { fileSize: DEFAULT_MAX_SIZE_BYTES },
    ...multerOptions,
  });
};

const uploadMultipleToCloudinary = async (files: Express.Multer.File[]) => {
  const uploadPromises = files.map((file) => uploadToCloudinary(file));
  return Promise.all(uploadPromises);
};

function deleteAssets(
  publicId: string,
  options?: SingleDeleteOptions,
): Promise<any>;

function deleteAssets(
  publicIds: string[],
  options?: MultipleDeleteOptions,
): Promise<any>;

function deleteAssets(
  publicIds: string | string[],
  options: SingleDeleteOptions | MultipleDeleteOptions = {},
): Promise<any> {
  const { resource_type, type, invalidate } = options;

  if (Array.isArray(publicIds)) {
    return cloudinary.api.delete_resources(publicIds, {
      resource_type,
      type,
    });
  } else {
    return cloudinary.uploader.destroy(publicIds, {
      resource_type,
      type,
      invalidate,
    });
  }
}

export const fileUploader = {
  upload,
  deleteAssets,
  uploadToCloudinary,
  uploadMultipleToCloudinary,
};
