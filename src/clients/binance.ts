import Binance, { Binance as BinanceInterface } from 'binance-api-node';

class BinanceClient {
  public client: BinanceInterface;

  constructor() {
    this.client = Binance();
  }

  async checkConnection() {
    console.log('Binance time:', await this.client.time());
    return true;
  }
}

export default new BinanceClient();
