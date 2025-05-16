const mongoose = require('mongoose');

const availTrainerSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true,
    },
    name: {
        type: String,
        required: true
    },
    birthdate: {
        type: Date,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
    },
    homePhone: {
        type: String
    },
    workPhone: {
        type: String
    },
    sessions: {
        type: Number,
        default: 0
    },
    sessionRate: {
        type: Number,
        required: true
    },
    total: {
        type: Number,
        required: true
    },
    coachID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        default: null,
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active',
    },
    startDate: {
        type: Date,
    },
    trainingType: {
        type: String
    },
    package: {
        type: String,
        required: true
    },
    signature: [
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
    ],
    schedule: [
        {
            index: { type: Number, required: true, },
            dateAssigned: { type: Date, },
            timeAssigned: { type: Date, },
            status: { type: String, default: 'pending', enum: ['pending', 'waiting', 'completed'] },
            trainings: { type: [String], default: [] }
        }
    ]
}, {
    timestamps: true // Adds createdAt and updatedAt fields
});

const AvailTrainer = mongoose.model('AvailTrainer', availTrainerSchema);

module.exports = AvailTrainer;