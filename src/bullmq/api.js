import express from "express";

const app = express();
app.use(express.json());

const port = process.env.PORT || 3000;

app.get("/welcome-email", (req, res) => {
    const job = {
        to: req.body.to,
        subject: req.body.subject,
        message: req.body.message
    };
    const options = {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 5000
        }
    };
    try {
        // Here you would normally add the job to a queue or process it
        return res.json({ message: "Welcome email job created successfully", job });
    } catch (error) {
        return res.status(500).json({ error: "Unable to create welcome email job" });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
}); 