const asyncHandler = require("express-async-handler");
const Branch = require("../model/branch");

const branchController = {
  createBranch: asyncHandler(async (req, res) => {
    try {
      const { name, email, contact, place } = req.body;
      let branch = new Branch({
        name,
        email,
        contact,
        place,
      });

      branch = await branch.save();

      return res.status(201).json({
        success: true,
        message: 'Branch Created Successfully',
        branch
      });

    } catch (error) {
      console.log(error);
      res.status(500).json({
        success: false,
        message: 'Error in Creating Branch',
        error: error.message
      });
    }
  }),

  getBranches: asyncHandler(async (req, res) => {
    try {
      const branch = await Branch.find();
      res.status(200).json({ message: "Branches fetched successfully", branch });
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
        return res.status(404).json({ success: false, message: "Branch not found" });
      }

      res.status(200).json({ success: true, branch });
    } catch (error) {
      console.error("Fetch Branch by ID Error:", error.message);
      res.status(500).json({ success: false, message: "Error fetching branch", error: error.message });
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
        return res.status(404).json({ success: false, message: "Branch not found" });
      }

      res.status(200).json({ success: true, message: "Branch updated successfully", branch });
    } catch (error) {
      console.error("Update Branch Error:", error.message);
      res.status(500).json({ success: false, message: "Error updating branch", error: error.message });
    }
  }),

  deleteBranch: asyncHandler(async (req, res) => {
    try {
      const { id } = req.params;

      const branch = await Branch.findByIdAndDelete(id);

      if (!branch) {
        return res.status(404).json({ success: false, message: "Branch not found" });
      }

      res.status(200).json({ success: true, message: "Branch deleted successfully" });
    } catch (error) {
      console.error("Delete Branch Error:", error.message);
      res.status(500).json({ success: false, message: "Error deleting branch", error: error.message });
    }
  }),
};

module.exports = branchController;
