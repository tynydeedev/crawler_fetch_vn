import { createClient } from 'redis';

class RedisClient {
  private client: ReturnType<typeof createClient>;
  private redisHost: string;
  private redisPort: string;

  constructor() {
    this.redisHost = process.env.REDIS_HOST || 'localhost';
    this.redisPort = process.env.REDIS_PORT || '6379';

    this.client = createClient({
      url: `redis://${this.redisHost}:${this.redisPort}`,
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
