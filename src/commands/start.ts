import { Markup, Composer } from "telegraf";
import type { Context } from "telegraf";
import { AnimeDetail, User, UserSchedule } from "../utils/database";
import { isCallbackQuery } from "../utils/message";
import { Op } from "sequelize";

const composer = new Composer();

async function startCmd(ctx: Context) {
  if (isCallbackQuery(ctx.callbackQuery)) await ctx.deleteMessage();

  const [user, created] = await User.findOrCreate({
    where: { sender: String(ctx.from?.id) },
    defaults: {
      sender: String(ctx.from?.id),
      name: ctx.from?.username || ctx.from?.first_name || "",
    },
  });

  let texts = {
    created:
      "Hiii, it's me Kurosimi,\n\nseperti nya kamu baru pertama kali berinteraksi dengan bot ini 😊\nKamu bisa mengandalkan ku untuk menjadi pengingat mu untuk nonton anime 🤗\n\nKurosimi terhubung dengan otakudesu.cloud jadi klo ada update pasti di kabarin yewhh 😁😁",
  };
  if (created) ctx.reply(texts.created);
  ctx.reply(
    "Kurosimi punya tools yang bisa kamu gunakan 🤗",
    Markup.keyboard([
      ["🔜 Ongoing", "🧡 Aku Suka"],
      ["🕐 Ingatin", "🎞 Jadwal"],
      ["❓ Tolongin"],
    ])
      .resize()
      .oneTime()
  );
}

composer.command("start", startCmd);
composer.hears("💢 Kembali", startCmd);
composer.action("backToMenu", startCmd);

export default composer;
