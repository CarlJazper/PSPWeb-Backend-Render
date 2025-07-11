const AvailTrainer = require('../model/availTrainer');
const mongoose = require('mongoose');
const User = require('../model/user')
const stripe = require('stripe')(process.env.STRIPE_SECRET);
const { cloudinary, secretKey } = require('../config/cloudinaryConfig')

// Create payment intent
exports.createPaymentIntent = async (req, res) => {
    try {
        const { amount, userId } = req.body;
        // Create the payment intent 
        try {
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            const customerId = user.stripeCustomerId;
            // console.log(customerId)

            if (!customerId) {
                return res.status(400).json({ message: 'No Stripe customer ID found for this user' });
            }
            const paymentIntent = await stripe.paymentIntents.create({
                amount: amount * 100,
                currency: 'php',
                customer: customerId,
            });
            res.send({ clientSecret: paymentIntent.client_secret });
        } catch (error) {
            console.error('Error creating payment intent:', error);
            res.status(500).json({ message: 'Error creating payment intent', error: error.message });
        }
    } catch (error) {
        console.error('Error creating payment intent:', error);
        res.status(500).json({ message: 'Error creating payment intent' });
    }
};
// Create a new trainer
exports.createTrainer = async (req, res) => {
    // console.log(req.body)
    try {
        req.body.schedule = [];
        for (let i = 0; i < req.body.sessions; i++) {
            req.body.schedule.push({
                index: i + 1,
                dateAssigned: null,
                timeAssigned: null,
                status: 'pending',
                trainings: [],
            });
        }
        let signatureData = [];
        if (req.body.signature) {
            try {
                const result = await cloudinary.uploader.upload(req.body.signature, {
                    folder: "PSPCloudinaryData/users",
                    width: 150,
                    crop: "scale",
                });

                signatureData.push({
                    public_id: result.public_id,
                    url: result.secure_url,
                });
            } catch (uploadError) {
                console.error("Cloudinary upload failed:", uploadError);
                return res.status(500).json({ message: "Signature upload failed", error: uploadError.message });
            }
        }

        const trainer = new AvailTrainer({
            ...req.body,
            signature: signatureData,
        });

        console.log("Trainer saved:", trainer);
        await trainer.save();


        res.status(201).json({ message: 'Trainer created successfully', trainer });
    } catch (error) {
        console.error("Error creating trainer:", error);
        res.status(400).json({ message: 'Error creating trainer', error: error.message });
    }
};
exports.getAllTrainers = async (req, res) => {
    try {
        const { userBranch } = req.body;

        const trainers = await AvailTrainer.find({ isDeleted: { $ne: true } }) // ⬅️ optional: filter out deleted
            .populate({
                path: 'userId',
                model: 'users',
                select: 'name userBranch',
            })
            .populate({
                path: 'coachID',
                model: 'users',
                select: 'name userBranch',
            })
            .sort({ createdAt: -1 });

        // ✅ If no userBranch is provided (superadmin), return all trainers
        if (!userBranch) {
            return res.status(200).json(trainers);
        }

        // ✅ Otherwise filter by branch
        const filtered = trainers.filter(trainer => {
            const userBranchId1 = trainer.userId?.userBranch?._id || trainer.userId?.userBranch;
            const userBranchId2 = trainer.coachID?.userBranch?._id || trainer.coachID?.userBranch;

            return (
                userBranchId1?.toString() === userBranch ||
                userBranchId2?.toString() === userBranch
            );
        });

        res.status(200).json(filtered);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Error fetching trainers', error: error.message });
    }
};
// Get a specific trainer by ID
exports.getTrainerById = async (req, res) => {
    try {
        const trainer = await AvailTrainer.findById(req.params.id).populate({
            path: 'userId',
            model: 'users'
        }).populate({
            path: 'coachID',
            model: 'users'
        })
        if (!trainer) {
            return res.status(404).json({ message: 'Trainer not found' });
        }
        res.status(200).json(trainer);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching trainer', error: error.message });
    }
};
// Update a trainer by ID
exports.updateTrainer = async (req, res) => {
    try {
        const trainer = await AvailTrainer.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!trainer) {
            return res.status(404).json({ message: 'Trainer not found' });
        }
        res.status(200).json({ message: 'Trainer updated successfully', trainer });
    } catch (error) {
        res.status(400).json({ message: 'Error updating trainer', error: error.message });
    }
};
// Delete a trainer by ID
exports.deleteTrainer = async (req, res) => {
    try {
        const trainer = await AvailTrainer.findByIdAndDelete(req.params.id);
        if (!trainer) {
            return res.status(404).json({ message: 'Trainer not found' });
        }
        res.status(200).json({ message: 'Trainer deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting trainer', error: error.message });
    }
};
exports.getByAssignedCoach = async (req, res,) => {

    try {
        const trainers = await AvailTrainer.find({ coachID: req.params.id }).populate({
            path: 'userId',
            model: 'users'
        }).populate({
            path: 'coachID',
            model: 'users'
        })

        // console.log(trainers)

        res.status(200).json(trainers);
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Error fetching trainers', error: error.message });
    }

}
exports.getClientsAvailedServices = async (req, res,) => {

    try {
        // console.log(req.params)

        const trainers = await AvailTrainer.find({ userId: req.params.id }).populate({
            path: 'userId',
            model: 'users'
        }).populate({
            path: 'coachID',
            model: 'users'
        })

        // console.log(trainers)

        res.status(200).json(trainers);

    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Error fetching trainers', error: error.message });
    }

}
exports.updateSessionSchedule = async (req, res,) => {

    try {
        // console.log(req.body.trainings)
        const servicesAvailed = await AvailTrainer.findById(req.params.id);

        servicesAvailed.schedule = servicesAvailed.schedule.map(session => {
            if (session._id.toString() === req.query.sessionId) {
                return {
                    ...session._doc,
                    dateAssigned: req.body.date,
                    timeAssigned: req.body.time,
                    status: 'waiting',
                    trainings: req.body.trainings || [],
                };
            }
            return session;
        });

        await servicesAvailed.save();

        res.status(200).json({
            message: "Session schedule updated",
        });

    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Error fetching trainers', error: error.message });
    }

}
exports.cancelSessionSchedule = async (req, res,) => {

    try {
        const servicesAvailed = await AvailTrainer.findById(req.params.id);

        servicesAvailed.schedule = servicesAvailed.schedule.map(session => {
            if (session._id.toString() === req.query.sessionId) {
                return {
                    ...session._doc,  // Ensures document properties are spread correctly
                    dateAssigned: null,
                    timeAssigned: null,
                    status: 'pending',
                };
            }
            return session;
        });

        await servicesAvailed.save();

        res.status(200).json({
            message: "Session schedule cancelled",
        });

    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Error fetching trainers', error: error.message });
    }

}
exports.completeSessionSchedule = async (req, res,) => {

    try {
        const servicesAvailed = await AvailTrainer.findById(req.params.id);

        servicesAvailed.schedule = servicesAvailed.schedule.map(session => {
            if (session._id.toString() === req.query.sessionId) {
                return {
                    ...session._doc,
                    status: 'completed',
                };
            }
            return session;
        });

        const allCompleted = servicesAvailed.schedule.every(session => session.status === 'completed');

        if (allCompleted) {
            servicesAvailed.status = 'inactive';
        }

        await servicesAvailed.save();

        res.status(200).json({
            message: "Session completed",
        });

    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Error fetching trainers', error: error.message });
    }

}
exports.hasActiveTraining = async (req, res) => {
    try {
        const { userBranch } = req.body;

        const trainers = await AvailTrainer.find({ status: 'active' })
            .populate({
                path: 'userId',
                match: { userBranch },
            })
            .populate('coachID');

        const activeUsers = trainers.filter(trainer => trainer.userId !== null);

        const result = activeUsers.map(({ userId, coachID, _id, schedule }) => ({
            user: userId,
            coach: coachID,
            trainingId: _id,
            sessions: schedule || [],
        }));

        res.status(200).json({
            message: 'Users with active training fetched successfully',
            hasActive: result,
        });

    } catch (err) {
        console.error('Error fetching active training users:', err);
        res.status(500).json({
            message: 'Failed to fetch users with active training',
            error: err.message,
        });
    }
};
exports.getSalesStats = async (req, res) => {
    try {
        const { userBranch, debug } = req.body;

        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const startOfYear = new Date(today.getFullYear(), 0, 1);

        // Helper function to build aggregation pipeline
        const generateSalesPipeline = (startDate) => {
            const pipeline = [
                {
                    $match: {
                        createdAt: { $gte: startDate },
                    },
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'userId',
                        foreignField: '_id',
                        as: 'user',
                    },
                },
                { $unwind: '$user' },
            ];

            // Apply branch filtering if userBranch is provided
            if (userBranch) {
                pipeline.push({
                    $match: {
                        'user.userBranch': new mongoose.Types.ObjectId(userBranch),
                    },
                });
            }

            // Debug mode: show detailed documents
            if (debug) {
                pipeline.push({
                    $project: {
                        total: 1,
                        createdAt: 1,
                        userName: '$user.name',
                        userBranch: '$user.userBranch',
                    },
                });
            } else {
                // Normal mode: group total sales
                pipeline.push({
                    $group: {
                        _id: null,
                        totalSales: { $sum: '$total' },
                    },
                });
            }

            return pipeline;
        };

        // Run aggregations
        const todayResults = await AvailTrainer.aggregate(generateSalesPipeline(startOfDay));
        const monthResults = await AvailTrainer.aggregate(generateSalesPipeline(startOfMonth));
        const yearResults = await AvailTrainer.aggregate(generateSalesPipeline(startOfYear));

        // Return raw records if debugging
        if (debug) {
            return res.status(200).json({
                message: "Debug mode enabled",
                todaySalesRecords: todayResults,
                monthlySalesRecords: monthResults,
                yearlySalesRecords: yearResults,
            });
        }

        // Return summarized sales data
        return res.status(200).json({
            todaySales: todayResults[0]?.totalSales || 0,
            monthlySales: monthResults[0]?.totalSales || 0,
            yearlySales: yearResults[0]?.totalSales || 0,
        });

    } catch (error) {
        console.error("Error fetching sales stats:", error);
        return res.status(500).json({ error: "Failed to fetch sales stats" });
    }
};
exports.getTrainingUsageStats = async (req, res) => {
    try {
        const { userBranch } = req.body;

        const pipeline = [
            // Join userId
            {
                $lookup: {
                    from: 'users',
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            { $unwind: '$user' },

            // Join coachID
            {
                $lookup: {
                    from: 'users',
                    localField: 'coachID',
                    foreignField: '_id',
                    as: 'coach'
                }
            },
            {
                $unwind: {
                    path: '$coach',
                    preserveNullAndEmptyArrays: true // coach may be null
                }
            },

            //Filter by userBranch
            ...(userBranch
                ? [{
                    $match: {
                        $or: [
                            { 'user.userBranch': new mongoose.Types.ObjectId(userBranch) },
                            { 'coach.userBranch': new mongoose.Types.ObjectId(userBranch) }
                        ]
                    }
                }]
                : []
            ),

            // Unwind schedule and trainings
            { $unwind: '$schedule' },
            { $unwind: '$schedule.trainings' },

            // Count trainings
            {
                $group: {
                    _id: '$schedule.trainings',
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } }
        ];

        const trainingStats = await AvailTrainer.aggregate(pipeline);

        if (trainingStats.length === 0) {
            return res.status(404).json({ message: "No trainings found" });
        }

        const mostUsed = trainingStats[0];
        const leastUsed = trainingStats[trainingStats.length - 1];

        res.status(200).json({
            message: "Training usage statistics fetched successfully",
            mostUsed,
            leastUsed,
            allStats: trainingStats,
        });
    } catch (error) {
        console.error("Error fetching training usage stats:", error);
        res.status(500).json({ message: "Failed to fetch training usage stats", error: error.message });
    }
};
exports.getTrainingTypeStats = async (req, res) => {
    try {
        const { userBranch } = req.body;

       const pipeline = [
            {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "user",
                },
            },
            { $unwind: "$user" },
            ...(userBranch
                ? [
                    {
                        $match: {
                            "user.userBranch": new mongoose.Types.ObjectId(userBranch),
                        },
                    },
                ]
                : []),

            {
                $match: {
                    trainingType: { $exists: true, $ne: "" },
                },
            },
            {
                $group: {
                    _id: "$trainingType",
                    count: { $sum: 1 },
                },
            },
            { $sort: { count: -1 } },
        ];

        const typeStats = await AvailTrainer.aggregate(pipeline);

        if (!typeStats || typeStats.length === 0) {
            return res.status(404).json({ message: "No training type data found" });
        }

        res.status(200).json({
            message: "Training type statistics fetched successfully",
            typeStats
        });

    } catch (error) {
        console.error("Error fetching training type stats:", error);
        res.status(500).json({ message: "Failed to fetch training type stats", error: error.message });
    }
};
exports.trainingDemographics = async (req, res) => {
    try {
        const { userBranch } = req.body;

        const pipeline = [
            {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "user"
                }
            },
            { $unwind: "$user" },
            ...(userBranch
                ? [{
                    $match: {
                        "user.userBranch": new mongoose.Types.ObjectId(userBranch)
                    }
                }]
                : []),
            {
                $match: {
                    "user.gender": { $in: ["male", "female"] },
                    "user.birthDate": { $ne: null },
                    trainingType: { $exists: true, $ne: "" }
                }
            },
            {
                $project: {
                    trainingType: 1,
                    name: "$user.name",
                    gender: "$user.gender",
                    birthDate: "$user.birthDate"
                }
            },
            {
                $group: {
                    _id: "$trainingType",
                    users: {
                        $push: {
                            name: "$name",
                            gender: "$gender",
                            birthDate: "$birthDate"
                        }
                    }
                }
            }
        ];

        const rawStats = await AvailTrainer.aggregate(pipeline);

        const TRAINING_TYPES = ['Health', 'Shape', 'Sports', 'Strength'];
        const now = new Date();

        const result = TRAINING_TYPES.map(type => {
            const stat = rawStats.find(item => item._id === type);
            if (!stat) {
                return {
                    trainingType: type,
                    topGender: "N/A",
                    genderCount: 0,
                    male: 0,
                    female: 0,
                    averageAgeBracket: "N/A",
                    users: []
                };
            }

            let male = 0;
            let female = 0;

            const usersWithAge = stat.users.map(u => {
                const age = Math.floor((now - new Date(u.birthDate)) / (365.25 * 24 * 60 * 60 * 1000));
                if (u.gender === "male") male++;
                if (u.gender === "female") female++;
                return {
                    name: u.name,
                    gender: u.gender,
                    age
                };
            });

            const topGender = male === 0 && female === 0
                ? "N/A"
                : male >= female ? "male" : "female";
            const genderCount = Math.max(male, female);

            // Age bracket
            const avgAge = usersWithAge.length
                ? Math.floor(usersWithAge.reduce((sum, u) => sum + u.age, 0) / usersWithAge.length)
                : null;

            let bracket = "N/A";
            if (avgAge !== null) {
                if (avgAge <= 25) bracket = "18-25";
                else if (avgAge <= 35) bracket = "26-35";
                else if (avgAge <= 45) bracket = "36-45";
                else if (avgAge <= 60) bracket = "46-60";
                else bracket = "60+";
            }

            return {
                trainingType: type,
                topGender,
                genderCount,
                male,
                female,
                averageAgeBracket: bracket,
                users: usersWithAge
            };
        });

        res.status(200).json({ trainingDemographics: result });
    } catch (error) {
        console.error("Error fetching training demographics:", error);
        res.status(500).json({ message: "Failed to fetch training demographics", error: error.message });
    }
};
