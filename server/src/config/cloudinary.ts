import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

// Load environment variables first
dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

// Verify configuration
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  console.error('❌ Cloudinary configuration missing! Check your .env file.');
} else {
  console.log('✅ Cloudinary configured successfully:', process.env.CLOUDINARY_CLOUD_NAME);
}

export default cloudinary;
