import type { Response } from "express";
import type { IResponse } from "../types/response";

const sendResponse = <T>(res: Response, data: IResponse<T>) => {
  res.status(data.statusCode).json({
    timestamp: data.timestamp ?? new Date().toISOString(),
    ...data,
  });
};

export { sendResponse };
