import { createLogger, format, transports } from 'winston';

const logger = createLogger({
    level: process.env.NODE_ENV === "production" ? "error" : "debug",
    format: format.combine(
        format.timestamp(),
        format.printf(({ level, message, timestamp }) => `${String(timestamp)} ${level}: ${message}`)
    ),
    transports: [
        new transports.Console(),
        new transports.File({ filename: "debug.log", level: "debug" })
    ]
});

if (process.env.NODE_ENV !== 'production') {
    logger.debug("Logging initialized at debug level");
}

export default logger;
