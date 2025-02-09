import puppeteer from "puppeteer";
import type { LaunchOptions } from "puppeteer";
import { IAnimeDetail, IAnimeList, IAnimeScheduleList } from "../types/otaku";
import { CONFIG } from "../config";

export const onGoingInstance = async () => {
  const launchOptions: LaunchOptions = {
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      `--proxy-server=${CONFIG.PROXY}`,
    ],
  };

  const browser = await puppeteer.launch(launchOptions);
  const page = await browser.newPage();

  async function getDetailAnime(keyId: string): Promise<IAnimeDetail> {
    let link = `https://otakudesu.cloud/anime/${keyId}`;
    await page.goto(link, {
      waitUntil: "domcontentloaded",
    });

    console.log(`Scraping.... ${keyId}`);
    const result = await page.evaluate((key) => {
      const animeDetail: Partial<IAnimeDetail> = {};
      const infoElements = document.querySelectorAll("div.infozin p");
      infoElements.forEach((p: any) => {
        const text = p.textContent.trim();
        if (text.includes("Judul")) {
          animeDetail.title = text.replace("Judul:", "").trim();
        }
        if (text.includes("Japanese")) {
          animeDetail.japanese = text.replace("Japanese:", "").trim();
        }
        if (text.includes("Skor")) {
          animeDetail.score = text.replace("Skor:", "").trim();
        }
        if (text.includes("Tipe")) {
          animeDetail.type = text.replace("Tipe:", "").trim();
        }
        if (text.includes("Status")) {
          animeDetail.status = text.replace("Status:", "").trim();
        }
        if (text.includes("Total Episode")) {
          animeDetail.totalEpisodes = text.replace("Total Episode:", "").trim();
        }
        if (text.includes("Durasi")) {
          animeDetail.duration = text.replace("Durasi:", "").trim();
        }
        if (text.includes("Tanggal Rilis")) {
          animeDetail.releaseDate = text.replace("Tanggal Rilis:", "").trim();
        }
        if (text.includes("Studio")) {
          animeDetail.studio = text.replace("Studio:", "").trim();
        }
        if (text.includes("Genre")) {
          animeDetail.genres = Array.from(p.querySelectorAll("a"))
            .map((a: any) => a.textContent.trim())
            .join(",");
        }
      });
      // Mengambil gambar
      const imgElement = document.querySelector("div.fotoanime img");
      animeDetail.image = imgElement ? imgElement.getAttribute("src")! : "";

      animeDetail.link = `https://otakudesu.cloud/anime/${key}`;
      // Mengambil sinopsis
      const sinopsisElement = document.querySelector("div.sinopc p");
      animeDetail.synopsis = sinopsisElement
        ? sinopsisElement.textContent?.trim()
        : "";
      return animeDetail as IAnimeDetail;
    }, keyId);
    return result as IAnimeDetail;
  }

  const getOngoingAnime = async () => {
    const allOngoingAnimeList: IAnimeList[] = [];

    let pageNumber = 1;
    let hasNextPage = true;

    while (hasNextPage) {
      const url =
        pageNumber === 1
          ? "https://otakudesu.cloud/ongoing-anime/"
          : `https://otakudesu.cloud/ongoing-anime/page/${pageNumber}`;
      console.log(`Scraping page: ${pageNumber}`);
      await page.goto(url, { waitUntil: "domcontentloaded" });
      const ongoingAnimeList = await page.evaluate(() => {
        const animeData: IAnimeList[] = [];

        document
          .querySelectorAll("#venkonten .venz ul li")
          .forEach((item: Element, index) => {
            const title =
              (item.querySelector(".thumbz h2") as HTMLElement)?.innerText ||
              "";
            const img =
              (item.querySelector(".thumbz img") as HTMLImageElement)?.src ||
              "";
            const link =
              (item.querySelector(".thumb a") as HTMLAnchorElement)?.href || "";
            const key = link.split("/anime/")[1].replace("/", "");
            const eps = (
              (item.querySelector(".epz") as HTMLElement)?.innerText.replace(
                /[^\d]/g,
                ""
              ) || ""
            )
              .replace(/ +/g, "-")
              .toLowerCase();
            const releaseTag =
              (item.querySelector(".epztipe") as HTMLElement)?.innerText.slice(
                1
              ) || "";
            if (title && img && link && eps && releaseTag) {
              animeData.push({
                id: index,
                title,
                key,
                link,
                img,
                eps,
                releaseTag,
              });
            }
          });

        return animeData;
      });

      allOngoingAnimeList.push(...ongoingAnimeList);
      hasNextPage = await page.evaluate(() => {
        return !!document.querySelector(".pagination .next.page-numbers");
      });
      pageNumber++;
    }
    return allOngoingAnimeList;
  };

  async function getScheduleList() {
    await page.goto("https://otakudesu.cloud/jadwal-rilis/", {
      waitUntil: "domcontentloaded",
    });

    // Tunggu hingga selector untuk konten hari muncul
    await page.waitForSelector("#venkonten .kgjdwl321  .kglist321");

    const data = await page.evaluate(() => {
      const animeList: IAnimeScheduleList[] = [];

      // Mengambil semua section berdasarkan selector
      const daysSections = document.querySelectorAll(
        "#venkonten .kgjdwl321 .kglist321"
      );

      var count = 0;
      daysSections.forEach((section, index) => {
        const dayElement = section.querySelector("h2");
        const animeItems = section.querySelectorAll(".kglist321 ul li a");

        if (dayElement && animeItems.length > 0) {
          const day = dayElement.innerText.trim();

          animeItems.forEach((item, index) => {
            // Asumsi item adalah HTMLAnchorElement
            const anchorItem = item as HTMLAnchorElement;
            const title = anchorItem?.innerText.trim();
            const link = anchorItem.href;
            const key = link.split("/anime/")[1].replace("/", "");

            if (title && link) {
              animeList.push({
                id: count,
                day,
                title,
                link,
                key,
              });
              count++;
            }
          });
        }
      });
      return animeList;
    });
    return data;
  }

  return {
    getOngoingAnime,
    getScheduleList,
    getDetailAnime,
    page,
    browser,
  };
};

// (async () => {
//   const data = await onGoingInstance();
//   let result = await data.getScheduleList();
//   console.log(result);
// })();
