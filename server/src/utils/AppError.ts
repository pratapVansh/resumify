/**
 * Custom Application Error Class
 * Extends the built-in Error class for consistent error handling
 */

export class AppError extends Error {
  public statusCode: number;
  public status: string;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true; // Distinguishes operational errors from programming errors

    // Maintains proper stack trace
    Error.captureStackTrace(this, this.constructor);
  }
}
