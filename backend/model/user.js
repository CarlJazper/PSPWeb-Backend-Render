const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "name is required"],
        },
        email: {
            type: String,
            required: [true, "email is required"],
            unique: true,
        },
        userBranch: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "branch",
        },
        birthDate: {
            type: Date,
        },
        role: {
            type: String,
            default: 'user',
            enum: ["superadmin","admin", "client", "coach", 'user'],
        },
        address: {
            type: String,
        },
        city: {
            type: String,
        },
        phone: {
            type: String,
        },
        subscribedDate: {
            type: Date,
            default: null,
        },
        subscriptionExpiration: {
            type: Date,
            default: null,
        },
        generalAccess: {
            type: String,
        },
        otherAccess: {
            type: String,
        },
        emergencyContactName: {
            type: String,
        },
        emergencyContactNumber: {
            type: String,
        },
        letterofAcceptance: {
            type: Boolean,
            default: false,
        },
        par_Q: [
            {
                date: {
                    type: Date,
                    default: Date.now,
                },
                question1: {
                    type: Boolean,
                    default: false,
                },
                question2: {
                    type: Boolean,
                    default: false,
                },
                question3: {
                    type: Boolean,
                    default: false,
                },
                question4: {
                    type: Boolean,
                    default: false,
                },
                question5: {
                    type: Boolean,
                    default: false,
                },
                question6: {
                    type: Boolean,
                    default: false,
                },
                question7: {
                    type: Boolean,
                    default: false,
                },
            }
        ],
        password: {
            type: String,
        },
        isAdmin: {
            type: Boolean,
            default: false,
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
        ],
        stripeCustomerId: {
            type: String,
        },
    },
    { timestamps: true }
);

userSchema.methods.getJwtToken = function () {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_TIME
    })
}

module.exports = mongoose.model("users", userSchema);