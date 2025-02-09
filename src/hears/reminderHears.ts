import { Markup, Composer } from "telegraf";
import { User, AnimeDetail, UserSchedule } from "../utils/database";
import { isCallbackQuery } from "../utils/message";
import { Op } from "sequelize";

import type { IUserScheduleList } from "../types/user";
import type { MyContext } from "../types/telegraf";

const composer = new Composer<MyContext>();

async function remindHears(ctx: MyContext) {
  if (isCallbackQuery(ctx.callbackQuery)) await ctx.deleteMessage();
  const result = await UserSchedule.findAll({
    include: [
      {
        model: User,
        where: { sender: { [Op.eq]: String(ctx.from!.id) } },
        required: true,
      },
      {
        model: AnimeDetail,
        required: true,
        attributes: ["id", "title", "key"],
      },
    ],
  });

  let json: IUserScheduleList[] = result.map((v) => v.toJSON());

  if (json.length < 1)
    return ctx.reply(
      `Sayang sekali kamu belum punya anime yang ingin ku ingetin, tapi tenang aja aku dah sedia in list nya kokk 😁😁`,
      Markup.inlineKeyboard([
        [Markup.button.callback("🎞 Jadwal Animek", "showScheduleAnimes")],
      ])
    );

  (ctx.session as { page: number }).page = 0;
  ctx.reply(
    `Akan ku ingatkan kau jika ada anime baru, sesuai list mu 🕐🕐\n\n${json
      .map((d, index) => `[${index + 1}]. ${d.AnimeDetail.title}`)
      .join("\n")}`,
    Markup.inlineKeyboard([
      [Markup.button.callback("🔍 Lihat Semua", "getDetailAnime_remind:show")],
      [Markup.button.callback("💢 Kembali", "backToMenu")],
    ])
  );
}

composer.hears("🕐 Ingatin", remindHears);
composer.action("backReminderHears", remindHears);

export default composer;

function convertNumberToArray(n: number): string[][] {
  const result: string[][] = [];
  const arr = Array.from({ length: n }, (_, i) => `🕐 ${i + 1}`);
  for (let i = 0; i < arr.length; i += 6) {
    result.push(arr.slice(i, i + 6));
  }
  return result;
}
