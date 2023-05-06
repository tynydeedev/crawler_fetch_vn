import fs from 'fs';
import path from 'path';
import uiClient from '../resources/ui-client';

export class Logger {
  private logFile: string;

  constructor(rootDir: string = __dirname) {
    this.logFile = path.join(rootDir, 'data.log');
  }

  async addLog(log: string) {
    const logString = `${new Date().toISOString()} --- ${log}`;
    await fs.promises
      .appendFile(this.logFile, logString + '\n')
      .catch((err) => console.log('Append log error: ', err));
    await Promise.all(
      uiClient.logClients.map((client) => client.response.write(`data: ${logString}\n\n`)),
    );
  }

  async cleanLogFile() {
    return fs.promises
      .rm(this.logFile, { force: true })
      .catch((err) => console.log('Delete log error: ', err));
  }
}

export default new Logger();
