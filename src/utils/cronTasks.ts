import cron from "node-cron";
import { onGoingInstance } from "./otaku";
import { AnimeDetail, User, UserSchedule } from "./database";
import { Op } from "sequelize";
import { Input, Markup } from "telegraf";
import { downloadImage } from "./getBuffer";

import type { Optional, WhereOptions } from "sequelize";
import type {
  IAnimeDetail,
  IAnimeDetailCreation,
  IAnimeList,
} from "../types/otaku";
import type { Telegraf } from "telegraf";
import type { MyContext } from "../types/telegraf";
import type { PUserSchedule } from "../types/user";

async function taskList(bot: Telegraf<MyContext>) {
  // Instance scraper data
  const data = await onGoingInstance();

  async function runOngoingAnime() {
    console.log("Checking database!");

    const ongoings: IAnimeList[] = (await data.getOngoingAnime()).reverse();
    const keys = ongoings.map((anime) => anime.key as string);

    const existingAnimes = await AnimeDetail.findAll({
      where: { key: keys },
      attributes: ["id", "key"],
    });

    const existingAnimeMap = new Map<string, IAnimeDetail>(
      existingAnimes.map((anime) => [anime.key, anime])
    );

    const newDetailAnimes = ongoings
      .filter((anime) => !existingAnimeMap.has(anime.key))
      .map((value) => ({ ...value, id: undefined }));

    if (newDetailAnimes.length > 0) {
      let detailListAnime: Partial<IAnimeDetail>[] = [];
      for (let key of newDetailAnimes.map((d) => d.key)) {
        await delay(3000);
        const detailNimeByKey = await data.getDetailAnime(key);
        if (detailNimeByKey) detailListAnime.push({ ...detailNimeByKey, key });
      }

      if (detailListAnime.length > 0) {
        await AnimeDetail.bulkCreate(
          detailListAnime.map(
            (d) =>
              ({ ...d, id: undefined } as Optional<IAnimeDetailCreation, "id">)
          )
        );
      }

      for (let ongoing of ongoings) {
        let animeDetail = existingAnimes.find(
          (detail) => detail.key === ongoing.key
        ) as AnimeDetail | null;
        if (!animeDetail) continue;
        if (animeDetail?.day !== ongoing.releaseTag) {
          animeDetail.day = ongoing.releaseTag;
          await animeDetail.save();
        }
        if (animeDetail?.episode !== ongoing.eps) {
          animeDetail.episode = ongoing.eps;
          await animeDetail.save();
        }
      }
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const updatedAnimes = (await UserSchedule.findAll({
      include: [
        {
          model: AnimeDetail,
          where: { updatedAt: { [Op.gte]: yesterday } } as WhereOptions,
          order: [["updatedAt", "DESC"]],
        },
        {
          model: User,
          attributes: ["id", "sender"],
        },
      ],
    })) as Optional<PUserSchedule, "id">[] | [];

    for (let resultAnime of updatedAnimes) {
      const data = Input.fromBuffer(
        (await downloadImage(resultAnime.AnimeDetail.image!))!
      );
      bot.telegram.sendPhoto(resultAnime.User.sender, data, {
        caption: `Haiii!, anime kamu ${resultAnime.AnimeDetail.title} sudah release episode baru lohh!\n\nCek yukk sekarang!`,
        ...Markup.inlineKeyboard([
          [Markup.button.url("Kunjungi 🔎", resultAnime.AnimeDetail.link)],
        ]),
      });
    }
    console.log("Anime is up to date.");
    return true;
  }

  //   make data updated every hour with a cron task
  cron.schedule("0 * * * *", runOngoingAnime);

  // Initial Database
  const countDetail = await AnimeDetail.count();
  if (countDetail < 1) await runOngoingAnime();
}

function filterUniqueValues<T extends unknown[]>(arr: T): T {
  return [...new Set(arr)] as T;
}

function delay(times: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, times));
}

export default taskList;
