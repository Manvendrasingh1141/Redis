/**
 * POST /post/:id/view
 * @name incr
 * @description Increment the view count for a specific post in Redis.
 * @param {string} id - The ID of the post to increment the view count for.
 * @returns {object} - A JSON response indicating success or failure. 
 */


/**
 * POST /post/leaderboard
 * @name zincrby
 * @description Add points to a specific post in the Redis sorted set for leaderboard tracking.
 * @param {string} id - The ID of the post to add points to.
 * @param {number} points - The number of points to add to the post's score.
 * @returns {object} - A JSON response indicating success or failure.
 */


/**
 * GET /leaderboard
 * @name zrevrange
 * @description Retrieve the top 10 posts with the highest scores from the Redis sorted set.
 * @returns {object} - A JSON response containing the top posts and their scores.   
 */

/**
 * GET leaderboard/:id/rank
 * @name zrevrank
 * @description Retrieve the rank of a specific post in the Redis sorted set.
 * @param {string} id - The ID of the post to retrieve the rank for.
 * @returns {object} - A JSON response containing the rank of the specified post.   
 */



import express from "express";
import Redis from "ioredis";

const app = express();
app.use(express.json());
const redis = new Redis("redis://localhost:6379");
const port = process.env.PORT || 3006;

app.post("/post/:id/view", async (req, res) => {
    const postId = req.params.id;
    try {
        await redis.incr(`post:${postId}:views`);
        const viewCount = await redis.get(`post:${postId}:views`);
        return res.json({ message: "View count incremented successfully", key: `post:${postId}:views`, value: viewCount });
    } catch (error) {
        return res.status(500).json({ error: "Unable to increment view count" });
    }
});

app.post("/post/:id/leaderboard", async (req, res) => {
    const postId = req.params.id;
    const points = req.body.points || 1; // Default to 1 point if not provided
    try {
        await redis.zincrby("leaderboard", points, postId);
        return res.json({ message: "Points added to leaderboard successfully" });
    } catch (error) {
        return res.status(500).json({ error: "Unable to add points to leaderboard" });
    }
});

app.get("/leaderboard", async (req, res) => {
    try {
        const topPosts = await redis.zrevrange("leaderboard", 0, 3, "WITHSCORES");
        const formattedTopPosts = [];
        for (let i = 0; i < topPosts.length; i += 2) {
            formattedTopPosts.push({ postId: topPosts[i], score: parseInt(topPosts[i + 1]) });
        }
        return res.json(formattedTopPosts);
    } catch (error) {
        return res.status(500).json({ error: "Unable to retrieve leaderboard" });
    }
});

app.get("/leaderboard/:id/rank", async (req, res) => {
    const postId = req.params.id;
    try {
        const rank = await redis.zrevrank("leaderboard", postId);
        if (rank !== null) {
            return res.json({ postId, rank: rank + 1 }); // Rank is 0-based, so add 1
        } else {
            return res.status(404).json({ error: "Post not found in leaderboard" });
        }
    } catch (error) {
        return res.status(500).json({ error: "Unable to retrieve post rank" });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
}); 