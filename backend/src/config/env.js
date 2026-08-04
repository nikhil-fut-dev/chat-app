import dotenv from "dotenv";

dotenv.config();

const env = {
  PORT: process.env.PORT || 5000,

  NODE_ENV: process.env.NODE_ENV || "development",

  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:5173",

  MONGODB_URI: process.env.MONGODB_URI,

  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,

  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
};

export default env;
