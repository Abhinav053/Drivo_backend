const redis = require("redis");

const { REDIS_PORT } = require("./serverConfig");

const redisClient = redis.createClient({
  url: `redis://localhost:${REDIS_PORT}`,
});

redisClient.on("error", (err) => {
  console.error("Redis Client Error: ", err);
});

async function connectRedis() {
  try {
    await redisClient.connect();
    console.log("✅ Connected to Redis successfully!");
  } catch (error) {
    console.error("Failed to connect to Redis:", error);
    throw error;
  }
}

module.exports = {
  connectRedis,
  redisClient,
};
