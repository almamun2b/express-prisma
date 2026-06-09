import { env } from '@/app/config/env';
import { logger } from '@/app/utils/logger';
import type { NextFunction, Request, Response } from 'express';

/**
 * Winston-only HTTP request logger (active).
 * Logs one line per request when the response finishes.
 */
const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = process.hrtime.bigint();

  res.on('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - start) / 1_000_000;
    const { method, originalUrl } = req;
    const { statusCode } = res;

    if (env.nodeEnv === 'development') {
      logger.http(`${method} ${originalUrl} ${statusCode} - ${durationMs.toFixed(2)} ms`);
      return;
    }

    logger.info('HTTP request', {
      method,
      url: originalUrl,
      statusCode,
      durationMs: Math.round(durationMs),
    });
  });

  next();
};

export { requestLogger };

/* -------------------------------------------------------------------------- */
/* Morgan backup — uncomment below and comment out requestLogger above        */
/* -------------------------------------------------------------------------- */
// import morgan from "morgan";
//
// const stream = {
//   write: (message: string) => {
//     logger.http(message.trim());
//   },
// };
//
// const requestLogger = morgan(
//   env.nodeEnv === "development" ? "dev" : "combined",
//   { stream },
// );
//
// export { requestLogger };
