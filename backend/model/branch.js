const mongoose = require('mongoose');

const branchSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Branch Name is Required"]
  },
  email: {
    type: String,
    required: [true, 'Email Required'],
  },
  place: {
    type: String,
    required: [true, 'Place Required'],
  },
  contact: {
    type: String,
    required: [true, 'Contact Required'],
  },
}, { timestamps: true });

module.exports = mongoose.model('branch ', branchSchema)