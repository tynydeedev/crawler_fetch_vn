import path from 'path';
import fs from 'fs';
import { Logger } from '../../src/log';

describe('Logger', () => {
  const rootDir = path.join(__dirname, '..', 'fixtures');
  const logFile = path.join(rootDir, 'log.txt');
  const logger = new Logger(rootDir);

  beforeAll(async () => {
    await fs.promises.rm(logFile, { force: true });
  });

  it('should create the log file and append the 1st log', async () => {
    expect(fs.existsSync(logFile)).toBe(false);
    await logger.addLog('sample log');
    await expect(fs.promises.readFile(logFile, 'utf-8')).resolves.toEqual(
      expect.stringContaining('sample log'),
    );
  });

  it('should append the 2nd log', async () => {
    await logger.addLog('sample log 2');
    await expect(fs.promises.readFile(logFile, 'utf-8')).resolves.toEqual(
      expect.stringContaining('sample log 2'),
    );
  });

  it('should delete the log file', async () => {
    await logger.cleanLogFile();
    expect(fs.existsSync(logFile)).toBe(false);
  });
});
