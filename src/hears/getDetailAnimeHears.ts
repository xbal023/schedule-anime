import { Markup, Composer, Input } from "telegraf";
import { Op } from "sequelize";
import { AnimeDetail, User, UserLike, UserSchedule } from "../utils/database";
import { isCallbackQuery } from "../utils/message";
import { currentDate } from "../utils/date";
import { downloadImage } from "../utils/getBuffer";

import type {
  IUserLikeCreation,
  IUserLikeList,
  IUserScheduleList,
} from "../types/user";
import type { Includeable } from "sequelize";
import type { MyContext } from "../types/telegraf";

const composer = new Composer<MyContext>();

let pageSize = 1;

async function detailAnime(ctx: MyContext) {
  if (!isCallbackQuery(ctx.callbackQuery)) return;

  let [_, select] = ctx.callbackQuery!.data.split("_");
  let [dataSelect, actionSelect] = select.split(":");

  let isData = /(like|remind)/g.test(dataSelect) ? true : false;
  let isAction = /(next|prev|show|delete)/g.test(actionSelect) ? true : false;

  if (isData) {
    ctx.session = ctx.session ?? { page: 0 };
    (ctx.session as { page: number }).page ?? 0;

    let page = (ctx.session as { page: number }).page;

    let isDataLike = dataSelect === "like";
    let isDataRemind = dataSelect === "remind";
    let isActionShow = actionSelect === "show";
    let isActionNextPrev = ["next", "prev"].includes(actionSelect);

    if (isAction) {
      if (isActionShow) await ctx.deleteMessage();

      const totalAnime: number = await (isDataLike
        ? UserLike
        : UserSchedule
      ).count();
      const totalPages = Math.ceil(totalAnime / pageSize);
      if (page < 0) page = 0;
      if (actionSelect === "next") page++;
      if (page >= totalPages)
        return ctx.answerCbQuery("Sudah mentok!", { show_alert: true });
      if (actionSelect === "prev") page--;
      if (page < 0)
        return ctx.answerCbQuery("Sudah halaman pertama!", {
          show_alert: true,
        });
      (ctx.session as { page: number }).page = page;

      let result: UserLike | UserSchedule | null = null;

      const include: Includeable[] = [
        {
          model: User,
          where: { sender: { [Op.eq]: String(ctx.from!.id) } },
          required: true,
        },
        {
          model: AnimeDetail,
          required: true,
          as: "AnimeDetail",
        },
      ];
      if (isDataLike) {
        result = await UserLike.findOne({
          include,
          offset: page,
        });
      } else if (isDataRemind) {
        result = await UserSchedule.findOne({
          include,
          offset: page,
        });
      }

      if (!result) {
        return ctx.reply(
          `Maaf, sepertinya data tidak ditemukan. 😣\nJika terlalu banyak pesan ini dari Kuro, tolong beri tahu CS Kuro yahh 🤗`
        );
      }

      const animeResult = result as (UserLike | UserSchedule) & {
        AnimeDetail: AnimeDetail;
      };
      if (actionSelect == "delete") {
        await result.destroy();
        (ctx.session as { page: number }).page = 0;
        return await ctx.answerCbQuery(
          `Berhasil menghapus anime tersebut dari dalam daftar ${dataSelect}`,
          { show_alert: true }
        );
      }

      const data = Input.fromBuffer(
        (await downloadImage(animeResult.AnimeDetail.image!))!
      );
      let inlineKeyboard = Markup.inlineKeyboard([
        [
          Markup.button.callback("⬅", `getDetailAnime_${dataSelect}:prev`),
          Markup.button.callback(
            isDataLike ? "💔" : isDataRemind ? "🗑" : "",
            `getDetailAnime_${dataSelect}:delete`
          ),
          Markup.button.callback("➡", `getDetailAnime_${dataSelect}:next`),
        ],
        [
          Markup.button.callback(
            "💢 kembali",
            isDataLike
              ? "backLikeHears"
              : isDataRemind
              ? "backReminderHears"
              : ""
          ),
          Markup.button.url(
            "🔍 Kunjungi",
            `https://otakudesu.cloud/anime/${animeResult.AnimeDetail.key}`
          ),
        ],
      ]);

      let caption = `╭─────────────✧
┊ ■ Judul : ${animeResult.AnimeDetail.title}
┊ ■ Japanese : ${animeResult.AnimeDetail.japanese}
┊ ■ Status : ${animeResult.AnimeDetail.status}
┊ ■ Skor : ${animeResult.AnimeDetail.score}
┊ ■ Type : ${animeResult.AnimeDetail.type}
┊ ■ Durasi : ${animeResult.AnimeDetail.duration}
┊ ■ Genre : ${animeResult.AnimeDetail.genres}
╰─────────────✧`;
      if (isActionNextPrev) {
        await ctx.editMessageMedia(
          {
            type: "photo",
            media: data,
            caption,
          },
          inlineKeyboard
        );
      } else {
        await ctx.replyWithPhoto(data, { caption, ...inlineKeyboard });
      }
    } else {
      await ctx.deleteMessage();
    }
  }
}

composer.action(/getDetailAnime/g, detailAnime);

export default composer;
