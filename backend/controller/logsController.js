const mongoose = require("mongoose");
const Logs = require("../model/logs");

const logsController = {
    getAllLogs: async (req, res) => {
        try {
            const { userBranch } = req.body;
            console.log("Received userBranch:", userBranch);

            // Fetch logs and populate the userId
            const logs = await Logs.find({ adminBranchId: userBranch })
                .populate({
                    path: "userId",
                    select: "name image",
                })
                .sort({ createdAt: -1 });

            console.log("Filtered logs count:", logs.length);

            res.status(200).json({ success: true, logs });

        } catch (error) {
            console.error("Error in getAllLogs:", error);
            res.status(500).json({ success: false, message: 'Failed to get logs.' });
        }
    },
};
module.exports = logsController;