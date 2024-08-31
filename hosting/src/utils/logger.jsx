import { createLogger, transports, format } from 'winston';

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), // Custom timestamp format for better readability
    format.errors({ stack: true }), // Include stack trace in case of errors
    format.splat(), // Support for string interpolation
    format.printf(({ timestamp, level, message, ...meta }) => {
      // Stringify metadata nicely if it exists
      const metaString = Object.keys(meta).length ? ` | Meta: ${JSON.stringify(meta, null, 2)}` : '';
      return `${timestamp} [${level.toUpperCase()}]: ${message}${metaString}`;
    })
  ),
  transports: [
    new transports.Console(),
    new transports.File({ filename: 'combined.log', level: 'info' }) // Ensure file transport is set properly
  ],
});

export default logger;