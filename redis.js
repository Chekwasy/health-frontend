import { Redis } from "@upstash/redis";

class RedisClient {
  constructor() {
    this.client = Redis.fromEnv();
    this.clientConnected = true; 
  }

  isAlive() {
    return this.clientConnected;
  }

  async get(key) {
    return await this.client.get(key);
  }

  async set(key, value, duration) {
    await this.client.set(key, value, {
      ex: duration,
      nx: true,
    });
  }

  async del(key) {
    await this.client.del(key);
  }
}

const redisClient = new RedisClient();
export default redisClient;
