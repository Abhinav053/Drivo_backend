const dotenv = require("dotenv");
dotenv.config();

module.exports = {
  PORT: Number(process.env.PORT) || 5500,
  ATLAS_DB_URL: process.env.ATLAS_DB_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRY: process.env.JWT_EXPIRY,
  REDIS_PORT: process.env.REDIS_PORT || 6379,
  SALT_ROUND: Number(process.env.SALT_ROUND) || 10,
};
