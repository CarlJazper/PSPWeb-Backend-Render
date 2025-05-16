// cloudinaryConfig.js
const cloudinary = require('cloudinary').v2;
const crypto = require('crypto');

// Function to generate a secret key
const generateSecretKey = () => {
  return crypto.randomBytes(32).toString("hex");
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const secretKey = generateSecretKey();

module.exports = { cloudinary, secretKey };