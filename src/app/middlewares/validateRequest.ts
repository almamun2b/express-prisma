import type { RequestHandler } from 'express';
import type { z, ZodObject } from 'zod';

interface ParseMultipartOptions {
  fieldName?: string;
  strict?: boolean;
}

/**
 * Express middleware to safely parse JSON payloads embedded in multipart/form-data requests.
 *
 * ### When to use:
 * - When clients send structured JSON inside a specific multipart field (e.g., `FormData.append("data", JSON.stringify({...}))`).
 * - When you want to normalize `req.body` so controllers receive a parsed object instead of a raw string.
 * - When handling file uploads with metadata (e.g., avatar image + user profile JSON).
 *
 * ### Behavior:
 * - Looks for a string field (default `"data"`) in `req.body`.
 * - Attempts to `JSON.parse` the field value.
 * - If parsing succeeds, replaces `req.body` with the parsed object.
 * - If parsing fails:
 *   - In **strict mode**, passes an error to `next()`.
 *   - In non‑strict mode, silently ignores and leaves `req.body` unchanged.
 *
 * @param options - Configuration for field name and strictness.
 * @returns Express middleware function.
 */
const parseMultipartRequest = (options: ParseMultipartOptions = {}): RequestHandler => {
  const { fieldName = 'data', strict = false } = options;

  return (req, _res, next) => {
    try {
      const body = req.body as Record<string, unknown> | undefined;

      if (!body || typeof body !== 'object') {
        return next();
      }

      const value = body[fieldName];

      if (typeof value !== 'string') {
        return next();
      }

      const parsed = JSON.parse(value) as Record<string, unknown>;

      if (typeof parsed === 'object' && parsed !== null) {
        req.body = parsed;
      }

      next();
    } catch {
      if (strict) {
        return next(new Error('Invalid multipart JSON payload'));
      }

      next();
    }
  };
};

const validateRequest = <T extends ZodObject>(
  zodSchema: T
): RequestHandler<unknown, unknown, z.infer<T>, unknown> => {
  return async (req, _res, next) => {
    try {
      const parsedBody = await zodSchema.parseAsync(req.body);
      req.body = parsedBody;
      next();
    } catch (error) {
      next(error);
    }
  };
};

const validateQuery = <T extends ZodObject>(
  zodSchema: T
): RequestHandler<unknown, unknown, unknown, z.infer<T>> => {
  return async (req, _res, next) => {
    try {
      const parsedQuery = await zodSchema.parseAsync(req.query);
      req.validatedQuery = parsedQuery;
      next();
    } catch (error) {
      next(error);
    }
  };
};

const validateParams = <T extends ZodObject>(
  zodSchema: T
): RequestHandler<z.infer<T>, unknown, unknown, unknown> => {
  return async (req, _res, next) => {
    try {
      const parsedParams = await zodSchema.parseAsync(req.params);
      req.validatedParams = parsedParams;
      next();
    } catch (error) {
      next(error);
    }
  };
};

export { parseMultipartRequest, validateParams, validateQuery, validateRequest };
