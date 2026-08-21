import express from "express";
import Redis from "ioredis";

const app = express();
app.use(express.json());
const redis = new Redis("redis://localhost:6379");
const port = process.env.PORT || 3009;

const QUEUE_KEY = "queue:emails";

app.post("/emails", async (req, res) => {
    const job = {
        to: req.body.to,
        subject: req.body.subject,
        body: req.body.body,
        createdAt: new Date().toISOString()
    };

    try {
        // Push the email data to the Redis list (queue)
        await redis.rpush(QUEUE_KEY, JSON.stringify(job));
        return res.json({ message: "Email data added to queue successfully" });
    } catch (error) {
        return res.status(500).json({ error: "Unable to add email data to queue" });
    }
});

app.get("/emails", async (req, res) => {
    try {
        // Retrieve all email data from the Redis list (queue)
        const job = await redis.lpop(QUEUE_KEY);
        if (job) {
            return res.json(JSON.parse(job));
        } else {
            return res.status(404).json({ error: "No email data found in queue" });
        }
    } catch (error) {
        return res.status(500).json({ error: "Unable to retrieve email data from queue" });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});