import dotenv from 'dotenv';
dotenv.config();

import crypto from 'crypto';
import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import { pool } from './resources';
import graph from './resources/graph';
import uiClient from './resources/ui-client';
import log from './log';

async function main() {
  const app = express();
  const port = process.env.PORT || 3000;

  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(morgan('combined'));

  app.get('/', async (req, res) => {
    return res.status(200).json({ service: 'Binance Crawler' });
  });

  app.get('/graph', async (req, res) => {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      Connection: 'keep-alive',
      'Cache-Control': 'no-cache',
    });

    const clientId = crypto.randomUUID();
    const newClient = {
      id: clientId,
      response: res,
    };

    uiClient.graphClients.push(newClient);

    req.on('close', () => {
      console.log(clientId, 'Connection closed');
      uiClient.graphClients = uiClient.graphClients.filter((c) => c.id !== clientId);
    });
  });

  app.get('/log', async (req, res) => {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      Connection: 'keep-alive',
      'Cache-Control': 'no-cache',
    });

    const clientId = crypto.randomUUID();
    const newClient = {
      id: clientId,
      response: res,
    };

    uiClient.logClients.push(newClient);

    req.on('close', () => {
      console.log(clientId, 'Connection closed');
      uiClient.logClients = uiClient.logClients.filter((c) => c.id !== clientId);
    });
  });

  try {
    app.listen(port, () => {
      console.log(`Example app listening on port ${port}`);
    });

    // Each time the server is started, clean the log file
    await log.cleanLogFile();

    // SYMBOLS is the amount of symbols the server will pool from binance.
    // These will be the first {SYMBOLS} symbols returned from the exchangeInfo API.
    const poolingAmount = Number(process.env.SYMBOLS) || undefined;
    await pool(poolingAmount);

    // Each 500ms the server will traverse the graph beginning from every symbols to find
    // the available triangle arbitrage opportunities.
    setInterval(async () => {
      await Promise.all(graph.getVertices().map((vertex) => graph.traverse(vertex)));
    }, 500);

    setInterval(() => {
      const data = JSON.stringify(Object.fromEntries(graph.getAdjacencyList()));
      uiClient.graphClients.forEach((client) => client.response.write(`data: ${data}\n\n`));
    }, 200);
  } catch (err) {
    console.log(`Error occured: ${err.message}`);
  }
}

void main();
