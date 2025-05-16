const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    transactionType: {
        type: String,
        required: [true, "Transaction Type is required"],
        enum: ["Membership Subscription", "Personal Training Subscription"],
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true,
    },
    userBranch: {
        type: String,
        required: true,
    },
    birthDate: {
        type: Date,
        required: true,
    },
    address: {
        type: String,
        required: true,
    },
    city: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    emergencyContactName: {
        type: String,
        required: true,
    },
    emergencyContactNumber: {
        type: String,
        required: true,
    },
    dateNow: {
        type: Date,
        default: Date.now,
    },
    promo: {
        type: String,
    },
    agreeTerms: {
        type: Boolean,
        required: true,
    },
    amount: {
        type: Number,
        required: true
    },
    subscribedDate: {
        type: Date,
        default: null,
    },
    subscriptionExpiration: {
        type: Date,
        default: null,
    },
    stripeSubscriptionId: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

transactionSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports  = mongoose.model('transaction', transactionSchema);
