import express from "express";
import Redis from "ioredis";
import mongoose from "mongoose";

const app = express();
app.use(express.json());
const redis = new Redis("redis://localhost:6379");
const url = "mongodb://localhost:27017/mongo_container";
const port = process.env.PORT || 3004;


function otpKey(phoneNumber) {
    return `otp:${phoneNumber}`;
}

app.post("/send-otp", async (req, res) => {
    try {
        const { phoneNumber } = req.body;
        if (!phoneNumber) {
            return res.status(400).json({ error: "Phone number is required" });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        await redis.set(otpKey(phoneNumber), otp, "EX", 30);
        return res.json({ message: "OTP sent successfully", otp });
    } catch (error) {
        return res.status(500).json({ error: "Unable to send OTP" });
    }
});

app.post("/verify-otp", async (req, res) => {
    const { phoneNumber, otp } = req.body;
    if (!phoneNumber || !otp) {
        return res.status(400).json({ error: "Phone number and OTP are required" });
    }

    const storedOtp = await redis.get(otpKey(phoneNumber));
    if (storedOtp === otp) {
        return res.json({ success: true, message: "OTP verified successfully" });
    } else {
        return res.status(400).json({ success: false, message: "Invalid OTP" });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
}); 

