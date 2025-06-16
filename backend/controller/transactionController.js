const asyncHandler = require("express-async-handler");
const Transaction = require("../model/transaction");

const transactionController = {
    getAllTransactions: asyncHandler(async (req, res) => {
        try {
            const { userBranch } = req.body;

            const transactions = await Transaction.find({ userBranch: userBranch }).populate("userId", "name email")
            // console.log(exercise)
            res.status(201).json({ message: "Transactions fetch successfully", transactions });
        } catch (error) {
            console.error("Fetch All Transactions Error:", error.message);
            res.status(500).json({ message: "Fetch Transactions Error" });
        }
    }),

    getMembershipSalesStats: asyncHandler(async (req, res) => {
        try {
            const { userBranch } = req.body;
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
            const startOfYear = new Date(today.getFullYear(), 0, 1);

            // Filter transactions for memberships only
            const filter = { transactionType: "Membership Subscription", userBranch: userBranch };

            const [todaySales, monthlySales, yearlySales] = await Promise.all([
                Transaction.aggregate([
                    { $match: { ...filter, subscribedDate: { $gte: today } } },
                    { $group: { _id: null, total: { $sum: "$amount" } } }
                ]),
                Transaction.aggregate([
                    { $match: { ...filter, subscribedDate: { $gte: startOfMonth } } },
                    { $group: { _id: null, total: { $sum: "$amount" } } }
                ]),
                Transaction.aggregate([
                    { $match: { ...filter, subscribedDate: { $gte: startOfYear } } },
                    { $group: { _id: null, total: { $sum: "$amount" } } }
                ])
            ]);

            res.status(200).json({
                todayTotal: todaySales.length > 0 ? todaySales[0].total : 0,
                monthlyTotal: monthlySales.length > 0 ? monthlySales[0].total : 0,
                yearlyTotal: yearlySales.length > 0 ? yearlySales[0].total : 0
            });

        } catch (error) {
            console.error("Error fetching membership sales stats:", error.message);
            res.status(500).json({ message: "Error fetching sales data" });
        }
    }),

};
module.exports = transactionController;