import binance from '../../src/clients/binance';

describe('Binance', () => {
  it('should be defined', () => {
    expect(binance).toBeDefined();
  });

  it('should print the Binance server time', async () => {
    await expect(binance.checkConnection()).resolves.toBe(true);
  });
});
