const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const { cloudinary, secretKey } = require("../config/cloudinaryConfig");
const asyncHandler = require("express-async-handler");
const User = require("../model/user");
const AvailTrainer = require("../model/availTrainer");
const Transaction = require("../model/transaction");
const Log = require("../model/logs");
const Rating = require("../model/rating");
const stripe = require("stripe")(process.env.STRIPE_SECRET);
const priceId = process.env.STRIPE_PRICE_ID;
const accesscard = process.env.STRIPE_ACCESSCARD;

const userController = {
	//!Register
	register: asyncHandler(async (req, res) => {
		try {
			const {
				email,
				password,
				name,
				birthDate,
				address,
				city,
				role,
				phone,
				emergencyContactName,
				emergencyContactNumber,
				priceId,
				accesscard,
			} = req.body;

			const userBranch = req.body.userBranch ? req.body.userBranch : null;

			if (!email || !password) {
				throw new Error("Please fill in all required fields");
			}

			const userExists = await User.findOne({ email });
			if (userExists) {
				throw new Error("User already exists");
			}

			const salt = await bcrypt.genSalt(10);
			const hashedPassword = await bcrypt.hash(password, salt);

			if (!req.file) {
				return res.status(400).json({ message: "No file uploaded" });
			}

			const result = await cloudinary.uploader.upload(req.file.path, {
				folder: "PSPCloudinaryData/users",
				width: 150,
				crop: "scale",
			});

			const stripeCustomer = await stripe.customers.create({
				name,
				email,
			});

			if (role === "coach") {
				let user = new User({
					name,
					email,
					userBranch,
					birthDate,
					role,
					address,
					city,
					phone,
					generalAccess: "PSPCard",
					otherAccess: "Any Valid ID",
					emergencyContactName,
					emergencyContactNumber,
					password: hashedPassword,
					image: { public_id: result.public_id, url: result.secure_url },
				});

				user = await user.save();

				return res.status(201).json({
					success: true,
					message: "Coach Registered Successfully",
					user,
				});
			} else {
				const subscribedDate = new Date();
				const subscriptionExpiration = new Date();
				subscriptionExpiration.setFullYear(subscribedDate.getFullYear() + 1);

				let user = new User({
					name,
					email,
					userBranch,
					birthDate,
					role: "client",
					address,
					city,
					phone,
					generalAccess: "PSPCard",
					otherAccess: "Any Valid ID",
					subscribedDate,
					subscriptionExpiration,
					emergencyContactName,
					emergencyContactNumber,
					password: hashedPassword,
					image: { public_id: result.public_id, url: result.secure_url },
					stripeCustomerId: stripeCustomer.id,
				});

				user = await user.save();

				// Stripe logic only if online payment
				if (priceId && accesscard) {
					const basePrice = await stripe.prices.retrieve(priceId);
					const accessCard = await stripe.prices.retrieve(accesscard);

					let finalAmount = basePrice.unit_amount + accessCard.unit_amount;
					finalAmount = finalAmount / 100;

					const items = [
						{
							price_data: {
								currency: "php",
								product: basePrice.product,
								unit_amount: basePrice.unit_amount + accessCard.unit_amount,
								recurring: {
									interval: "year",
								},
							},
						},
					];

					const subscription = await stripe.subscriptions.create({
						customer: stripeCustomer.id,
						items,
						payment_behavior: "default_incomplete",
						expand: ["latest_invoice.payment_intent"],
					});

					const stripeSubscriptionId = subscription.id;

					const transaction = new Transaction({
						transactionType: "Membership Subscription",
						userId: user._id,
						userBranch,
						birthDate,
						address,
						city,
						phone,
						emergencyContactName,
						emergencyContactNumber,
						promo: "",
						agreeTerms: true,
						subscribedDate,
						subscriptionExpiration,
						stripeSubscriptionId,
						amount: finalAmount,
					});

					await transaction.save();
				}

				return res.status(201).json({
					success: true,
					message: "Client Registered Successfully",
					user,
				});
			}
		} catch (error) {
			console.log(error);
			res.status(500).json({
				success: false,
				message: "Error in Register API",
				error: error.message,
			});
		}
	}),
	//!Login
	login: asyncHandler(async (req, res) => {
		try {
			const { email, password } = req.body;
			// console.log(email, password)
			const user = await User.findOne({ email });

			if (!user) {
				return res.status(401).json({ message: "Invalid Email or Password" });
			}
			const isPasswordValid = await bcrypt.compare(password, user.password);
			if (!isPasswordValid) {
				return res.status(401).json({ message: "Invalid Password" });
			}
			if (user.role === "client") {
				const currentDate = new Date();
				if (
					user.subscriptionExpiration &&
					user.subscriptionExpiration < currentDate
				) {
					user.role = "user";
					user.userBranch = null;
					user.birthDate = null;
					user.address = "";
					user.city = "";
					user.phone = "";
					user.generalAccess = "";
					user.otherAccess = "";
					user.subscriptionExpiration = null;
					user.subscribedDate = null;
					user.emergencyContactName = "";
					user.emergencyContactNumber = "";
					await user.save();
				}
			}

			const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
				expiresIn: "24h",
			});
			res.status(200).json({ token, user });
		} catch (error) {
			console.error("Login Error:", error);
			res.status(500).json({ message: "Login Error" });
		}
	}),
	//!Profile
	profile: asyncHandler(async (req, res) => {
		try {
			const { userId } = req.query;
			let query = {};
			if (userId) {
				query = { _id: userId };
			}
			const user = await User.findById(query);
			// console.log(user)

			if (!user) {
				return res.status(404).json({ message: "User not found" });
			}

			res.status(200).json({ user });
		} catch (erro) {
			console.error("Error fetching user:", error);
			res.status(500).json({ message: "Internal server error" });
		}
	}),
	//!UpdateUser
	updateUser: asyncHandler(async (req, res) => {
		try {
			const { _id, name, email, role } = req.body;
			let user = await User.findById(_id);

			if (!user) {
				return res
					.status(404)
					.json({ success: false, message: "User not found" });
			}

			// Only upload a new image if provided
			if (req.file) {
				const imageUrl = req.file.path;

				const result = await cloudinary.uploader.upload(imageUrl, {
					folder: "PSPCloudinaryData/users",
					width: 150,
					crop: "scale",
				});

				user.image = { public_id: result.public_id, url: result.secure_url };
			}

			// Update other fields
			user.name = name;
			user.email = email;
			user.role = role;

			user = await User.findByIdAndUpdate(_id, user, {
				new: true,
				runValidators: true,
				useFindAndModify: false,
			});

			return res.status(200).json({
				success: true,
				user,
			});
		} catch (error) {
			console.error(error.message);
			return res.status(500).json({
				success: false,
				message: "Update User Server Error",
			});
		}
	}),
	//!ResetPassword
	updateUserPassword: asyncHandler(async (req, res) => {
		try {
			const { currentPassword, newPassword } = req.body;

			const user = await User.findById(req.user.id);
			// console.log('The Body:', req.body)
			// console.log('The newPassword',newPassword)
			// console.log('The User ID:', user)

			if (!user) {
				return res.status(404).json({ message: "User not found" });
			}

			const isMatch = await bcrypt.compare(currentPassword, user.password);

			if (!isMatch) {
				return res
					.status(400)
					.json({ message: "Current password is incorrect" });
			}

			const salt = await bcrypt.genSalt(10);
			const hashedPassword = await bcrypt.hash(newPassword, salt);

			// Update user's password
			user.password = hashedPassword;
			await user.save();

			res.status(200).json({
				success: true,
				message: "Password updated successfully",
			});
		} catch (error) {
			console.error(error.message);
			return res.status(500).json({
				success: false,
				message: "Password Reset Server Error",
			});
		}
	}),
	getUser: asyncHandler(async (req, res) => {
		const { id } = req.params;

		try {
			const user = await User.findById(id);
			if (!user) {
				return res.status(404).json({
					success: false,
					message: "User not found",
				});
			}

			return res.status(200).json({
				success: true,
				user,
			});
		} catch (error) {
			return res.status(500).json({
				success: false,
				message: "Error fetching user data",
				error: error.message,
			});
		}
	}),
	userLog: asyncHandler(async (req, res) => {
		const { id } = req.params;
		const { adminBranchId } = req.body;

		try {
			const today = new Date().setHours(0, 0, 0, 0);

			let activeLog = await Log.findOne({
				userId: id,
				date: today,
				timeOut: null,
			});
			let user = await User.findById(id);

			if (activeLog) {
				activeLog.timeOut = new Date();
				await activeLog.save();
				return res
					.status(200)
					.json({ message: "Timed out successfully", log: activeLog, user });
			}

			const newLog = await Log.create({
				userId: id,
				adminBranchId: adminBranchId,
				timeIn: new Date(),
				date: today,
			});

			res
				.status(201)
				.json({ message: "Timed In Complete.", log: newLog, user });
		} catch (error) {
			console.error(error);
			res.status(500).json({
				message: "An error occurred while logging the user",
				error: error.message,
			});
		}
	}),
	getTimeInLogs: async (req, res) => {
		try {
			const today = new Date().setHours(0, 0, 0, 0);
			let activeLogs = await Log.find({ date: today, timeOut: null });

			console.log(activeLogs);
			res.status(201).json({ message: "Logs fetch successfully", activeLogs });
		} catch (error) {
			console.error("Fetch All Logs Error:", error.message);
			res.status(500).json({ message: "Create Logs Error" });
		}
	},
	getAllUsers: async (req, res) => {
		try {
			const { userBranch } = req.body;
			const { role } = req.query;

			let roleFilter = {};

			if (role === "coach") {
				// ✅ Just fetch coaches
				roleFilter.role = "coach";

				const coachQuery = { ...roleFilter };
				if (userBranch) {
					coachQuery.userBranch = new mongoose.Types.ObjectId(userBranch);
				}

				const coaches = await User.find(coachQuery);

				return res.status(200).json({
					message: "Coaches fetched successfully",
					users: coaches,
				});
			}

			// ✅ Filter non-admin, non-coach users
			roleFilter.role = { $nin: ["superadmin", "admin", "coach"] };

			const transactionMatch = {
				subscriptionExpiration: { $gt: new Date() },
			};
			if (userBranch) {
				transactionMatch.userBranch = userBranch;
			}

			// ✅ Only get users with valid transactions
			const activeTransactions = await Transaction.aggregate([
				{ $match: transactionMatch },
				{ $group: { _id: "$userId" } },
			]);

			const activeUserIds = activeTransactions.map((u) => u._id);

			const finalUserQuery = {
				_id: {
					$in: activeUserIds.map((id) => new mongoose.Types.ObjectId(id)),
				},
				...roleFilter,
			};

			if (userBranch) {
				finalUserQuery.userBranch = new mongoose.Types.ObjectId(userBranch);
			}

			const users = await User.find(finalUserQuery);

			res.status(200).json({
				message: "Users with active subscriptions fetched successfully",
				users,
			});
		} catch (error) {
			console.error("Fetch Active Users Error:", error.message);
			res.status(500).json({ message: "Fetch Active Users Error" });
		}
	},
	updateTrainer: asyncHandler(async (req, res) => {
		try {
			const { id } = req.params;
			const { name, email, role } = req.body;

			let user = await User.findById(id);
			if (!user) {
				return res
					.status(404)
					.json({ success: false, message: "User not found" });
			}

			// If an image is uploaded, update the image
			if (req.file) {
				const result = await cloudinary.uploader.upload(req.file.path, {
					folder: "PSPCloudinaryData/users",
					width: 150,
					crop: "scale",
				});
				user.image = { public_id: result.public_id, url: result.secure_url };
			}

			user.name = name || user.name;
			user.email = email || user.email;
			user.role = role || user.role;

			await user.save();

			return res
				.status(200)
				.json({ success: true, message: "Trainer updated successfully", user });
		} catch (error) {
			console.error(error.message);
			return res
				.status(500)
				.json({ success: false, message: "Update Trainer Server Error" });
		}
	}),
	deleteUser: asyncHandler(async (req, res) => {
		try {
			const { id } = req.params;

			// Find the user
			const user = await User.findById(id);
			if (!user) {
				return res
					.status(404)
					.json({ success: false, message: "User not found" });
			}

			// Delete user's image from Cloudinary if it exists
			if (user.image && user.image.public_id) {
				await cloudinary.uploader.destroy(user.image.public_id);
			}

			// Delete user's Stripe customer if they have one
			if (user.stripeCustomerId) {
				try {
					await stripe.customers.del(user.stripeCustomerId);
				} catch (err) {
					// Ignore "resource_missing" error (customer not found)
					if (err.code === "resource_missing") {
						console.warn(
							`Stripe customer ${user.stripeCustomerId} not found or already deleted.`
						);
					} else {
						console.error("Stripe deletion error:", err);
						return res.status(500).json({
							success: false,
							message: "Error deleting Stripe customer",
							error: err.message,
						});
					}
				}
			}

			// Delete user from database
			await User.findByIdAndDelete(id);

			return res
				.status(200)
				.json({ success: true, message: "User deleted successfully" });
		} catch (error) {
			console.error("Delete User Error:", error);
			return res
				.status(500)
				.json({ success: false, message: "Error deleting user" });
		}
	}),
	getCoachRatings: asyncHandler(async (req, res) => {
		const { id } = req.params;

		try {
			const ratings = await Rating.find({ coachId: id });

			return res.status(200).json({
				success: true,
				ratings,
			});
		} catch (error) {
			return res.status(500).json({
				success: false,
				message: "Error fetching ratings data",
				error: error.message,
			});
		}
	}),
	getCoachClients: asyncHandler(async (req, res) => {
		try {
			const coaches = await User.find({ role: "coach" }).select(
				"_id name email image"
			);

			const coachClientList = await Promise.all(
				coaches.map(async (coach) => {
					const clients = await AvailTrainer.find({ coachID: coach._id })
						.populate("userId", "name email")
						.lean();

					const clientList = clients.map((client) => ({
						clientId: client.userId?._id,
						name: client.userId?.name || "Unknown",
						email: client.userId?.email || "Unknown",
					}));

					return {
						coachId: coach._id,
						coachName: coach.name,
						coachEmail: coach.email,
						image: coach.image || [],
						clients: clientList.length > 0 ? clientList : "No clients",
					};
				})
			);

			res.status(200).json({ coachesWithClients: coachClientList });
		} catch (error) {
			console.error("Error fetching coach clients:", error);
			res.status(500).json({ message: "Server error fetching coach clients" });
		}
	}),
};
module.exports = userController;
