import fs from 'fs';
import path from 'path';
import graph from './graph';
import binanceClient from '../clients/binance';
import redisClient from '../clients/redis';

export async function pool(amount = 40) {
  console.log(`Pooling ${amount} symbols...`);

  const bookTickers: any[] = [];
  const list = await getExchangeInfo();
  await redisClient.connect();

  for (const symbol of list.slice(0, amount)) {
    const data = await binanceClient.client.exchangeInfo({ symbol });
    // @ts-expect-error bookTicker is missing in type definition of binance library
    const bookTicker = binanceClient.client.ws.bookTicker(symbol, async (ticker) => {
      const client = redisClient.getClient();
      await client.HSET('book_tickers', ticker.symbol, JSON.stringify(ticker));
      graph.updateRelation(data.symbols[0], ticker);
    });
    bookTickers.push(bookTicker);
  }

  return () => {
    for (const bookTicker of bookTickers) {
      bookTicker();
    }
  };
}

async function getExchangeInfo() {
  try {
    await binanceClient.checkConnection();
  } catch (error) {
    console.log('Cannot connect to Binance. Please check your connection!');
    process.exit(1);
  }
  const exchangeInfoRaw = await binanceClient.client.exchangeInfo();
  const data = exchangeInfoRaw.symbols.map((symbol) => ({ symbol: symbol.symbol }));
  await fs.promises.writeFile(
    path.join(__dirname, '..', 'log', 'exchange_info.json'),
    JSON.stringify(data),
  );
  return data.map((e) => e.symbol);
}
