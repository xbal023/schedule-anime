import { Markup, Composer } from "telegraf";
import type { MyContext } from "../types/telegraf";

const composer = new Composer<MyContext>();

async function scheduleCmd(ctx: MyContext) {
  (ctx.session as { page: number }).page = 0;
  if (ctx.callbackQuery && "data" in ctx.callbackQuery)
    await ctx.deleteMessage();
  ctx.reply(
    "Di otaku desu tiap hari nya ada anime yang release eps nya, apa kamu mau liatt? 😜😜",
    Markup.inlineKeyboard([
      [
        Markup.button.callback("Senin", "getDaySchedule_Senin"),
        Markup.button.callback("Selasa", "getDaySchedule_Selasa"),
        Markup.button.callback("Rabu", "getDaySchedule_Rabu"),
      ],
      [
        Markup.button.callback("Kamis", "getDaySchedule_Kamis"),
        Markup.button.callback("Jumat", "getDaySchedule_Jumat"),
        Markup.button.callback("Sabtu", "getDaySchedule_Sabtu"),
      ],
      [Markup.button.callback("Minggu", "getDaySchedule_Minggu")],
    ])
  );
}

composer.hears("🎞 Jadwal", scheduleCmd);
composer.action("showScheduleAnimes", scheduleCmd);

export default composer;
