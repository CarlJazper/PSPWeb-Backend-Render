const asyncHandler = require("express-async-handler");
const Branch = require("../model/branch");
const User = require("../model/user");
const bcrypt = require("bcryptjs");

const branchController = {
	createBranch: asyncHandler(async (req, res) => {
		try {
			const { name, email, contact, place, admin } = req.body;

			// 1. Check if admin email already exists
			const existingAdmin = await User.findOne({ email: admin.email });
			if (existingAdmin) {
				return res.status(400).json({
					success: false,
					message: "Admin email already exists",
				});
			}

			// 2. Create branch
			const branch = new Branch({ name, email, contact, place });
			await branch.save();

			// 3. Hash password
			const hashedPassword = await bcrypt.hash(admin.password, 10);

			// 4. Create admin assigned to this branch
			const newAdmin = new User({
				name: admin.name,
				email: admin.email,
				password: hashedPassword,
				role: "admin",
				phone: admin.phone || "",
				userBranch: branch._id,
			});

			await newAdmin.save();

			return res.status(201).json({
				success: true,
				message: "Branch and Admin created successfully",
				branch,
				admin: {
					_id: newAdmin._id,
					name: newAdmin.name,
					email: newAdmin.email,
				},
			});
		} catch (error) {
			console.error("Error creating branch and admin:", error.message);
			res.status(500).json({
				success: false,
				message: "Error creating branch and admin",
				error: error.message,
			});
		}
	}),

	getBranches: asyncHandler(async (req, res) => {
		try {
			const branch = await Branch.find();
			res
				.status(200)
				.json({ message: "Branches fetched successfully", branch });
		} catch (error) {
			console.error("Fetch All Branch Error:", error.message);
			res.status(500).json({ message: "Error fetching branches" });
		}
	}),

	getBranchById: asyncHandler(async (req, res) => {
		try {
			const { id } = req.params;
			const branch = await Branch.findById(id);

			if (!branch) {
				return res
					.status(404)
					.json({ success: false, message: "Branch not found" });
			}

			res.status(200).json({ success: true, branch });
		} catch (error) {
			console.error("Fetch Branch by ID Error:", error.message);
			res
				.status(500)
				.json({
					success: false,
					message: "Error fetching branch",
					error: error.message,
				});
		}
	}),

	updateBranch: asyncHandler(async (req, res) => {
		try {
			const { id } = req.params;
			const { name, email, contact, place } = req.body;

			const branch = await Branch.findByIdAndUpdate(
				id,
				{ name, email, contact, place },
				{ new: true }
			);

			if (!branch) {
				return res
					.status(404)
					.json({ success: false, message: "Branch not found" });
			}

			res
				.status(200)
				.json({
					success: true,
					message: "Branch updated successfully",
					branch,
				});
		} catch (error) {
			console.error("Update Branch Error:", error.message);
			res
				.status(500)
				.json({
					success: false,
					message: "Error updating branch",
					error: error.message,
				});
		}
	}),

	deleteBranch: asyncHandler(async (req, res) => {
		try {
			const { id } = req.params;

			const branch = await Branch.findByIdAndDelete(id);

			if (!branch) {
				return res
					.status(404)
					.json({ success: false, message: "Branch not found" });
			}

			res
				.status(200)
				.json({ success: true, message: "Branch deleted successfully" });
		} catch (error) {
			console.error("Delete Branch Error:", error.message);
			res
				.status(500)
				.json({
					success: false,
					message: "Error deleting branch",
					error: error.message,
				});
		}
	}),
};

module.exports = branchController;