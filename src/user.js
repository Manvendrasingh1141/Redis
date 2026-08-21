import express from "express";
import Redis from "ioredis";


const app = express();
app.use(express.json());
const redis = new Redis("redis://localhost:6379");
const port = process.env.PORT || 3005;

app.post("/user/:id/json", async (req, res) => {
    const userId = req.params.id;
    const userData = req.body;

    try {
        // Store the JSON data in Redis with a key based on the user ID
        await redis.set(`user:${userId}`, JSON.stringify(userData), "EX", 30); // Expires in 30 seconds
        return res.json({ message: "User data stored successfully" });
    } catch (error) {
        return res.status(500).json({ error: "Unable to store user data" });
    }
});

app.get("/user/:id/json", async (req, res) => {
    const userId = req.params.id;

    try {
        // Retrieve the JSON data from Redis
        const userData = await redis.get(`user:${userId}`);
        if (userData) {
            return res.json(JSON.parse(userData));
        } else {
            return res.status(404).json({ error: "User data not found" });
        }
    } catch (error) {
        return res.status(500).json({ error: "Unable to retrieve user data" });
    }
});


app.post("/user/:id/hset", async (req, res) => {
    const userId = req.params.id;
    const userData = req.body;
    
    try {
        // Store the JSON data in Redis hash with a key based on the user ID
        await redis.hset(`user:${userId}`, userData);
        return res.json({ message: "User data stored successfully in hash" });
    } catch (error) {
        return res.status(500).json({ error: "Unable to store user data in hash" });
    }
});

app.get("/user/:id/hgetall", async (req, res) => {
    const userId = req.params.id;

    try {
        // Retrieve the JSON data from Redis hash
        const userData = await redis.hgetall(`user:${userId}`);
        if (Object.keys(userData).length > 0) {
            return res.json(userData);
        } else {
            return res.status(404).json({ error: "User data not found in hash" });
        }
    } catch (error) {
        return res.status(500).json({ error: "Unable to retrieve user data from hash" });
    }
});


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});