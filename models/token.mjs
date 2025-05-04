import mongoose from "mongoose";

const fcmTokenSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true,
        unique: true
    },
});

export default mongoose.model('FCMToken', fcmTokenSchema);

// Save token in database

