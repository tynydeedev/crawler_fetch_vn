import path from 'path';
import fs from 'fs';
import { Logger } from '../../src/log';

jest.mock('../../src/resources/ui-client', () => {
  return {
    logClients: [
      { response: { write: jest.fn().mockImplementation((data) => console.log(data)) } },
    ],
  };
});

describe('Logger', () => {
  const rootDir = path.join(__dirname, '..', 'fixtures');
  const logFile = path.join(rootDir, 'data.log');
  const logger = new Logger(rootDir);
  const consoleLogSpy = jest.spyOn(console, 'log');

  afterEach(() => consoleLogSpy.mockClear());

  beforeAll(async () => {
    await fs.promises.rm(logFile, { force: true });
  });

  it('should create the log file and append the 1st log', async () => {
    expect(fs.existsSync(logFile)).toBe(false);
    await logger.addLog('sample log');
    await expect(fs.promises.readFile(logFile, 'utf-8')).resolves.toEqual(
      expect.stringContaining('sample log'),
    );
    expect(consoleLogSpy).toHaveBeenCalledTimes(1);
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('sample log\n\n'));
  });

  it('should append the 2nd log', async () => {
    await logger.addLog('SAMPLE log 2');
    await expect(fs.promises.readFile(logFile, 'utf-8')).resolves.toEqual(
      expect.stringContaining('SAMPLE log 2'),
    );
    expect(consoleLogSpy).toHaveBeenCalledTimes(1);
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('SAMPLE log 2\n\n'));
  });

  it('should delete the log file', async () => {
    await logger.cleanLogFile();
    expect(fs.existsSync(logFile)).toBe(false);
  });
});
