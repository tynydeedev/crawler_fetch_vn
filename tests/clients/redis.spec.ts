import redis from '../../src/clients/redis';

describe('Redis', () => {
  afterAll(async () => {
    await redis.close();
  });

  it('should be able to connect', async () => {
    const consoleSpy = jest.spyOn(console, 'log');
    expect(consoleSpy).toHaveBeenCalledTimes(0);
    await expect(redis.connect()).resolves.toBeUndefined();
    expect(consoleSpy).toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith('Redis connected');
  });

  it('should return redis client', async () => {
    const client = redis.getClient();
    expect(client).toBeDefined();
  });
});
