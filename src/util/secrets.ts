import logger from "./logger";
import dotenv from "dotenv";

export const ENVIRONMENT = process.env.NODE_ENV || 'development';
const path = `.env.${ENVIRONMENT}`;
const envResult = dotenv.config({path});

if (envResult.error) {
    console.error(`[ERROR] env failed to load: ${envResult.error}`);
    process.exit(1);
}

const prod = ENVIRONMENT === "production"; // Anything else is treated as 'dev'

export const MONGODB_URI = prod ? process.env["MONGODB_URI"] : process.env["MONGODB_URI_LOCAL"];
export const TELEGRAM_BOT_API_KEY = process.env["TELEGRAM_BOT_API_KEY"];
export const REGION = process.env["REGION"];
export const VIBER_BOT_API_KEY = process.env["VIBER_BOT_API_KEY"];
export const EXTERNAL_API = process.env["EXTERNAL_API"];
export const VIBER_WEBHOOK = process.env["VIBER_WEBHOOK"];
export const VIBER_HTTP_PORT = process.env["VIBER_HTTP_PORT"];

if (!MONGODB_URI) {
    if (prod) {
        logger.error("No mongo connection string. Set MONGODB_URI environment variable.");
    } else {
        logger.error("No mongo connection string. Set MONGODB_URI_LOCAL environment variable.");
    }
    process.exit(1);
}
