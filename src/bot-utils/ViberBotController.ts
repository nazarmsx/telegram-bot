import "reflect-metadata";
import {container} from "tsyringe";
import {UserService} from "../services";
import {BotController} from './BotController';
import {FlowStep} from './BotFlow';
import {MessageRegistry, Lang} from './MessageRegistry';
import {VIBER_BOT_API_KEY, REGION, VIBER_HTTP_PORT, VIBER_WEBHOOK} from '../util/secrets'
import {getPublicUrl} from '../util'
import http from 'http';
// @ts-ignore
import {Bot, Events, Message} from 'viber-bot';
import logger from "../util/logger";
import {IUser} from "../models";
import to from "await-to-js";
import axios from "axios";

const port = VIBER_HTTP_PORT;

const userService = container.resolve(UserService);
const botController = container.resolve(BotController);
const messageRegistry = container.resolve(MessageRegistry);

const bot = new Bot({
    authToken: VIBER_BOT_API_KEY,
    name: 'Test Kyiv bot',
    avatar: "http://viber.com/avatar.jpg"
});
bot.on(Events.MESSAGE_RECEIVED, async (message: any, response: any) => {
    const chatId = response.userProfile.id;
    let user = await userService.findUserByChatId(chatId);
    if(!user){
        await botController.start(chatId, 'viber');
        user = await userService.findUserByChatId(chatId);
    }
    if (user && user.stepId === null && !message.text.startsWith('callbackQuery_')) {
        return start(message, response, false);
    }
    if (message.text && message.text.startsWith('http')) {
        return;
    }
    if (message.text === 'start' || message.text === 'restart') {
        return start(message, response, true);
    }
    if (message instanceof Message.Contact) {
        return await handleContactMessage(message, response);
    }
    if (message.text.startsWith('callbackQuery_')) {
        await handleCallbackQuery(message, response);
    } else {
        await handleText(message, response);
    }
});


export async function startViberBot() {
    let publicUrl: string = VIBER_WEBHOOK;
    if(!publicUrl){
        let [err, ngRockProxyUrl] = await to(getPublicUrl());
        if (err) {
            console.log('Can not connect to ngrok server. Is it running?');
            logger.error(err);
            return
        }
        publicUrl = ngRockProxyUrl
    }
console.log(publicUrl)
    if (publicUrl) {
        http.createServer(bot.middleware()).listen(port, () => bot.setWebhook(publicUrl));
    }
}

function buildKeyBoard(step: FlowStep, lang: string) {
    if (step.key === 'getPhoneNumber') {
        return buildAskContactKeyboard(step, lang);
    }
    if (!step.buttons) {
        step.buttons = [];
    }

    const columnsNumberMapper: any = {
        '1': 6,
        '2': 3,
        '3': 2,
        '4': 1,
    };
    let buttons: any = step.buttons.map((btn) => {
        const text = messageRegistry.getTranslations(lang)[btn.key] ? messageRegistry.getTranslations(lang)[btn.key] : btn.key;
        if (btn.url) {
            return {
                "Columns": 6,
                "ActionType": 'open-url',
                "ActionBody": btn.url,
                "Text": text,
                "TextSize": "regular",
                "ReplyType": "query"
            };
        }
        return {
            "Columns": columnsNumberMapper[step.buttons.length] ? columnsNumberMapper[step.buttons.length] : 2,
            "ActionType": "reply",
            "ActionBody": `callbackQuery_${step.key}=${btn.value}`,
            "Text": text,
            "TextSize": "regular",
            "ReplyType": "query"
        };
    });
    buttons = buttons.concat(getRestartBtn(step, lang));
    return {
        "Type": "keyboard",
        "Buttons": buttons
    };
}

async function askNextQuestion(chatId: string, response: any) {
    const [nextStep, user] = await Promise.all([botController.getNextStep(chatId), userService.findUserByChatId(chatId)]);
    const messageText = messageRegistry.getTranslations(user.lang)[nextStep.key];
    const options = Object.assign({}, buildKeyBoard(nextStep, user.lang));
    if (nextStep.isLast) {
        await sendFinalMessage(user, nextStep, response);
    }
    response.send(new Message.Text(messageText, options, undefined, null, null, 7));
}

