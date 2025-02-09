import { Markup, Composer } from "telegraf";
import { AnimeDetail, User, UserLike } from "../utils/database";
import { Op } from "sequelize";

import type { IUserLikeList } from "../types/user";
import type { MyContext } from "../types/telegraf";
import { isCallbackQuery } from "../utils/message";

const composer = new Composer<MyContext>();

async function likeCmd(ctx: MyContext) {
  if (isCallbackQuery(ctx.callbackQuery)) await ctx.deleteMessage();
  const result = await UserLike.findAll({
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

  let json: IUserLikeList[] = result.map((v) => v.toJSON());

  if (json.length < 1)
    return ctx.reply(
      `Uhh maafin ga bisa nampilin list mu 😫\nKau ternyata belum punya anime yang kau suka, boleh ko berbagi sama kuro 😁😁`,
      Markup.inlineKeyboard([
        [Markup.button.callback("🎞 Jadwal Animek", "showScheduleAnimes")],
      ])
    );

  (ctx.session as { page: number }).page = 0;
  ctx.reply(
    `Anime yang kau like 🧡🧡\n\n${json
      .map((d, index) => `[${index + 1}]. ${d.AnimeDetail.title}`)
      .join("\n")}`,
    Markup.inlineKeyboard([
      [Markup.button.callback("🔍 Lihat semua", "getDetailAnime_like:show")],
      [Markup.button.callback("💢 Kembali", "backToMenu")],
    ])
  );
}

composer.hears("🧡 Aku Suka", likeCmd);
composer.action("backLikeHears", likeCmd);

export default composer;

function convertNumberToArray(n: number): string[][] {
  const result: string[][] = [];
  const arr = Array.from({ length: n }, (_, i) => `🧡 ${i + 1}`);
  for (let i = 0; i < arr.length; i += 6) {
    result.push(arr.slice(i, i + 6));
  }
  return result;
}
