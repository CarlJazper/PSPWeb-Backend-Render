const express = require('express');
const branchController = require('../controller/branchController');


const router = express.Router();
router.post("/create-branch", branchController.createBranch);
router.get('/get-all-branches', branchController.getBranches);
router.get('/get-branch/:id', branchController.getBranchById);
router.put("/update-branch/:id", branchController.updateBranch);
router.delete("/delete-branch/:id", branchController.deleteBranch);


module.exports = router;