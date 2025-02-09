import { Markup, Composer, Input } from "telegraf";
import { AnimeDatabase, AnimeDetail } from "../utils/database";
import { downloadImage } from "../utils/getBuffer";
import { currentDate } from "../utils/date";
import { isCallbackQuery, isTextMessage } from "../utils/message";

import type { IAnimeDatabase, IAnimeDetail } from "../types/otaku";
import type { MyContext } from "../types/telegraf";

const composer = new Composer<MyContext>();
let pageSize = 1;

async function ongoing(ctx: MyContext) {
  let textQuery: string = "";
  if (isCallbackQuery(ctx.callbackQuery)) {
    textQuery = ctx.callbackQuery.data;
  } else if (isTextMessage(ctx.message)) {
    textQuery = ctx.message!.text;
  }

  let [_, actionSelect]: string[] = textQuery.split("_");

  let isAction =
    /(PageAnimeGoing)/g.test(_) || /(next|prev|back)/g.test(actionSelect)
      ? true
      : false;

  ctx.session = ctx.session ?? { page: 0 };
  (ctx.session as { page: number }).page ?? 0;

  let page = (ctx.session as { page: number }).page;

  const totalAnime = await AnimeDatabase.count({ where: {} });
  const totalPages = Math.ceil(totalAnime / pageSize);
  if (page < 0) page = 0;
  if (actionSelect === "next") page++;
  if (page >= totalPages)
    return ctx.answerCbQuery("Sudah mentok!", { show_alert: true });
  if (actionSelect === "prev") page--;
  if (page < 0)
    return ctx.answerCbQuery("Sudah halaman pertama!", { show_alert: true });
  (ctx.session as { page: number }).page = page;
  if (/Ongoing/g.test(textQuery) && !isAction)
    (ctx.session as { page: number }).page = 0;
  const offset = Math.max(page * pageSize, 0);
  let anime = (await AnimeDatabase.findOne({
    where: {},
    offset,
    order: [["id", "DESC"]],
    limit: pageSize,
    include: [{ model: AnimeDetail }],
  })) as IAnimeDatabase | null;

  if (!anime)
    return ctx.answerCbQuery("Maaf pada hari tersebut jadwal kosong!");

  let animeResult = anime as IAnimeDatabase & { AnimeDetail: AnimeDetail };
  if (!animeResult.AnimeDetail)
    return ctx.answerCbQuery("Maaf detail belum tersedia 😥😥");

  const data = Input.fromBuffer(
    (await downloadImage(animeResult.AnimeDetail.image!))!
  );
  let inlineKeyboard = Markup.inlineKeyboard([
    [
      Markup.button.callback("◀", `PageAnimeGoing_prev`),
      Markup.button.callback("🧡", `likeAnime_${animeResult.AnimeDetail.id}`),
      Markup.button.callback("🕐", `setReminder_${animeResult.AnimeDetail.id}`),
      Markup.button.callback("▶", `PageAnimeGoing_next`),
    ],
    [
      Markup.button.url("Kunjungi 🔍", animeResult.AnimeDetail.link!),
      Markup.button.callback(
        "👁‍🗨 Sinopsis",
        `getOnGoingSynopsis_${animeResult.AnimeDetail.id}`
      ),
    ],
  ]);

  let caption = `╭─────[${currentDate()}]────✧
┊ ■ Judul : ${animeResult.AnimeDetail.title}
┊ ■ Japanese : ${animeResult.AnimeDetail.japanese}
┊ ■ Episode : ${anime.eps} [${animeResult.AnimeDetail.status}]
┊ ■ Skor : ${animeResult.AnimeDetail.score}
┊ ■ Type : ${animeResult.AnimeDetail.type}
┊ ■ Durasi : ${animeResult.AnimeDetail.duration}
┊ ■ Genre : ${animeResult.AnimeDetail.genres}
┊ ■ Anime Ke : ${page + 1}/${totalAnime}
╰────────────✧`;

  if (isAction) {
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
}

composer.hears("🔜 Ongoing", ongoing);
composer.action(/PageAnimeGoing/g, ongoing);

export default composer;
