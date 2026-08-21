import express from "express";
import Redis from "ioredis";

const app = express();
app.use(express.json());
const port = process.env.PORT || 3008;

const publisher = new Redis("redis://localhost:6379");



app.post("/notify", async (req, res) => {
    const payload = {
        title: req.body.title,
        createdAt: new Date().toISOString()
    }
    const reciever = await publisher.publish("notifications", JSON.stringify(payload));
    res.json({ message: "Notification sent successfully", reciever });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
}); 