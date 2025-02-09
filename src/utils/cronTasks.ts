import cron from "node-cron";
import { onGoingInstance } from "./otaku";
import {
  AnimeDetail,
  AnimeDatabase,
  AnimeSchedule,
  UserSchedule,
  User,
} from "./database";
import { currentDate } from "./date";

import { Op } from "sequelize";

import type { Optional } from "sequelize";
import type {
  IAnimeDatabaseCreation,
  IAnimeDetail,
  IAnimeDetailCreation,
  IAnimeList,
  IAnimeScheduleList,
} from "../types/otaku";
import { Input, Markup } from "telegraf";
import type { Telegraf } from "telegraf";
import type { MyContext } from "../types/telegraf";
import type {
  IAnimeDetailParse,
  ISimplifiedResult,
} from "../types/serializeUserSchedules";
import { downloadImage } from "./getBuffer";

async function taskList(bot: Telegraf<MyContext>) {
  // Instance scraper data
  const data = await onGoingInstance();

  async function runOngoingAnime() {
    console.log("Checking database!");

    const ongoing: IAnimeList[] = (await data.getOngoingAnime()).reverse();
    const keys = ongoing.map((anime) => anime.key as string);

    const existingAnimes = await AnimeDetail.findAll({
      where: { key: keys },
      attributes: ["id", "key"],
    });

    const existingEps = (await AnimeDatabase.findAll({
      attributes: ["id", "eps", "anime_detail_id"],
      include: [{ model: AnimeDetail, attributes: ["id", "key"] }],
    })) as Array<AnimeDatabase & { AnimeDetail: AnimeDetail }>;

    const existingAnimeMap = new Map<string, IAnimeDetail>(
      existingAnimes.map((anime) => [anime.key, anime])
    );

    const existingEpsMap = new Map<
      string,
      AnimeDatabase & { AnimeDetail: AnimeDetail }
    >(
      existingEps
        .filter((entry) => entry.AnimeDetail && entry.AnimeDetail.key)
        .map(
          (entry) =>
            [entry.AnimeDetail!.key, entry] as [
              string,
              AnimeDatabase & { AnimeDetail: AnimeDetail }
            ]
        )
    );

    const newDetailAnimes = ongoing
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
    }

    const newAnimes = ongoing
      .filter((anime) => {
        const existingAnime = existingEpsMap.get(anime.key);
        return !existingAnime || existingAnime.eps !== anime.eps;
      })
      .map((value) => ({ ...value, id: undefined }));

    if (newAnimes.length > 0) {
      const existingDetail = await AnimeDetail.findAll({
        where: { key: keys },
      });

      const existingDetailMap = new Map<string, IAnimeDetail>(
        existingDetail.map((anime) => [anime.key, anime])
      );
      const filteredNewAnimes = newAnimes
        .filter((anime) => existingDetailMap.has(anime.key))
        .map(
          (anime) =>
            ({
              id: undefined,
              eps: anime.eps,
              releaseTag: anime.releaseTag,
              anime_detail_id: existingDetailMap.get(anime.key)!.id,
            } as Optional<IAnimeDatabaseCreation, "id">)
        );
      let filterNewAnimeIds = filterUniqueValues(
        filteredNewAnimes.map((d) => d.anime_detail_id)
      );
      if (filterNewAnimeIds.length > 0) {
        let resultAnimes = ((await AnimeDetail.findAll({
          where: { id: { [Op.in]: filterNewAnimeIds } },
          include: [
            {
              model: UserSchedule,
              attributes: ["id"],
              include: [{ model: User, attributes: ["id", "sender"] }],
            },
          ],
        })) as unknown) as IAnimeDetailParse[];

        const parseResultAnime = simplifyAnimeData(
          resultAnimes
        ) as ISimplifiedResult[];
        for (let resultAnime of parseResultAnime) {
          const data = Input.fromBuffer(
            (await downloadImage(resultAnime.animeDetail.image!))!
          );
          bot.telegram.sendPhoto(resultAnime.sender, data, {
            caption: `Haiii!, anime kamu ${resultAnime.animeDetail.title} sudah release episode baru lohh!\n\nCek yukk sekarang!`,
            ...Markup.inlineKeyboard([
              [Markup.button.url("Kunjungi 🔎", resultAnime.animeDetail.link)],
            ]),
          });
        }
      }
      if (filteredNewAnimes.length > 0) {
        await AnimeDatabase.bulkCreate(filteredNewAnimes);
        console.log(`${filteredNewAnimes.length} anime is now updated!`);
        return true;
      }
    }

    console.log("Anime is up to date.");
    return true;
  }

  async function runScheduleReleaseAnime() {
    console.log(`[${currentDate()}] Checking database (weekly update)!`);
    const schedulesData: IAnimeScheduleList[] = await data.getScheduleList();

    const existingAnimes = await AnimeSchedule.findAll({
      attributes: ["link"],
    });

    const existingLinks = new Set(existingAnimes.map((anime) => anime.link));

    const newAnimes = schedulesData.filter(
      (anime) => !existingLinks.has(anime.link)
    );

    if (newAnimes.length > 0) {
      const keys = filterUniqueValues(newAnimes.map((s) => s.key));
      const existingDetail = await AnimeDetail.findAll({
        where: { key: keys },
      });

      const existingDetailMap = new Map<string, Boolean>(
        existingDetail.map((anime) => [anime.key, true])
      );

      const keyIsNotExists: string[] = keys.filter(
        (key) => !existingDetailMap.has(key)
      );

      let detailListAnime: Partial<IAnimeDetail>[] = [];
      for (let key of keyIsNotExists) {
        const detailNimeByKey = await data.getDetailAnime(key);
        if (detailNimeByKey) detailListAnime.push({ ...detailNimeByKey, key });
      }
      await Promise.all(detailListAnime);
      if (detailListAnime.length > 0)
        await AnimeDetail.bulkCreate(
          detailListAnime.map(
            (d) =>
              ({ ...d, id: undefined } as Optional<IAnimeDetailCreation, "id">)
          )
        );
      await AnimeSchedule.bulkCreate(
        newAnimes.map((d) => ({ ...d, id: undefined }))
      );
      console.log(`${newAnimes.length} anime schedule updated!`);
      return true;
    } else {
      console.log("All anime schedules are up to date.");
      return false;
    }
  }

  //   make data updated every hour with a cron task
  cron.schedule("0 * * * *", runOngoingAnime);
  cron.schedule("0 8 * * 0", runScheduleReleaseAnime);

  // Initial Database
  const countOngoing = await AnimeDatabase.count();
  const countSchedule = await AnimeSchedule.count();
  if (countOngoing < 1) await runOngoingAnime();
  if (countSchedule < 1) await runScheduleReleaseAnime();
}

function filterUniqueValues<T extends unknown[]>(arr: T): T {
  return [...new Set(arr)] as T;
}

function delay(times: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, times));
}

function simplifyAnimeData(
  animeData: IAnimeDetailParse[]
): ISimplifiedResult[] {
  return animeData.flatMap((anime) =>
    anime.UserSchedules.map((schedule) => ({
      id: schedule.User.id,
      sender: schedule.User.sender,
      animeDetail: {
        id: anime.id,
        title: anime.title,
        japanese: anime.japanese,
        score: anime.score,
        type: anime.type,
        status: anime.status,
        totalEpisodes: anime.totalEpisodes,
        duration: anime.duration,
        releaseDate: anime.releaseDate,
        studio: anime.studio,
        genres: anime.genres,
        image: anime.image,
        synopsis: anime.synopsis,
        key: anime.key,
        link: anime.link,
      },
    }))
  );
}

export default taskList;
