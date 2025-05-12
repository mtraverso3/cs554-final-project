import redis from "redis";
import { redisConfig } from "./settings";

let _client = undefined;

const redisClient = async () => {
  if (!_client) {
    _client = redis.createClient({ url: redisConfig.serverUrl });
    _client.on("error", function (error) {
      console.error(error);
    });
    await _client.connect();
  }
  return _client;
};

export { redisClient };
