const { cloudinary, secretKey } = require('../config/cloudinaryConfig')
const asyncHandler = require("express-async-handler");
const Exercise = require("../model/exercise");

const exerciseController = {
    createExercise: async (req, res) => {
        try {
            const { name, type, targetMuscle, equipmentUsed, difficulty, instructions } = req.body;

            const images = req.files;

            // console.log(req.body)
            // console.log(req.files)

            let imageData = []

            for (let i = 0; i < images.length; i++) {
                const imagePath = images[i].path;
                try {
                    const result = await cloudinary.uploader.upload(imagePath, {
                        folder: 'PSPCloudinaryData/exercises',
                        width: 150,
                        crop: 'scale'
                    });
                    // console.log('These are the uploaded images:', result);
                    imageData.push({ public_id: result.public_id, url: result.secure_url });
                } catch (error) {
                    console.log(error.message);
                }
            }

            // console.log(imageData)

            const exercise = new Exercise({
                name,
                type,
                targetMuscle,
                equipmentUsed,
                difficulty,
                instructions,
                image: imageData,
            });

            console.log('This is the exercise', exercise)

            await exercise.save();

            res.status(201).json({
                message: "Exercise created successfully",
                exercise
            });
        } catch (error) {
            console.error("Create Exercise Error:", error);
            res.status(500).json({ message: "Create Exercise Error" });
        }
    },
    getExercise: async (req, res) => {
        try {
            const exercises = await Exercise.find()
            // console.log(exercise)
            res.status(201).json({ message: "Exercise fetch successfully", exercises });
        } catch (error) {
            console.error("Fetch All Exercise Error:", error.message);
            res.status(500).json({ message: "Create Exercise Error" });
        }
    },
    getExerciseById: async (req, res) => {
        try {
            const { id } = req.params;
            const exercise = await Exercise.findById(id);

            if (!exercise) {
                return res.status(404).json({ message: "Exercise not found" });
            }

            res.status(200).json({ message: "Exercise fetched successfully", exercise });
        } catch (error) {
            console.error("Fetch Exercise By ID Error:", error.message);
            res.status(500).json({ message: "Fetch Exercise By ID Error" });
        }
    },

    updateExercise: async (req, res) => {
        try {
            const { id } = req.params;
            const { name, type, targetMuscle, equipmentUsed, difficulty, instructions } = req.body;
            const images = req.files;
            let imageData = [];

            if (images && images.length > 0) {
                for (let i = 0; i < images.length; i++) {
                    const imagePath = images[i].path;
                    try {
                        const result = await cloudinary.uploader.upload(imagePath, {
                            folder: 'PSPCloudinaryData/exercises',
                            width: 150,
                            crop: 'scale'
                        });
                        imageData.push({ public_id: result.public_id, url: result.secure_url });
                    } catch (error) {
                        console.log(error.message);
                    }
                }
            }

            const updatedExercise = await Exercise.findByIdAndUpdate(
                id,
                {
                    name,
                    type,
                    targetMuscle,
                    equipmentUsed,
                    difficulty,
                    instructions,
                    ...(imageData.length > 0 && { image: imageData })
                },
                { new: true }
            );

            if (!updatedExercise) {
                return res.status(404).json({ message: "Exercise not found" });
            }

            res.status(200).json({ message: "Exercise updated successfully", exercise: updatedExercise });
        } catch (error) {
            console.error("Update Exercise Error:", error.message);
            res.status(500).json({ message: "Update Exercise Error" });
        }
    },

    deleteExercise: async (req, res) => {
        try {
            const { id } = req.params;
            const deletedExercise = await Exercise.findByIdAndDelete(id);

            if (!deletedExercise) {
                return res.status(404).json({ message: "Exercise not found" });
            }

            res.status(200).json({ message: "Exercise deleted successfully" });
        } catch (error) {
            console.error("Delete Exercise Error:", error.message);
            res.status(500).json({ message: "Delete Exercise Error" });
        }
    }
};
module.exports = exerciseController;