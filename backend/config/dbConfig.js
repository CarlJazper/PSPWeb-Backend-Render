const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load .env file only if NOT in production
if (process.env.NODE_ENV !== 'production') {
  const envPath = path.resolve(__dirname, 'config.env');
  dotenv.config({ path: envPath });
}

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("Error connecting to MongoDB", err);
    process.exit(1);
  }
};

module.exports = connectDB;
