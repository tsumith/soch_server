import express, { json } from 'express';
import admin from 'firebase-admin';
import serviceAccount from './config/serviceAccoutKey.json' assert { type: 'json' };
import cors from 'cors';
import mongoose from 'mongoose';
import FCMToken from './models/token.mjs';
import dotenv from 'dotenv';
dotenv.config({ path: './config/.env' });
const databaseUrl = process.env.MONGODB_URI;
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});
console.log('Firebase Admin SDK initialized!');
console.log('Database URL:', databaseUrl);
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
        const { token } = req.body;
        const newToken = new FCMToken({ token });
        const savedToken = await newToken.save();


        console.log('Received token:', savedToken);
        res.send("token received");
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

