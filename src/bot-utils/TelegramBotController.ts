import 'reflect-metadata';
import moment from 'moment';
import { container } from 'tsyringe';
import { UserService } from "../services";
import { BotController } from './BotController';
import { FlowStep } from './BotFlow';
import { MessageRegistry, Lang } from './MessageRegistry';
import { TELEGRAM_BOT_API_KEY, REGION } from '../util/secrets';
import {
    TelegramFetchBot,
    type TelegramMessage,
    type CallbackQuery,
    type Update,
    type ReplyMarkup
} from './telegramFetchClient';

const userService = container.resolve(UserService);
const botController = container.resolve(BotController);
const messageRegistry = container.resolve(MessageRegistry);

const BUTTONS: Record<string, { label: string; command: string }> = {
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

let api!: TelegramFetchBot;

function buildReplyKeyboard(labels: string[][], opts?: { resize?: boolean }): ReplyMarkup {
    return {
        keyboard: labels.map((row) => row.map((text) => ({ text }))),
        resize_keyboard: opts?.resize ?? false
    };
}

function buildInlineKeyboard(
    rows: { text: string; url?: string; callback_data?: string }[][]
): ReplyMarkup {
    return { inline_keyboard: rows };
}

function buildAskContactKeyboard(step: FlowStep, lang: string): ReplyMarkup {
    const text = messageRegistry.getTranslations(lang)[step.key]
        ? messageRegistry.getTranslations(lang).sharePhoneNumber
        : step.key;
    return {
        keyboard: [[{ text, request_contact: true }]],
        resize_keyboard: true
    };
}

function buildInlineKeyBoard(step: FlowStep, lang: string): ReplyMarkup {
    if (step.key === 'getPhoneNumber') {
        return buildAskContactKeyboard(step, lang);
    }
    const buttons = step.buttons.map((btn) => {
        const t = messageRegistry.getTranslations(lang)[btn.key]
            ? messageRegistry.getTranslations(lang)[btn.key]
            : btn.key;
        if (btn.url) {
            return { text: t, url: btn.url };
        }
        return { text: t, callback_data: `${step.key}=${btn.value}` };
    });
    if (step.btnSeparateRow) {
        return buildInlineKeyboard(buttons.map((btn) => [btn]));
    }
    return buildInlineKeyboard([buttons]);
}

async function askNextQuestion(chatId: string) {
    const [nextStep, user] = await Promise.all([
        botController.getNextStep(chatId),
        userService.findUserByChatId(chatId)
    ]);
    if (nextStep.isLast) {
        const replyMarkup = buildReplyKeyboard(
            [[BUTTONS[`start_${user.lang}`].label]],
            { resize: true }
        );
        await api.sendMessage(chatId, messageRegistry.getTranslations(user.lang).finalMessage, {
            reply_markup: replyMarkup
        });
    }

    const messageText = messageRegistry.getTranslations(user.lang)[nextStep.key];
    const options: { reply_markup?: ReplyMarkup } = {};
    if (nextStep.buttons) {
        options.reply_markup = buildInlineKeyBoard(nextStep, user.lang);
    }

    await api.sendMessage(chatId, messageText, options);
}

async function handleLanguageChange(chatId: string, lang: string) {
    const replyMarkup = buildReplyKeyboard([[BUTTONS[`restart_${lang}`].label]], { resize: true });
    await api.sendMessage(chatId, messageRegistry.getTranslations(lang).languageChangedMsg, {
        reply_markup: replyMarkup
    });
}

async function handlePhoneNumberSet(msg: TelegramMessage, phone_number: string) {
    const chatId = String(msg.chat.id);
    const user = await userService.findUserByChatId(chatId);
    await botController.saveStep(chatId, phone_number);
    const replyMarkup = buildReplyKeyboard([[BUTTONS[`restart_${user.lang}`].label]], { resize: true });
    await api.sendMessage(chatId, messageRegistry.getTranslations(user.lang).phoneNumberSaved, {
        reply_markup: replyMarkup
    });
    await askNextQuestion(chatId);
}

async function handleStart(msg: TelegramMessage): Promise<void> {
    try {
        const chatId = String(msg.chat.id);
        const language = messageRegistry.isLanguageSupported(msg.from?.language_code)
            ? msg.from!.language_code!
            : 'en';
        const replyMarkup = buildReplyKeyboard([[BUTTONS[`restart_${language}`].label]], { resize: true });
        const regionName = messageRegistry.getTranslations(language)[REGION === 'kyiv' ? 'boryspil' : REGION];
        const greetingText = messageRegistry.getGreetingMessage(language as Lang, regionName);
        await api.sendMessage(chatId, greetingText, { reply_markup: replyMarkup });
        const user = await userService.findUserByChatId(chatId);
        if (user) {
            await userService.updateUser(chatId, {
                chatId,
                region: REGION,
                messenger: 'telegram',
                lang: language,
                stepId: null,
                name: null,
                gender: null,
                birthDate: null,
                email: null,
                phoneNumber: null,
                testDate: null,
                testPurpose: null,
                phoneNumberIsRegisteredInDiia: null,
                testType: null,
                lastMessageId: null
            });
        }

        await botController.start(chatId, 'telegram');
        await askNextQuestion(chatId);
    } catch (e) {
        console.error(e);
    }
}

async function handleProfile(msg: TelegramMessage): Promise<void> {
    const chatId = String(msg.chat.id);
    const user = await userService.findUserByChatId(chatId);
    await api.sendMessage(chatId, JSON.stringify(user, null, 4));
}

async function handleCallbackQuery(query: CallbackQuery): Promise<void> {
    const data = query.data;
    if (data === undefined || data === null || !query.message) {
        return;
    }
    const chatId = String(query.message.chat.id);
    const currentStep = await botController.getNextStep(chatId);
    if (currentStep.key === 'getLanguage') {
        await handleLanguageChange(chatId, data.replace(`${currentStep.key}=`, ''));
    }

    if (currentStep.buttons) {
        const values = currentStep.buttons.map((btn) => `${currentStep.key}=${btn.value}`);
        if (values.indexOf(data) !== -1) {
            await botController.saveStep(chatId, data.replace(`${currentStep.key}=`, ''));
            await askNextQuestion(chatId);
        }
    }
    await api.answerCallbackQuery(query.id);
}

async function handleGenericMessage(msg: TelegramMessage): Promise<void> {
    if (msg.contact) {
        await handlePhoneNumberSet(msg, msg.contact.phone_number);
        return;
    }
    const text = msg.text;
    if (!text || text.startsWith('/') || messageRegistry.isCommandName(text)) {
        return;
    }
    const chatId = String(msg.chat.id);
    const currentStep = await botController.getNextStep(chatId);
    if (currentStep.key === 'getPhoneNumber') {
        await handlePhoneNumberSet(msg, text);
        return;
    }

    if (currentStep.type === 'date' && !moment(text, 'DD-MM-YYYY').isValid()) {
        const user = await userService.findUserByChatId(chatId);
        await api.sendMessage(chatId, messageRegistry.getTranslations(user.lang).wrongDateFormat);
        await askNextQuestion(chatId);
        return;
    }

    await botController.saveStep(chatId, text);
    await askNextQuestion(chatId);
}

function isStartCommand(text: string): boolean {
    return /^\/start(?:@\w+)?(?:\s|$)/i.test(text.trim());
}

function isProfileCommand(text: string): boolean {
    return /^\/profile(?:@\w+)?(?:\s|$)/i.test(text.trim());
}

async function dispatchUpdate(update: Update): Promise<void> {
    if (update.callback_query) {
        await handleCallbackQuery(update.callback_query);
        return;
    }
    const msg = update.message;
    if (!msg) {
        return;
    }
    const text = msg.text?.trim() ?? '';
    if (text && isStartCommand(text)) {
        await handleStart(msg);
        return;
    }
    if (text && isProfileCommand(text)) {
        await handleProfile(msg);
        return;
    }
    await handleGenericMessage(msg);
}

async function pollForever(): Promise<void> {
    let offset = 0;
    const limit = 100;
    const timeout = 30;
    for (;;) {
        try {
            const updates = await api.getUpdates({ offset, limit, timeout });
            for (const u of updates) {
                offset = u.update_id + 1;
                await dispatchUpdate(u).catch((err) => console.error("Telegram dispatch error:", err));
            }
        } catch (err) {
            console.error("Telegram getUpdates error:", err);
            await new Promise((r) => setTimeout(r, 3000));
        }
    }
}

export function startBot(): void {
    api = new TelegramFetchBot(TELEGRAM_BOT_API_KEY);
    void (async () => {
        try {
            await api.deleteWebhook();
        } catch (e) {
            console.error("Telegram deleteWebhook:", e);
        }
        await pollForever();
    })().catch((err) => console.error("Telegram polling fatal:", err));
}
