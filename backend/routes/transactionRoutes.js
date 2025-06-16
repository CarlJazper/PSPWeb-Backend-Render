const express = require('express');
const transactionController = require('../controller/transactionController');


const router = express.Router();
router.post('/get-all-transactions', transactionController.getAllTransactions);
router.post('/membership-sales-stats', transactionController.getMembershipSalesStats);



module.exports = router;