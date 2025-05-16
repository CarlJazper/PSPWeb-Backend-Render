const User = require("../model/user");
const mongoose = require('mongoose');
const jwt = require("jsonwebtoken");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("./catchAsyncError");

// Checks if user is authenticated or not
exports.isAuthenticatedUser = catchAsyncErrors(async (req, res, next) => {
  const authorizationHeader = req.header('Authorization');
  console.log('authorizationHeader', authorizationHeader);

  if (!authorizationHeader) {
    return next(new ErrorHandler('Login first to access this resource', 401));
  }

  const token = authorizationHeader.split(' ')[1];
  console.log('Token:', token);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded Token:', decoded.userId);
    
    const userId = new mongoose.Types.ObjectId(decoded.userId); 
    const user = await User.findById(userId);
    
    if (!user) {
      return next(new ErrorHandler('User not found', 404));
    }
    req.user = user; 
  } catch (error) {
    console.error('Token verification error:', error);
    return next(new ErrorHandler('Invalid token', 401));
  }

  next();
});