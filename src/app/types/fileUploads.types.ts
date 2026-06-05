import type {
  AdminAndResourceOptions,
  DeliveryType,
  ResourceType,
} from "cloudinary";
import type multer from "multer";

// Define specific option types
interface SingleDeleteOptions {
  resource_type?: ResourceType;
  type?: DeliveryType;
  invalidate?: boolean;
}

type MultipleDeleteOptions = AdminAndResourceOptions;

interface UploadOptions extends multer.Options {
  fileTypes: string[];
  fileSize: number;
}

export type { MultipleDeleteOptions, SingleDeleteOptions, UploadOptions };
