import * as container from './container';
import { startBot } from "./bot-utils/TelegramBotController";
import { startViberBot } from "./bot-utils/ViberBotController";
import { MONGODB_URI, VIBER_WEBHOOK } from "./util/secrets";
import mongoose from 'mongoose';
import logger from './util/logger';

container.default;
const mongoUrl = MONGODB_URI;

mongoose.connect(mongoUrl).then(
    () => {
        startBot();
        if (VIBER_WEBHOOK) {
            startViberBot();
        }

        mongoose.set('debug', true);
    },
).catch((err) => {
    logger.error("MongoDB connection error. Please make sure MongoDB is running. " + err);
});


process.on('unhandledRejection', err => {
    logger.error("Caught unhandledRejection");
    logger.error(err);
});