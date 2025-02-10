import { Composer, Input, Markup } from "telegraf";
import { AnimeDetail } from "../utils/database";
import { downloadImage } from "../utils/getBuffer";
import { isCallbackQuery } from "../utils/message";

import type { MyContext } from "../types/telegraf";
import type { IAnimeDetail } from "../types/otaku";

const composer = new Composer<MyContext>();
const pageSize = 1;

composer.action(/getDaySchedule/g, async (ctx: MyContext) => {
  if (!isCallbackQuery(ctx.callbackQuery)) return;

  let [_, select] = ctx.callbackQuery!.data.split("_");
  let [daySelect, actionSelect] = select.split(":");

  let isAction = /(next|prev|back)/g.test(actionSelect) ? true : false;

  ctx.session = ctx.session ?? { page: 0 };
  (ctx.session as { page: number }).page ?? 0;

  let page = (ctx.session as { page: number }).page;

  const totalAnime = await AnimeDetail.count({ where: { status: "Ongoing" } });
  const totalPages = Math.ceil(totalAnime / pageSize);
  if (page < 0) page = 0;
  if (actionSelect === "next") page++;
  if (page >= totalPages)
    return ctx.answerCbQuery("Sudah mentok!", { show_alert: true });
  if (actionSelect === "prev") page--;
  if (page < 0)
    return ctx.answerCbQuery("Sudah halaman pertama!", { show_alert: true });
  (ctx.session as { page: number }).page = page;
  if (!isAction) await ctx.deleteMessage();
  const offset = Math.max(page * pageSize, 0);

  let detail = (await AnimeDetail.findOne({
    where: { day: daySelect },
    offset,
    limit: pageSize,
  })) as IAnimeDetail | null;

  if (!detail) return ctx.answerCbQuery("Maaf detail belum tersedia 😥😥");

  const data = Input.fromBuffer((await downloadImage(detail.image!))!);
  let inlineKeyboard = Markup.inlineKeyboard([
    [
      Markup.button.callback("◀", `getDaySchedule_${daySelect}:prev`),
      Markup.button.callback("🧡", `likeAnime_${detail.id}`),
      Markup.button.callback("🕐", `setReminder_${detail.id}`),
      Markup.button.callback("▶", `getDaySchedule_${daySelect}:next`),
    ],
    [
      Markup.button.url("Kunjungi 🔍", detail.link!),
      Markup.button.callback(
        "👁‍🗨 Sinopsis",
        `getSynopsis_${daySelect}:${detail.id}`
      ),
    ],
    [Markup.button.callback("Back", `backSchedule`)],
  ]);

  let caption = `╭────────────✧
┊ ■ Judul: ${detail.title}
┊ ■ Japanese: ${detail.japanese}
┊ ■ Skor: ${detail.score}
┊ ■ Status: ${detail.status}
┊ ■ Type: ${detail.type}
┊ ■ Durasi Rata2: ${detail.duration}
┊ ■ Genre: ${detail.genres}
┊ ■ Jadwal: ${daySelect}
┊ ■ Anime Ke: ${page + 1}/${totalAnime}
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
});

export default composer;
