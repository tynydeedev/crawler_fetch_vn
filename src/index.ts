import dotenv from 'dotenv';
dotenv.config();

import crypto from 'crypto';
import express, { Response } from 'express';
import morgan from 'morgan';
import cors from 'cors';
import { pool } from './resources';
import graph from './resources/graph';
import log from './log';

export let UiClients: { id: string; response: Response }[] = [];

async function main() {
  const app = express();
  const port = process.env.PORT || 3000;

  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(morgan('combined'));

  app.get('/', async (req, res) => {
    return res.status(200).json({ message: 'Hello World!' });
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

    UiClients.push(newClient);

    req.on('close', () => {
      console.log(clientId, 'Connection closed');
      UiClients = UiClients.filter((c) => c.id !== clientId);
    });
  });

  try {
    app.listen(port, () => {
      console.log(`Example app listening on port ${port}`);
    });
    await log.cleanLogFile();
    await pool(Number(process.env.SYMBOLS));
    setInterval(() => {
      graph.getVertices().forEach((vertex) => {
        graph.traverse(vertex);
      });
    }, 500);
    setInterval(() => {
      const data = JSON.stringify(Object.fromEntries(graph.getAdjacencyList()));
      UiClients.forEach((client) => client.response.write(`data: ${data}\n\n`));
    }, 200);
  } catch (err) {
    console.log(`Error occured: ${err.message}`);
  }
}

void main();
