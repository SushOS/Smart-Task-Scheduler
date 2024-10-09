const mongoose = require('mongoose');

const timetableSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    schedule: [{
        task_id: {
            type: String,
            required: true
        },
        date: {
            type: String,
            required: true
        },
        time: {
            type: String,
            required: true
        },
        activity: {
            type: String,
            required: true
        },
        category: {
            type: String,
            required: true
        },
        priority: String,
        status: {
            type: String,
            enum: ['pending', 'completed', 'missed'],
            default: 'pending'
        }
    }],
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Timetable', timetableSchema);