/**
 * User Model
 * Handles user data structure and authentication methods
 */

import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

/**
 * Interface for User document
 */
export interface IUser extends Document {
  email: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  googleId?: string;
  avatar?: string;
  role: 'user' | 'admin';
  isEmailVerified: boolean;
  refreshTokens: string[];
  createdAt: Date;
  updatedAt: Date;
  
  // Methods
  comparePassword(candidatePassword: string): Promise<boolean>;
  addRefreshToken(token: string): Promise<void>;
  removeRefreshToken(token: string): Promise<void>;
  clearRefreshTokens(): Promise<void>;
}

/**
 * User Schema Definition
 */
const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: function (email: string) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        },
        message: 'Please provide a valid email address',
      },
    },
    password: {
      type: String,
      minlength: [8, 'Password must be at least 8 characters long'],
      select: false, // Don't include password in queries by default
    },
    firstName: {
      type: String,
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true, // Allows multiple null values
    },
    avatar: {
      type: String,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    refreshTokens: {
      type: [String],
      default: [],
      select: false, // Don't include refresh tokens in queries by default
    },
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt
  }
);

/**
 * Pre-save middleware to hash password before saving
 */
userSchema.pre('save', async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password') || !this.password) {
    return next();
  }

  try {
    // Generate salt and hash password
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

/**
 * Method to compare password for login
 */
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  if (!this.password) {
    return false;
  }
  return await bcrypt.compare(candidatePassword, this.password);
};

/**
 * Method to add refresh token to user's token array
 */
userSchema.methods.addRefreshToken = async function (
  token: string
): Promise<void> {
  // Keep only the last 5 refresh tokens for security
  if (this.refreshTokens.length >= 5) {
    this.refreshTokens.shift(); // Remove oldest token
  }
  this.refreshTokens.push(token);
  await this.save();
};

/**
 * Method to remove a specific refresh token
 */
userSchema.methods.removeRefreshToken = async function (
  token: string
): Promise<void> {
  this.refreshTokens = this.refreshTokens.filter((t: string) => t !== token);
  await this.save();
};

/**
 * Method to clear all refresh tokens (logout from all devices)
 */
userSchema.methods.clearRefreshTokens = async function (): Promise<void> {
  this.refreshTokens = [];
  await this.save();
};

/**
 * Create and export User model
 */
const User: Model<IUser> = mongoose.model<IUser>('User', userSchema);

export default User;
