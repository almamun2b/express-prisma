import type { DeliveryType, ResourceType } from 'cloudinary';
import type multer from 'multer';

interface SingleDeleteOptions {
  resource_type?: ResourceType;
  type?: DeliveryType;
  invalidate?: boolean;
}

interface UploadOptions extends multer.Options {
  fileTypes: string[];
  fileSize: number;
}

export type { SingleDeleteOptions, UploadOptions };