function buildAskContactKeyboard(step: FlowStep, lang: string) {
    return {
        "Type": "keyboard",
        "Buttons": [
            {
                "Columns": 6,
                "Rows": 1,
                "ActionType": 'share-phone',
                "ActionBody": '',
                "TextSize": "regular",
                "ReplyType": "query",
                "Text": messageRegistry.getTranslations(lang).sharePhoneNumberViber
            },
            getRestartBtn(step, lang)
        ]
    };
}

async function handleCallbackQuery(message: any, response: any) {
    const chatId = response.userProfile.id;
    const text = message.text.replace('callbackQuery_', '');
    const currentStep = await botController.getNextStep(chatId);
    if (currentStep.buttons) {
        const values = currentStep.buttons.map((btn) => {
            return `${currentStep.key}=${btn.value}`
        });
        if (values.indexOf(text) !== -1) {
            await botController.saveStep(chatId, text.replace(`${currentStep.key}=`, ''));
            await askNextQuestion(chatId, response);
        }
    }
}

bot.on(Events.CONVERSATION_STARTED, async (response: any, isSubscribed: any, context: any, onFinish: any) => {
    const chatId = response.userProfile.id;
    const language = messageRegistry.isLanguageSupported(response.userProfile.language) ? response.userProfile.language : 'en';
    const regionName = messageRegistry.getTranslations(language)[REGION === 'kyiv' ? 'boryspil' : REGION];
    const user = await userService.findUserByChatId(chatId);
    if (user) {
        await userService.resetUserProfile(chatId, {
            chatId,
            region: REGION,
            lang: language,
        });
    }
    const greetingText = messageRegistry.getGreetingMessage(language, regionName);
    await to(response.send(new Message.Text(greetingText + '\n' + messageRegistry.getTranslations(language).sendMessageToStart, undefined, null, null, 7)));
});


async function start(message: any, response: any, sendGreetingMessage: boolean) {
    try {
        const chatId = response.userProfile.id;
        const language = messageRegistry.isLanguageSupported(response.userProfile.language) ? response.userProfile.language : 'en';
        if (sendGreetingMessage) {
            const regionName = messageRegistry.getTranslations(language)[REGION === 'kyiv' ? 'boryspil' : REGION];
            const greetingText = messageRegistry.getGreetingMessage(language, regionName);
            await response.send(new Message.Text(greetingText));
        }
        const user = await userService.findUserByChatId(chatId);
        if (user) {
            await userService.resetUserProfile(chatId, {
                chatId,
                region: REGION,
                lang: language,
                messenger: 'viber'
            });
        }
        await botController.start(chatId, 'viber');
        await askNextQuestion(chatId, response);
    } catch (e) {
        console.error(e);
    }
}

async function handleText(message: any, response: any) {
    const chatId = response.userProfile.id;
    await botController.saveStep(chatId, message.text);
    await askNextQuestion(chatId, response);
}

async function handleContactMessage(message: any, response: any) {
    const chatId = response.userProfile.id;
    const user = await userService.findUserByChatId(chatId);
    await botController.saveStep(chatId, '+' + message.contactPhoneNumber);
    await askNextQuestion(chatId, response);
}

async function sendFinalMessage(user: IUser, step: FlowStep, response: any) {
    await response.send(new Message.Text(messageRegistry.getTranslations(user.lang).finalMessage, {
        "Type": "keyboard",
        "Buttons": [
            getRestartBtn(step, user.lang)
        ]
    }, undefined, null, null, 7));
}


function getRestartBtn(step: FlowStep, lang: string) {
    return {
        "Columns": 6,
        "Rows": 1,
        "ActionType": "reply",
        "ActionBody": `restart`,
        "Text": step.isLast ? messageRegistry.getTranslations(lang).newRequest : messageRegistry.getTranslations(lang).startFromBeginning,
        "TextSize": "regular",
        "ReplyType": "query"
    }
}