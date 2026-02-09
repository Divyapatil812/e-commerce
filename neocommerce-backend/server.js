const express = require('express');
const mongoose = require('mongoose');
const twilio = require('twilio');
const cors = require('cors');
require('dotenv').config();

const app = express();

// CORS Configuration (MUST be before routes)
const corsOptions = {
    origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3007', 'http://localhost:3008', 'https://splendorous-pony-39f622.netlify.app'], // Add all allowed origins here
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Specify allowed HTTP methods
    credentials: true, // Set to true if you are using cookies or authorization headers
    optionsSuccessStatus: 204 // Some legacy browsers choke on 204
};
app.use(cors(corsOptions));

app.use(express.json());

// 1. Database Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("Connected to MongoDB Node"))
    .catch(err => console.error("Database Connection Failed", err));

// 2. Data Models
const OtpSchema = new mongoose.Schema({
    mobile: String,
    code: String,
    createdAt: { type: Date, default: Date.now, index: { expires: 300 } } // Auto-delete in 5m
});

const UserSchema = new mongoose.Schema({
    name: String,
    mobile: String,
    location: {
        lat: Number,
        lon: Number
    },
    registeredAt: { type: Date, default: Date.now }
});

const OtpModel = mongoose.model('Otp', OtpSchema);
const UserModel = mongoose.model('User', UserSchema);

// 3. Twilio Initialization
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

console.log(`[TWILIO] Account SID: ${process.env.TWILIO_ACCOUNT_SID}`);
console.log(`[TWILIO] Using phone: ${process.env.TWILIO_PHONE_NUMBER}`);

// ROUTE: Send OTP
app.post('/send-otp', async (req, res) => {
    const { mobile } = req.body;
    
    if (!mobile) {
        return res.status(400).json({ error: "Mobile number is required" });
    }
    
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();

    try {
        console.log(`[SEND-OTP] Attempting to send OTP ${generatedOtp} to +91${mobile}`);
        
        await OtpModel.findOneAndUpdate({ mobile }, { code: generatedOtp }, { upsert: true, new: true });

       // Inside app.post('/send-otp')
const fromNumber = process.env.TWILIO_PHONE_NUMBER.replace(' whatsapp', '');
const message = await client.messages.create({
    body: `NEOCOMMERCE Access Key: ${generatedOtp}`,
    from: `whatsapp:${fromNumber}`,
    to: `whatsapp:+91${mobile}`
});

        console.log(`[SUCCESS] OTP sent: ${message.sid}`);
        res.status(200).json({ success: true, sid: message.sid });
    } catch (err) {
        console.error(`[SEND-OTP] ERROR: ${err.message}`);
        console.error(`[SEND-OTP] Full Error:`, err);
        res.status(500).json({ error: err.message });
    }
});

// ROUTE: Health Check
app.get('/health', (req, res) => {
    res.json({ status: "Backend is ONLINE ✅", timestamp: new Date() });
});

// ROUTE: Verify & Save User
app.post('/verify-otp', async (req, res) => {
    const { mobile, otp, name, location } = req.body;

    try {
        const record = await OtpModel.findOne({ mobile });

        if (record && record.code === otp) {
            // OTP is correct, save the full user profile
            const newUser = await UserModel.create({
                name,
                mobile,
                location: { lat: location.lat, lon: location.lon }
            });

            await OtpModel.deleteOne({ mobile }); // Cleanup
            res.status(200).json({ valid: true, user: newUser });
        } else {
            res.status(400).json({ valid: false, message: "Invalid Key" });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ROUTE: Finalize Transaction
app.post('/finalize-transaction', async (req, res) => {
    const { userName, amount } = req.body;
    try {
        console.log(`Transaction finalized for ${userName}, amount ${amount}`);
        res.status(200).json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(5000, '0.0.0.0', () => console.log("Neo-Backend Live on Port 5000"));

// Handle uncaught errors
process.on('unhandledRejection', (err) => {
    console.error('[UNHANDLED REJECTION]', err);
});

process.on('uncaughtException', (err) => {
    console.error('[UNCAUGHT EXCEPTION]', err);
});