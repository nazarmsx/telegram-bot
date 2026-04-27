/** Minimal Telegram Bot API client using native fetch (no request / form-data chain). */

const API_ROOT = "https://api.telegram.org";

export interface TelegramUser {
    id: number;
    language_code?: string;
}

export interface TelegramChat {
    id: number;
}

export interface TelegramContact {
    phone_number: string;
}

export interface TelegramMessage {
    message_id: number;
    chat: TelegramChat;
    from?: TelegramUser;
    text?: string;
    contact?: TelegramContact;
}

export interface CallbackQuery {
    id: string;
    from: TelegramUser;
    message?: TelegramMessage;
    data?: string;
}

export interface Update {
    update_id: number;
    message?: TelegramMessage;
    callback_query?: CallbackQuery;
}

export type ReplyMarkup =
    | {
          keyboard: { text: string; request_contact?: boolean }[][];
          resize_keyboard?: boolean;
      }
    | {
          inline_keyboard: { text: string; url?: string; callback_data?: string }[][];
      };

interface ApiResponse<T> {
    ok: boolean;
    result?: T;
    description?: string;
    error_code?: number;
}

export class TelegramFetchBot {
    private readonly baseUrl: string;

    constructor(token: string) {
        this.baseUrl = `${API_ROOT}/bot${token}`;
    }

    async callMethod<T>(method: string, body: Record<string, unknown>): Promise<T> {
        const res = await fetch(`${this.baseUrl}/${method}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        });
        const json = (await res.json()) as ApiResponse<T>;
        if (!json.ok) {
            throw new Error(json.description || `Telegram API error ${String(json.error_code)}`);
        }
        return json.result as T;
    }

    async getUpdates(params: { offset: number; limit: number; timeout: number }): Promise<Update[]> {
        return this.callMethod<Update[]>("getUpdates", {
            offset: params.offset,
            limit: params.limit,
            timeout: params.timeout,
            allowed_updates: ["message", "callback_query"]
        });
    }

    async sendMessage(
        chatId: string | number,
        text: string,
        options?: { reply_markup?: ReplyMarkup }
    ): Promise<void> {
        const body: Record<string, unknown> = {
            chat_id: chatId,
            text
        };
        if (options?.reply_markup) {
            body.reply_markup = options.reply_markup;
        }
        await this.callMethod("sendMessage", body);
    }

    async answerCallbackQuery(callbackQueryId: string): Promise<void> {
        await this.callMethod("answerCallbackQuery", { callback_query_id: callbackQueryId });
    }

    async deleteWebhook(): Promise<void> {
        await this.callMethod<boolean>("deleteWebhook", { drop_pending_updates: false });
    }
}
