const express = require("express");
const clientController = require("../controller/clientController");
const isAuthenticated = require("../middlewares/isAuth");
const upload = require('../utils/multer')

const router = express.Router();
router.post('/submit-par-Q', clientController.submitParQ);


module.exports = router;