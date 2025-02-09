import type { Context } from "telegraf";
import { isCallbackQuery, isTextMessage } from "../utils/message";
import { NextFunction } from "express";
import { currentDate } from "../utils/date";

export const loggerMiddleware = async (ctx: Context, next: NextFunction) => {
  console.log(
    `[${currentDate()}] ${ctx.from!.username}: ${
      isTextMessage(ctx.message)
        ? ctx.message?.text
        : isCallbackQuery(ctx.message)
        ? ctx.message.data
        : ""
    }`
  );
  next();
};
