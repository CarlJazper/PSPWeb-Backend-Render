const mongoose = require("mongoose");
const Logs = require("../model/logs");

const logsController = {
    getAllLogs: async (req, res) => {
        try {
            const logs = await Logs.find().populate("userId", "name image").sort({ createdAt: -1 });
            // console.log(exercise)
            res.status(201).json({ message: "Logs fetch successfully", logs });
        } catch (error) {
            console.error("Fetch All Logs Error:", error.message);
            res.status(500).json({ message: "Fetch Logs Error" });
        }
    },
};
module.exports = logsController;