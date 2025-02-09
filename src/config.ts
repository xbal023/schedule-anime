import dotenv from "dotenv";

dotenv.config();

export const CONFIG = {
  BOT_TOKEN: process.env.BOT_TOKEN as string,
  WEBHOOK_URL: process.env.WEBHOOK_URL as string,
  PORT: Number(process.env.PORT) || 3000,
  IS_PROD: Boolean(process.env.NODE_ENV === "production"),
  OWNER: process.env.OWNER as string,
  DB_NAME: process.env.DB_NAME as string,
  USERNAME_DB: process.env.USERNAME_DB as string,
  PASSWORD_DB: process.env.PASSWORD_DB as string,
};
