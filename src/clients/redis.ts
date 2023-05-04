import { createClient } from 'redis';

class RedisClient {
  private client: ReturnType<typeof createClient>;

  constructor() {
    this.client = createClient({
      url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
      disableOfflineQueue: true,
    });
    this.client.on('error', (error) => console.log('Redis error: ', error));
    this.client.on('connect', () => console.log('Redis connected'));
  }

  async connect() {
    await this.client.connect();
  }

  getClient() {
    return this.client;
  }

  async close() {
    await this.client.quit();
  }
}

export default new RedisClient();
