import { Composer, Markup } from "telegraf";
import type { Context } from "telegraf";

const composer = new Composer();

function helpCmd(ctx: Context) {
  ctx.reply(
    "Heii, kamu butuh bantuan apaa?\nJika ada pertanyaan atau masukan kamu bisa hubungi CS ku aja uyy 😁😁"
  );
}

composer.command("help", helpCmd);
composer.hears("❓ Tolongin", helpCmd);

export default composer;
