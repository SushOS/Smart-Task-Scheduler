const mongoose = require('mongoose');

const OTPSchema = new mongoose.Schema({
    email: {
        type: String,
        ref: 'User',
        required: true
    },
    otp: {
        type: String,
        required: true
    },
    expiry: {
        type: Date,
        required: true
    }
});

module.exports = mongoose.model('OTP', OTPSchema);