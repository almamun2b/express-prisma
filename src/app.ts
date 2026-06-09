import { env } from '@/app/config/env';
import globalErrorHandler from '@/app/middlewares/globalErrorHandler';
import { notFound } from '@/app/middlewares/notFound';
import { apiLimiter } from '@/app/middlewares/rateLimiter';
import { requestLogger } from '@/app/middlewares/requestLogger';
import router from '@/app/routes';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import type { Application, Request, Response } from 'express';
import express from 'express';
import helmet from 'helmet';

const Messages = {
  API_IS_RUNNING: 'Express with PostgreSQL API is running successfully!',
} as const;

const app: Application = express();

app.set('trust proxy', 1);

// Security Middlewares
app.use(helmet());
app.use(cookieParser());

app.use(
  cors({
    origin: env.corsOrigins,
    credentials: true,
  })
);

app.use(requestLogger);

app.use(express.json());

app.get('/', (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: Messages.API_IS_RUNNING,
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/v1', apiLimiter, router);

app.use(notFound);
app.use(globalErrorHandler);

export default app;
