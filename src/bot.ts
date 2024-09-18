import * as container from './container';
import {startBot} from "./bot-utils/TelegramBotController";
import {startViberBot} from "./bot-utils/ViberBotController";
import {startWhatsAppBot} from './bot-utils/WhatsAppBotController';
import {MONGODB_URI, VIBER_WEBHOOK} from "./util/secrets";
import mongoose from "mongoose";
container.default;
const mongoUrl = MONGODB_URI;
mongoose.Promise = global.Promise;

mongoose.connect(mongoUrl, {useNewUrlParser: true, useCreateIndex: true, useFindAndModify: true,}).then(
    () => {
        startBot();
        if(VIBER_WEBHOOK){
            startViberBot();
        }
        // startWhatsAppBot();
        mongoose.set('debug', true);
    },
).catch(err => {
    console.log("MongoDB connection error. Please make sure MongoDB is running. " + err);
});


process.on('unhandledRejection', err => {
    console.log("Caught unhandledRejection");
    console.error(err)
});