import fs from 'fs';
import path from 'path';

export class Logger {
  private logFile: string;

  constructor(rootDir: string = __dirname) {
    this.logFile = path.join(rootDir, 'log.txt');
  }

  async addLog(log: string) {
    return fs.promises
      .appendFile(this.logFile, `${new Date().toISOString()} --- ${log}\n`)
      .catch((err) => console.log('Append log error: ', err));
  }

  async cleanLogFile() {
    return fs.promises
      .rm(this.logFile, { force: true })
      .catch((err) => console.log('Delete log error: ', err));
  }
}

export default new Logger();
