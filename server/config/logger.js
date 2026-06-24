import winston from 'winston';

const winstonLogger = winston.createLogger({
  level: process.env.LOG_LEVEL ?? 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: process.env.NODE_ENV === 'production'
        ? winston.format.json()
        : winston.format.combine(
            winston.format.colorize(),
            winston.format.printf(({ timestamp, level, message, ...metadata }) => {
              let msg = `[${timestamp}] ${level}: ${message}`;
              if (Object.keys(metadata).length > 0) {
                msg += ` ${JSON.stringify(metadata)}`;
              }
              return msg;
            })
          )
    })
  ]
});

export const logger = {
  info: (arg1, arg2) => {
    if (typeof arg1 === 'object') {
      winstonLogger.info(arg2 ?? '', arg1);
    } else {
      winstonLogger.info(arg1);
    }
  },
  error: (arg1, arg2) => {
    if (typeof arg1 === 'object') {
      winstonLogger.error(arg2 ?? '', arg1);
    } else {
      winstonLogger.error(arg1);
    }
  },
  warn: (arg1, arg2) => {
    if (typeof arg1 === 'object') {
      winstonLogger.warn(arg2 ?? '', arg1);
    } else {
      winstonLogger.warn(arg1);
    }
  },
  debug: (arg1, arg2) => {
    if (typeof arg1 === 'object') {
      winstonLogger.debug(arg2 ?? '', arg1);
    } else {
      winstonLogger.debug(arg1);
    }
  },
  stream: {
    write: (message) => {
      winstonLogger.info(message.trim());
    }
  }
};