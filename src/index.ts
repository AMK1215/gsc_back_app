import express, { Express, Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { PORT, JWT_SECRET } from './secrets';
import rootRouter from './routes';
import { PrismaClient } from '@prisma/client';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import cors from 'cors';


// Validate environment variables
if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }
  
  const app: Express = express();
  
  // Middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  
  // Allow requests from your frontend origin
  app.use(cors({
    origin: 'http://localhost:5173', // or use '*' for all origins (not recommended for production)
    credentials: true // if you need to send cookies or authentication headers
  }));
  
  // Routes with api prefix
  app.use('/api', rootRouter);
  
  
  
  // Health check endpoint
  app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({ status: 'ok' });
  });
  
  // Initialize Prisma Client
  export const prismaClient = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
  });
  
  
  // Error handling middleware (must be after all routes)
  app.use(notFoundHandler);
  app.use(errorHandler as ErrorRequestHandler);
  
  // Graceful shutdown
  process.on('SIGINT', async () => {
    await prismaClient.$disconnect();
    process.exit(0);
  });
  
  
  // Start server
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
  