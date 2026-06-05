export interface IMeta {
  page: number;
  limit: number;
  total: number;
  totalPage?: number;
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
