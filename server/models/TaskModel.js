const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    userId: { type: String, required: true }, // To associate with a specific user
    taskName: { type: String, required: true },
    category: { type: String, required: true },
    deadline_date: { type: Date, required: true },
    deadline_time: { type: String, required: true },
    estimatedTime: { type: String, required: true }, // in hours
    priority: { type: String, enum: ['Low', 'Medium', 'High'], required: true },
    status: {
        type: String,
        enum: ['pending', 'completed', 'missed'],
        default: 'pending'
    }
}, {
    timestamps: true,
});

module.exports = mongoose.model('Task', taskSchema);
