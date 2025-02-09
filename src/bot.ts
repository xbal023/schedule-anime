import { session, Telegraf } from "telegraf";
import { CONFIG } from "./config";
import { loggerMiddleware } from "./middleware/logger";
import composer from "./middleware/composer";
import { MyContext } from "./types/telegraf";

export const bot = new Telegraf<MyContext>(CONFIG.BOT_TOKEN);

bot.use(loggerMiddleware);

bot.use(session());
bot.use(composer.middleware());

bot.launch((): void => {
  console.log("🐱‍👤 Bot Telegram is now launced!");
});
