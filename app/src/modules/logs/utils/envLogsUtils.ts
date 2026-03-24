export interface LogLevelCounts {
  info: number;
  warn: number;
  error: number;
}

export function countLogLevels<T>(lines: T[], getLevel: (line: T) => string): LogLevelCounts {
  return lines.reduce<LogLevelCounts>(
    (acc, line) => {
      const level = getLevel(line).toUpperCase();
      if (level === 'INFO') {
        acc.info += 1;
      } else if (level === 'WARN' || level === 'WARNING') {
        acc.warn += 1;
      } else if (level === 'ERROR') {
        acc.error += 1;
      }
      return acc;
    },
    { info: 0, warn: 0, error: 0 },
  );
}
