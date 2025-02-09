import { Composer } from "telegraf";
import { User, UserSchedule } from "../utils/database";
import { isCallbackQuery } from "../utils/message";

import type { Context } from "telegraf";
import type { IUser, IUserLike, IUserSchedule } from "../types/user";

const composer = new Composer();

composer.action(/setReminder/g, async function (ctx: Context) {
  if (!isCallbackQuery(ctx.callbackQuery)) return;
  let [, select] = ctx.callbackQuery.data.split("_");
  let [_detailId] = select.split(":");
  let detailId: number = parseInt(_detailId);
  let sender = String(ctx.from!.id) ?? "";
  let user = (await User.findOne({
    where: { sender },
  })) as IUser | null;
  if (!user)
    return ctx.answerCbQuery("Kesalahan tak terduga Ups!!!", {
      show_alert: true,
    });

  let [, created] = (await UserSchedule.findOrCreate({
    where: { user_id: user!.id, anime_detail_id: detailId },
    defaults: { user_id: user!.id, anime_detail_id: detailId },
  })) as [IUserSchedule, boolean];
  ctx.answerCbQuery(
    created
      ? "Anime udah ditambahin ke daftar ingat 🥰\nSiap siap aja nanti klo update di ingetin dehh"
      : "Anime udah didaftar ingat sebelumnya 🤗",
    { show_alert: true }
  );
});

export default composer;
