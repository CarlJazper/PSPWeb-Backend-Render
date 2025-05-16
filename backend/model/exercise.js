const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Service Name is Required"]
  },
  type: {
    type: String,
    required: [true, 'type Required'],
  },
  targetMuscle: {
    type: String,
    required: [true, 'Target muscle Required'],
  },
  equipmentUsed: {
    type: String,
    required: [true, 'Equipment Use Required'],
  },
  difficulty: {
    type: Number,
    min: 1,
    max: 5,
    required: [true, 'Difficulty Required'],
  },
  instructions: {
    type: String,
    required: [true, 'Instructions Required'],
  },
  image: [
    {
      public_id: {
        type: String,
        required: true
      },
      url: {
        type: String,
        required: true
      },
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('exercise ', exerciseSchema)