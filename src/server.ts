process.on("unhandledRejection", (error) => {
  console.error("Unhandled Promise Rejection:", error);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
});

import express from "express";
import { bot } from "./bot";
import { CONFIG } from "./config";
import taskList from "./utils/cronTasks";

import type { Request, Response } from "express";

const app = express();
app.use(express.json());

app.use(bot.webhookCallback("/webhook"));

bot.telegram.setWebhook(`${CONFIG.WEBHOOK_URL}/webhook`);

app.get("/", (req: Request, res: Response) => {
  res.send("🤖 Bot Webhook is Active!");
});

app.listen(CONFIG.PORT, () => {
  console.log(`🚀 Run cuyy ${CONFIG.PORT}`);
});

taskList(bot);
