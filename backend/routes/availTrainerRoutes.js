const express = require('express');
const router = express.Router();
const availTrainerController = require('../controller/availTrainerController');

router.post('/create-trainer', availTrainerController.createTrainer);
router.post('/get-all-trainers', availTrainerController.getAllTrainers);
router.get('/get-trainer/:id', availTrainerController.getTrainerById);
router.put('/:id', availTrainerController.updateTrainer);
router.delete('/delete-trainer/:id', availTrainerController.deleteTrainer);
router.post('/avail-trainer-payment-intent', availTrainerController.createPaymentIntent);
router.get('/coach/:id', availTrainerController.getByAssignedCoach);
router.get('/client/:id', availTrainerController.getClientsAvailedServices);
router.put('/update/session/:id', availTrainerController.updateSessionSchedule);
router.put('/cancel/session/:id', availTrainerController.cancelSessionSchedule);
router.put('/complete/session/:id', availTrainerController.completeSessionSchedule);
router.post('/has-active', availTrainerController.hasActiveTraining);
router.post('/session-sales', availTrainerController.getSalesStats);
router.post('/training-usage-stats', availTrainerController.getTrainingUsageStats);
router.post('/training-type-stats', availTrainerController.getTrainingTypeStats);
router.post('/training-demographics', availTrainerController.trainingDemographics);


module.exports = router;