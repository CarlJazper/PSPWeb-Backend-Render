const mongoose = require("mongoose");
const Logs = require("../model/logs");

const logsController = {
    getAllLogs: async (req, res) => {
        try {
            const { userBranch } = req.body;

            const logs = await Logs.find()
                .populate({
                    path: "userId",
                    select: "name image userBranch",
                })
                .populate({
                    path: "adminBranchId",
                    select: "userBranch",
                })
                .sort({ createdAt: -1 });

            const filteredLogs = logs.filter(log =>
                log.adminBranchId?.userBranch?.toString() === userBranch
            );

            res.status(200).json({ message: "Logs fetched successfully", logs: filteredLogs });
        } catch (error) {
            console.error("Fetch All Logs Error:", error.message);
            res.status(500).json({ message: "Fetch Logs Error" });
        }
    },
};
module.exports = logsController;