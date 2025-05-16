const express = require("express");
const exerciseController = require("../controller/exerciseController");
const isAuthenticated = require("../middlewares/isAuth");
const upload = require('../utils/multer')

const router = express.Router();
router.post('/create-exercise', upload.array('images'), exerciseController.createExercise);
router.get('/get-all-exercise', exerciseController.getExercise);
router.get('/get-exercise/:id', exerciseController.getExerciseById);
router.put("/update-exercise/:id", upload.array('images'), exerciseController.updateExercise);
router.delete("/delete-exercise/:id", exerciseController.deleteExercise);


module.exports = router;