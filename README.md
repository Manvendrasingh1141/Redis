# Redis and BullMQ Examples

A Node.js project for learning and demonstrating Redis, MongoDB, Redis Pub/Sub, and BullMQ. Each example is an independent Express server.

Repository: [github.com/Manvendrasingh1141/Redis](https://github.com/Manvendrasingh1141/Redis)

## What Is Redis?

Redis is an in-memory data store that keeps data as key-value structures. It is commonly used as a cache, session store, counter, queue, message broker, and fast temporary database. Redis supports strings, hashes, lists, sets, sorted sets, expiration times, and Pub/Sub channels.

Redis is fast because most operations happen in memory. It can also persist data to disk; this project enables Redis Append Only File persistence in Docker Compose.

## Why Use Redis?

- **Fast reads and writes:** useful for low-latency data.
- **Caching:** reduce repeated calls to a slower database or API.
- **Expiration:** automatically remove temporary data such as OTPs and sessions.
- **Counters and rankings:** use atomic commands such as `INCR` and sorted sets such as `ZINCRBY`.
- **Queues:** use Redis lists for simple FIFO work or BullMQ for retries and workers.
- **Real-time messaging:** use Pub/Sub to notify services about events.

## Problems Redis Solves

| Problem | Redis solution | Example in this project |
| --- | --- | --- |
| Repeated database or API requests are slow | Cache a value temporarily | Banner and user-data endpoints |
| A value must expire automatically | Set a TTL with `EX` | OTPs expire after 30 seconds |
| Concurrent requests update a number | Use atomic counters | Post view counts |
| Work should be processed later | Store jobs in a queue | Email list queue and BullMQ |
| Clients need event notifications | Publish and subscribe to a channel | Notification publisher/subscriber |
| Items need ranking by score | Use a sorted set | Post leaderboard |

Redis is usually a complement to a durable database, not a replacement for one.

## Project Examples

### Redis CRUD and MongoDB: `src/crud.js`

Runs on port `3002`:

- `GET /redis` checks Redis with `PING`.
- `GET /mongo` connects to MongoDB.
- `POST /banner`, `GET /banner`, `DELETE /banner`, and `GET /banner/exists` manage `app:banner`.

```bash
curl http://localhost:3002/redis
curl -X POST http://localhost:3002/banner
curl http://localhost:3002/banner
curl http://localhost:3002/banner/exists
curl -X DELETE http://localhost:3002/banner
curl http://localhost:3002/mongo
```

### Temporary OTP: `src/otp.js`

Runs on port `3004`. `POST /send-otp` creates a six-digit OTP and stores it at `otp:<phoneNumber>` with a 30-second expiration. `POST /verify-otp` compares the submitted OTP with Redis.

```bash
curl -X POST http://localhost:3004/send-otp \
  -H 'Content-Type: application/json' \
  -d '{"phoneNumber":"5551234567"}'

curl -X POST http://localhost:3004/verify-otp \
  -H 'Content-Type: application/json' \
  -d '{"phoneNumber":"5551234567","otp":"123456"}'
```

This is a learning example. Production OTPs should not be returned in the HTTP response, and attempts should be rate-limited.

### User data: `src/user.js`

Runs on port `3005`. It demonstrates JSON strings with a 30-second TTL and Redis hashes.

```bash
curl -X POST http://localhost:3005/user/42/json \
  -H 'Content-Type: application/json' \
  -d '{"name":"Mia","role":"admin"}'
curl http://localhost:3005/user/42/json

curl -X POST http://localhost:3005/user/42/hset \
  -H 'Content-Type: application/json' \
  -d '{"name":"Mia","role":"admin"}'
curl http://localhost:3005/user/42/hgetall
```

### Counters and leaderboard: `src/index.js`

Runs on port `3006`. View counts use `INCR`; leaderboard routes use `ZINCRBY`, `ZREVRANGE`, and `ZREVRANK`.

```bash
curl -X POST http://localhost:3006/post/post-1/view
curl -X POST http://localhost:3006/post/post-1/leaderboard \
  -H 'Content-Type: application/json' \
  -d '{"points":10}'
curl http://localhost:3006/leaderboard
curl http://localhost:3006/leaderboard/post-1/rank
```

### Redis list queue: `src/queue.js`

Runs on port `3009`. `POST /emails` pushes a job to `queue:emails` with `RPUSH`; `GET /emails` removes the oldest job with `LPOP`.

```bash
curl -X POST http://localhost:3009/emails \
  -H 'Content-Type: application/json' \
  -d '{"to":"user@example.com","subject":"Welcome","body":"Hello"}'
curl http://localhost:3009/emails
```

### BullMQ: `src/bullmq/`

The worker listens to `email-queue`, simulates sending an email, and logs completed or failed jobs. Run it in its own terminal:

```bash
node src/bullmq/worker.js
```

The current `src/bullmq/api.js` runs on port `3000` and returns a sample job payload, but it does not yet call `emailQueue.add()`. The queue and worker setup are ready for that next integration step.

### Redis Pub/Sub: `src/pub-sub/`

The API runs on port `3008` and publishes notifications to `notifications`:

```bash
node src/pub-sub/subscriber.js
node src/pub-sub/api.js
curl -X POST http://localhost:3008/notify \
  -H 'Content-Type: application/json' \
  -d '{"title":"A new notification"}'
```

The current subscriber listens to `my-channel`, so it will not receive API messages until both files use the same channel name.

## How to Implement Redis in Node.js

1. Install a Redis client such as `ioredis`.
2. Start Redis and create a client with its host and port.
3. Choose the data type that matches the problem: string, hash, list, sorted set, or channel.
4. Use expiration for temporary values and define a key naming convention.
5. Handle connection and command errors.
6. Keep durable records in a primary database when Redis is used as a cache or temporary store.

```js
import Redis from "ioredis";

const redis = new Redis("redis://localhost:6379");

await redis.set("session:42", JSON.stringify({ userId: 42 }), "EX", 3600);
const session = await redis.get("session:42");
console.log(JSON.parse(session));
```

## Requirements

- Node.js 18 or newer
- npm
- Docker Desktop with Docker Compose

## Run the Project

Clone the repository and install dependencies:

```bash
git clone https://github.com/Manvendrasingh1141/Redis.git
cd Redis
npm install
```

Start Redis and MongoDB:

```bash
docker compose up -d
docker compose ps
```

Start examples in separate terminals:

```bash
# Terminal 1: Redis CRUD and MongoDB check
node src/crud.js

# Terminal 2: OTP
node src/otp.js

# Terminal 3: User JSON and hash examples
node src/user.js

# Terminal 4: Counters and leaderboard
node src/index.js

# Terminal 5: Redis list queue
node src/queue.js

# Terminal 6: BullMQ worker
node src/bullmq/worker.js

# Terminal 7: BullMQ sample API
node src/bullmq/api.js

# Terminal 8: Pub/Sub subscriber
node src/pub-sub/subscriber.js

# Terminal 9: Pub/Sub API
node src/pub-sub/api.js
```

The package scripts start the main counter/leaderboard example:

```bash
npm start
npm run dev
```

Stop the containers when finished:

```bash
docker compose down
```

To also remove persisted Redis and MongoDB volumes:

```bash
docker compose down -v
```

## Current Learning Progress

This repository currently demonstrates:

- Redis strings, hashes, lists, sorted sets, counters, expiration, `EXISTS`, and `PING`.
- Redis-backed OTP storage with expiration.
- JSON and hash-based user data.
- A FIFO email queue using a Redis list.
- BullMQ queue/worker setup and job lifecycle logging.
- Redis Pub/Sub publishing and subscription concepts.
- Express endpoints that can be tested with `curl`.
- Docker Compose persistence for Redis and MongoDB.

## Troubleshooting

- **Redis connection errors:** run `docker compose ps` and confirm port `6379` is available.
- **MongoDB errors:** confirm port `27017` is available.
- **Port already in use:** use another port, for example `PORT=3010 node src/index.js`.
- **BullMQ jobs are not processed:** start `src/bullmq/worker.js` in a separate terminal.

## License

This project uses the ISC license declared in `package.json`.
