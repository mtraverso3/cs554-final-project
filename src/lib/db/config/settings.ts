export const mongoConfig = {
    serverUrl: process.env.MONGO_SERVER_URL || 'mongodb://localhost:27017',
    database: process.env.MONGODB_DB || '554FinalProject',
  };

export const redisConfig = {
  serverUrl: process.env.REDIS_SERVER_URL || 'redis://localhost:6379',
}