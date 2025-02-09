import { Composer, Input, Markup } from "telegraf";
import { AnimeDetail } from "../utils/database";
import { downloadImage } from "../utils/getBuffer";
import { isCallbackQuery } from "../utils/message";

import type { IAnimeDetail } from "../types/otaku";
import type { MyContext } from "../types/telegraf";

const composer = new Composer<MyContext>();

const synopsis = async (ctx: MyContext) => {
  if (!isCallbackQuery(ctx.callbackQuery)) return;
  let [callback, select] = ctx.callbackQuery!.data.split("_");
  let [daySelect, _detailId] = select.split(":");
  let isSynopsisOngoing = /getOnGoingSynopsis/g.test(callback) ? true : false;
  let detailId: number = parseInt(isSynopsisOngoing ? daySelect : _detailId);
  let detail = (await AnimeDetail.findOne({
    where: { id: detailId },
    attributes: ["synopsis", "image"],
  })) as IAnimeDetail | null;

  if (!detail) return ctx.answerCbQuery("Maaf detail belom dibikin 😥😥");

  const data = Input.fromBuffer((await downloadImage(detail.image!))!);
  let inlineKeyboard = Markup.inlineKeyboard([
    [
      Markup.button.callback("🧡", `likeAnime_${detail.id}`),
      Markup.button.callback("🕐", `setReminder_${detail.id}`),
    ],
    [
      Markup.button.callback(
        "Back",
        isSynopsisOngoing
          ? `PageAnimeGoing`
          : `getDaySchedule_${daySelect}:back`
      ),
    ],
  ]);

  let caption = `─────✧✧✧─────\n${detail.synopsis}\n─────✧✧✧─────`;

  await ctx.editMessageMedia(
    {
      type: "photo",
      media: data,
      caption,
    },
    inlineKeyboard
  );
};

composer.action(/getSynopsis/g, synopsis);
composer.action(/getOnGoingSynopsis/g, synopsis);

export default composer;
