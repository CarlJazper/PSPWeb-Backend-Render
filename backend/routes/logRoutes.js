const express = require("express");
const logsController = require("../controller/logsController");
const isAuthenticated = require("../middlewares/isAuth");

const router = express.Router();
// router.post('/create-exercise', upload.array('image[]'), exerciseController.createExercise);
router.post('/get-all-logs', logsController.getAllLogs);


module.exports = router;