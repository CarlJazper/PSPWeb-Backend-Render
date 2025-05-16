const express = require('express');
const paymentController = require('../controller/paymentController');


const router = express.Router();
router.post("/create-stripe-subscription-transaction", paymentController.stripeCreateSubscription);
router.post("/create-psp-subscription-transaction", paymentController.pspCreateSubscription);


module.exports = router;