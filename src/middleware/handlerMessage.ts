import { NextFunction } from "express";
import { Context } from "telegraf";
import { CONFIG } from "../config";

export const handlerOwner = async (ctx: Context, next: NextFunction) => {
  let username = ctx.from!.username || "";
  if (username !== CONFIG.OWNER) return ctx.reply("Access denied!");
  next();
};
