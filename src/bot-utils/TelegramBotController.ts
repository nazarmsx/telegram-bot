import "reflect-metadata";
import Telebot from 'telebot';
import {container} from "tsyringe";
import {UserService} from "../services";
import {BotController} from './BotController';
import {FlowStep} from './BotFlow';
import {MessageRegistry} from './MessageRegistry';
import { TELEGRAM_BOT_API_KEY, REGION } from '../util/secrets'
import moment from "moment";

const userService = container.resolve(UserService);
const botController = container.resolve(BotController);
const messageRegistry = container.resolve(MessageRegistry);

const BUTTONS: any = {
    restart_en: {
        label: messageRegistry.getTranslations('en').startFromBeginning,
        command: '/start'
    },
    restart_ru: {
        label: messageRegistry.getTranslations('ru').startFromBeginning,
        command: '/start'
    },
    restart_uk: {
        label: messageRegistry.getTranslations('uk').startFromBeginning,
        command: '/start'
    },
    start_en: {
        label: messageRegistry.getTranslations('en').newRequest,
        command: '/start'
    },
    start_ru: {
        label: messageRegistry.getTranslations('ru').newRequest,
        command: '/start'
    },
    start_uk: {
        label: messageRegistry.getTranslations('uk').newRequest,
        command: '/start'
    }
};

const bot = new Telebot({
    token: TELEGRAM_BOT_API_KEY,
    usePlugins: ['namedButtons'],
    polling: {
        interval: 1000,
        timeout: 0,
        limit: 100,
        retryTimeout: 5000,
    },pluginConfig: {
        namedButtons: {
            buttons: BUTTONS
        }
    }
});

bot.on(['/start'], async (msg) => {
    try {
        const chatId = msg.chat.id;
        const language = messageRegistry.isLanguageSupported(msg.from.language_code) ? msg.from.language_code : 'en';
        let replyMarkup = bot.keyboard([
            [BUTTONS[`restart_${language}`].label],
        ], {resize: true});
        const regionName  = messageRegistry.getTranslations(language)[REGION === 'kyiv'? 'boryspil' : REGION];
        const greetingText = messageRegistry.getGreetingMessage(language,regionName);
        await bot.sendMessage(chatId, greetingText, {replyMarkup});
        const user = await userService.findUserByChatId(chatId);
        if(user){
            await userService.updateUser(chatId, {
                chatId, region: REGION, messenger: 'telegram', lang: language, stepId: null,
                name: null, gender: null,birthDate: null,email: null,
                phoneNumber: null, testDate: null, testPurpose: null, phoneNumberIsRegisteredInDiia: null,testType: null, lastMessageId: null,
            });
        }
        await botController.start(chatId, 'telegram');
        await askNextQuestion(chatId);
    } catch (e) {
        console.error(e);
    }

});

bot.on('text', async (msg) => {
    const chatId = msg.chat.id;
    if (!msg.text.startsWith('/') && !messageRegistry.isCommandName(msg.text) ) {
        const currentStep = await botController.getNextStep(chatId);
        if (currentStep.key === 'getPhoneNumber') {
            return await handlePhoneNumberSet(msg, msg.text);
        }
        if (currentStep.type === 'date' && !moment(msg.text, 'DD-MM-YYYY').isValid()) {
            const user = await userService.findUserByChatId(chatId);
            await bot.sendMessage(chatId, messageRegistry.getTranslations(user.lang).wrongDateFormat, {});
            return await askNextQuestion(chatId);
        }
        await botController.saveStep(chatId, msg.text);
        await askNextQuestion(chatId);
        return;
    }
});

bot.on('contact', async (msg) => {
    await handlePhoneNumberSet(msg, msg.contact.phone_number)
});

bot.on('/profile', async (msg) => {
    const chatId = msg.chat.id;
    const user = await userService.findUserByChatId(chatId);
    bot.sendMessage(chatId, JSON.stringify(user, null, 4));
});
bot.on('callbackQuery', async (msg) => {
    const chatId = msg.message.chat.id;
    const currentStep = await botController.getNextStep(chatId);
    if (currentStep.key === 'getLanguage') {
        await handleLanguageChange(msg, msg.data.replace(`${currentStep.key}=`, ''));
    }
    if (currentStep.buttons) {
        const values = currentStep.buttons.map((btn) => {
            return `${currentStep.key}=${btn.value}`
        });
        if (values.indexOf(msg.data) !== -1) {
            await botController.saveStep(chatId, msg.data.replace(`${currentStep.key}=`, ''));
            await askNextQuestion(chatId);
        }
    }
    bot.answerCallbackQuery(msg.id);
});

async function askNextQuestion(chatId: string) {
    const [nextStep, user] = await Promise.all([botController.getNextStep(chatId), userService.findUserByChatId(chatId)]);
    if (nextStep.isLast) {
        let replyMarkup = bot.keyboard([
            [BUTTONS[`start_${user.lang}`].label],
        ], {resize: true});
        await bot.sendMessage(chatId, messageRegistry.getTranslations(user.lang).finalMessage, {replyMarkup});
    }
    const messageText = messageRegistry.getTranslations(user.lang)[nextStep.key];
    const options: any = {};
    if (nextStep.buttons) {
        options.replyMarkup = buildInlineKeyBoard(nextStep, user.lang);
    }
    await bot.sendMessage(chatId, messageText, options);
}

function buildInlineKeyBoard(step: FlowStep, lang: string) {
    if (step.key === 'getPhoneNumber') {
        return  buildAskContactKeyboard(step, lang);
    }
    const buttons = step.buttons.map((btn) => {
        const text = messageRegistry.getTranslations(lang)[btn.key] ? messageRegistry.getTranslations(lang)[btn.key] : btn.key;
        if(btn.url){
            return bot.inlineButton(text, {url: btn.url })
        }
        return bot.inlineButton(text, {callback: `${step.key}=${btn.value}`})
    });
    if (step.btnSeparateRow) {
        return bot.inlineKeyboard(buttons.map((btn) => {
            return [btn]
        }));
    }
    return bot.inlineKeyboard([buttons]);
}

function buildAskContactKeyboard(step: FlowStep, lang: string) {
    const text = messageRegistry.getTranslations(lang)[step.key] ? messageRegistry.getTranslations(lang).sharePhoneNumber : step.key;
    return bot.keyboard([
        [bot.button('contact', text)]
    ], {resize: true});
}

async function handleLanguageChange(msg: any, lang: string) {
    const chatId = msg.message.chat.id;
    let replyMarkup = bot.keyboard([
        [BUTTONS[`restart_${lang}`].label],
    ], {resize: true});
    await bot.sendMessage(chatId, messageRegistry.getTranslations(lang).languageChangedMsg, {replyMarkup});
}

async function handlePhoneNumberSet(msg: any, phone_number: string) {
    const chatId = msg.chat.id;
    const user =  await userService.findUserByChatId(chatId);
    await botController.saveStep(chatId, phone_number);
    let replyMarkup = bot.keyboard([
        [BUTTONS[`restart_${user.lang}`].label],
    ], {resize: true});
    await bot.sendMessage(chatId, messageRegistry.getTranslations(user.lang).phoneNumberSaved, {replyMarkup});
    await askNextQuestion(chatId);
}

export function startBot() {
    bot.connect();
}
