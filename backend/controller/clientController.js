const mongoose = require("mongoose");
const User = require("../model/user");
const asyncHandler = require("express-async-handler");

const clientController = {
    submitParQ: asyncHandler(async (req, res) => {
        const { userId, q1, q2, q3, q4, q5, q6, q7 } = req.body;

        try {
            // Convert userId to an ObjectId
            const user = await User.findById('67a173b142ea9d06f6ac45a8');
            if (!user) {
                return res.status(404).json({ error: "User not found" });
            }

            const newParQEntry = {
                question1: q1,
                question2: q2,
                question3: q3,
                question4: q4,
                question5: q5,
                question6: q6,
                question7: q7,
            };

            // console.log("Par-Q", newParQEntry);

            // Uncomment the following lines to save Par-Q entry
            user.par_Q.push(newParQEntry);
            await user.save();

            res.status(200).json({ message: "Par-Q submitted successfully", par_Q: newParQEntry, user: user });
        } catch (error) {
            console.error("Error submitting Par-Q:", error);
            res.status(500).json({ error: "An error occurred while submitting Par-Q" });
        }
    }),
};

module.exports = clientController;