const mongoose = require('mongoose');

const preferenceSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    schedulingStartHour: { type: String, required: true },
    schedulingEndHour: { type: String, required: true },
    workingHours: { type: Number, required: true },
    relaxingHours: { type: Number, required: true },
    playingHours: { type: Number, required: true },
    playingStartTime: { type: String },
    playingEndTime: { type: String },
    goals: { type: [String], required: true },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Preference', preferenceSchema);
