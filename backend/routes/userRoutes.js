const express = require("express");
const userController = require("../controller/userController");
const { isAuthenticatedUser } = require("../middlewares/isAuth");
const upload = require('../utils/multer')

const router = express.Router();

//!Register
router.post('/register', upload.single('image'), userController.register);
router.post("/login", userController.login);
router.put('/update', upload.single('image'), userController.updateUser);
router.put('/update-password', isAuthenticatedUser, userController.updateUserPassword);
router.get('/get-user/:id', userController.getUser);
router.post('/get-all-users', userController.getAllUsers);
router.post('/user-log/:id', userController.userLog);
router.get('/get-timedin-logs', userController.getTimeInLogs);

router.put('/update-trainer/:id', upload.single('image'), userController.updateTrainer);
router.delete('/user-delete/:id', userController.deleteUser);
router.get('/get-ratings/:id', userController.getCoachRatings);
router.get('/coach-clients', userController.getCoachClients);
router.post("/age-demographics", userController.getAgeDemographics);

module.exports = router;