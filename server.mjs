import express, { json } from 'express';
import admin from 'firebase-admin';
import cors from 'cors';
import mongoose from 'mongoose';
import FCMToken from './models/token.mjs';
import dotenv from 'dotenv';
dotenv.config({ path: './config/.env' });
const databaseUrl = process.env.MONGODB_URI;
const serviceAccountBase64 = process.env.SERVICE_ACCOUNT_BASE64;
const serviceAccountJson = JSON.parse(Buffer.from(serviceAccountBase64, 'base64').toString('utf-8'));
admin.initializeApp({
    credential: admin.credential.cert(serviceAccountJson),
});
console.log('Firebase Admin SDK initialized!');
dbconnect();
async function dbconnect() {
    try {
        await mongoose.connect(databaseUrl);
        console.log('MongoDB connected successfully!');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
    }
}
const app = express();
app.use(cors());
app.use(json());
const PORT = 3000;

app.get('/', (req, res) => {
    res.send('Hello World!');
});
app.post('/save-token', async (req, res) => {

    try {

        const existingToken = await FCMToken.findOne({ token });
        if (existingToken) {
            console.log('Token already exists:', token);
            return res.status(200).json({ message: 'Token already exists.' });
        } else {
            const newToken = new FCMToken({ token });
            const savedToken = await newToken.save();
            console.log('New token saved:', savedToken);
            return res.status(201).json({ message: 'Token saved successfully.', token: savedToken });
        }
    } catch (error) {
        console.error('Error saving message:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});



const sendNotificationToAll = async () => {
    try {
        // Retrieve all stored FCM tokens
        const tokens = await FCMToken.find();

        const tokenList = tokens.map((doc) => doc.token);

        const message = {
            notification: {
                title: 'soch alert',
                body: 'greeting from team soch!',
            },
            tokens: tokenList, // List of tokens
        };

        // Send the notification
        console.log(admin.messaging);
        const response = await admin.messaging().sendEachForMulticast(message);

        console.log(response.successCount + ' messages were sent successfully');
    } catch (error) {
        console.error('Error sending message:', error);
    }
}

app.get("/triggerNotify", async (req, res) => {
    console.log("notification triggerred ! ");
    await sendNotificationToAll();
});


app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

