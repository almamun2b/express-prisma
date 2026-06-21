export interface IMeta {
  limit: number;
  // Offset pagination
  page?: number;
  total?: number;
  totalPage?: number;
  // Cursor pagination
  nextCursor?: string | null;
  prevCursor?: string | null;
  hasNextPage?: boolean;
  hasPrevPage?: boolean;
}

export interface IResponse<T> {
  statusCode: number;
  success: boolean;
  message: string;
  timestamp?: string;
  path: string;
  data?: T;
  meta?: IMeta;
}
