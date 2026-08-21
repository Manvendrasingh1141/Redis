import redis from "ioredis";

const subscriber = new redis("redis://localhost:6379");

subscriber.subscribe("my-channel", (err, count) => {
    if (err) {
        console.error("Error occurred while subscribing to channel:", err);
        return;
    }
    console.log(`Subscribed to channel "my-channel". Total subscriptions: ${count}`);
});

subscriber.on("message", (channel, message) => {
    console.log(`Received message from channel "${channel}": ${message}`);
});
