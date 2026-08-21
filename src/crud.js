import express from 'express';
import Redis from 'ioredis';
import mongoose from 'mongoose';


const app = express();
app.use(express.json());
const redis = new Redis("redis://localhost:6379");
const url = "mongodb://localhost:27017/mongo_container";
const port = process.env.PORT || 3002;


const BANNER_KEY = "app:banner";

app.get('/redis',async(req,res)=>{
    const reply = await redis.ping();
    res.json({redis:reply});
});


app.get('/mongo',async(req,res)=>{
    await mongoose.connect(url);
    res.json({mongo:"connected"});
});

app.post('/banner',async(req,res)=>{
    await redis.set(BANNER_KEY,"This is a banner" || req.body.banner);
    res.json({message:"Banner set successfully"});
});

app.get('/banner',async(req,res)=>{
    const banner = await redis.get(BANNER_KEY);
    res.json({banner});
});

app.delete('/banner',async(req,res)=>{
    await redis.del(BANNER_KEY);
    res.json({message:"Banner deleted successfully"});
});

app.get('/banner/exists',async(req,res)=>{
    const exists = await redis.exists(BANNER_KEY);
    res.json({exists:Boolean(exists)});
});

app.listen(port,()=>{
    console.log(`Server is running on port ${port}`);
});