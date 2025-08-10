import { v2 as cloudinary } from 'cloudinary';

// Automatically configures using CLOUDINARY_URL environment variable
cloudinary.config();

export default cloudinary;