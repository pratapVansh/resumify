/**
 * Main Application Entry Point
 * Sets up Express server with all middleware and routes
 */

import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import passport from 'passport';
import dotenv from 'dotenv';

// Import configurations
import { connectDatabase } from './config/database.js';
import { configurePassport } from './config/passport.js';

// Import routes and middleware
import routes from './routes/index.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

// Load environment variables
dotenv.config();

/**
 * Create Express application
 */
const app: Application = express();

/**
 * Trust proxy (important for rate limiting behind reverse proxies)
 */
app.set('trust proxy', 1);

/**
 * Security Middleware
 */

// Helmet - Set security headers
app.use(helmet());

// CORS - Configure cross-origin requests
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true, // Allow cookies to be sent
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Rate limiting - Prevent brute force attacks
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Apply rate limiting to all routes
app.use('/api', limiter);

// Stricter rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 auth requests per windowMs
  message: 'Too many authentication attempts, please try again later.',
});

app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

/**
 * Body Parsing Middleware
 */
app.use(express.json({ limit: '10mb' })); // Parse JSON bodies
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // Parse URL-encoded bodies
app.use(cookieParser()); // Parse cookies

/**
 * Logging Middleware
 */
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev')); // Colored logging for development
} else {
  app.use(morgan('combined')); // Standard Apache combined log for production
}

/**
 * Passport Configuration for OAuth
 */
app.use(passport.initialize());
configurePassport();

/**
 * API Routes
 */
app.use('/api', routes);

/**
 * Root endpoint
 */
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Welcome to Resumify API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
    },
  });
});

/**
 * Error Handling Middleware
 */
app.use(notFound); // Handle 404 errors
app.use(errorHandler); // Centralized error handler

/**
 * Start Server
 */
const PORT = process.env.PORT || 5000;

const startServer = async (): Promise<void> => {
  try {
    // Connect to database
    await connectDatabase();

    // Start listening
    app.listen(PORT, () => {
      console.log(`
╔══════════════════════════════════════════════════════════╗
║                                                          ║
║   🚀 Resumify Server is running!                        ║
║                                                          ║
║   📍 URL: http://localhost:${PORT}                       ║
║   🌍 Environment: ${process.env.NODE_ENV || 'development'}                      ║
║   📊 Database: Connected                                 ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

/**
 * Handle unhandled promise rejections
 */
process.on('unhandledRejection', (err: Error) => {
  console.error('💥 UNHANDLED REJECTION! Shutting down...');
  console.error(err.name, err.message);
  process.exit(1);
});

/**
 * Handle uncaught exceptions
 */
process.on('uncaughtException', (err: Error) => {
  console.error('💥 UNCAUGHT EXCEPTION! Shutting down...');
  console.error(err.name, err.message);
  process.exit(1);
});

// Start the server
startServer();

export default app;
