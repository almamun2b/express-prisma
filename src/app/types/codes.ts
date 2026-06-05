import { StatusCodes } from "http-status-codes";
import { CustomCodes } from "../utils/codes";

export type CustomCodesType = typeof CustomCodes;
type RawStatusCodeKeys = keyof typeof StatusCodes;

type NonNumericKeys<T extends string> = T extends `${number}` ? never : T;
export type HttpStatusCodeKeys = NonNumericKeys<RawStatusCodeKeys>;

export type HttpStatusCodeMap = {
  [K in HttpStatusCodeKeys]: K;
};

export type TCode = keyof CustomCodesType | HttpStatusCodeKeys;
