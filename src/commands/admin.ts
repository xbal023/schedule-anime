import { Composer } from "telegraf";
import type { Context } from "telegraf";
import { User } from "../utils/database";
import { isTextMessage } from "../utils/message";
import { handlerOwner } from "../middleware/handlerMessage";

const composer = new Composer();

composer.command("bc", handlerOwner, async (ctx: Context) => {
  if (!isTextMessage(ctx.message)) return;
  let text = ctx.message!.text;
  if (!text) return ctx.reply("example: /bc text");
  text = text.split(" ").slice(1).join(" ");
  const users = await User.findAll({ attributes: ["sender"] });
  const senders: string[] = users.map((d) => d.sender);
  await ctx.reply(`Tunggu sebentar mengirim ke ${senders.length} orang`);
  let jobs = [];
  await Promise.all(
    senders.map(async (sender) => {
      await ctx.telegram.sendMessage(sender, text).then((s) => {
        jobs.push(true);
      });
    })
  );
  await ctx.reply(`Terkirim ke ${jobs.length} orang`);
});
