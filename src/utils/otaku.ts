import { chromium, Browser, Page } from "playwright";
import type { BrowserContextOptions } from "playwright";
import { IAnimeDetail, IAnimeList, IAnimeScheduleList } from "../types/otaku";

export const onGoingInstance = async () => {
  const launchOptions: BrowserContextOptions = {
    userAgent:
      "Mozilla/5.0 (Linux; Android 11; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Mobile Safari/537.36",
    locale: "id-ID",
    geolocation: { latitude: -6.2088, longitude: 106.8456 },
    permissions: ["geolocation"],
    timezoneId: "Asia/Jakarta",
  };

  const browser: Browser = await chromium.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-blink-features=AutomationControlled",
    ],
  });

  const context = await browser.newContext(launchOptions);
  const page: Page = await context.newPage();

  async function getDetailAnime(keyId: string): Promise<IAnimeDetail> {
    let link = `https://otakudesu.cloud/anime/${keyId}`;
    await page.goto(link, { waitUntil: "domcontentloaded" });

    console.log(`Scraping.... ${keyId}`);

    const safeText = async (locator: string) =>
      (await page.locator(locator).allTextContents()).join(" ").trim();
    const safeAttr = async (locator: string, attr: string) =>
      (await page.locator(locator).getAttribute(attr)) || "";

    const animeDetail: IAnimeDetail = {
      id: 0,
      key: keyId,
      title:
        (await safeText("div.infozin p:has-text('Judul')")).split(": ")[1] ||
        "",
      japanese:
        (await safeText("div.infozin p:has-text('Japanese')")).split(": ")[1] ||
        "",
      score:
        (await safeText("div.infozin p:has-text('Skor')")).split(": ")[1] || "",
      type:
        (await safeText("div.infozin p:has-text('Tipe')")).split(": ")[1] || "",
      status:
        (await safeText("div.infozin p:has-text('Status')")).split(": ")[1] ||
        "",
      episode: "unknown",
      day: "unknown",
      totalEpisodes:
        (await safeText("div.infozin p:has-text('Total Episode')")).split(
          ": "
        )[1] || "",
      duration:
        (await safeText("div.infozin p:has-text('Durasi')")).split(": ")[1] ||
        "",
      releaseDate:
        (await safeText("div.infozin p:has-text('Tanggal Rilis')")).split(
          ": "
        )[1] || "",
      studio:
        (await safeText("div.infozin p:has-text('Studio')")).split(": ")[1] ||
        "",
      genres:
        (
          await page
            .locator("div.infozin p:has-text('Genre') a")
            .allTextContents()
        ).join(",") || "",
      image: await safeAttr("div.fotoanime img", "src"),
      link: link,
      synopsis: await safeText("div.sinopc p"),
    };

    return animeDetail;
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

      const animeElements = await page
        .locator("#venkonten .venz ul li")
        .elementHandles();

      for (const item of animeElements) {
        const title = await item.$eval(
          ".thumbz h2",
          (el) => el.textContent?.trim() || ""
        );
        const img = await item.$eval(
          ".thumbz img",
          (el) => (el as HTMLImageElement).src || ""
        );
        const link = await item.$eval(
          ".thumb a",
          (el) => (el as HTMLAnchorElement).href || ""
        );
        const key = link.split("/anime/")[1].replace("/", "");
        const eps = await item.$eval(
          ".epz",
          (el) =>
            el.textContent
              ?.replace(/[^\d]/g, "")
              .replace(/ +/g, "-")
              .toLowerCase() || ""
        );
        const releaseTag = await item.$eval(
          ".epztipe",
          (el) => el.textContent?.trim().toLowerCase() || ""
        );

        if (title && img && link && eps && releaseTag) {
          allOngoingAnimeList.push({
            id: allOngoingAnimeList.length,
            title,
            key,
            link,
            img,
            eps,
            releaseTag,
          });
        }
      }

      hasNextPage =
        (await page.locator(".pagination .next.page-numbers").count()) > 0;
      pageNumber++;
    }
    return allOngoingAnimeList;
  };

  async function getScheduleList() {
    await page.goto("https://otakudesu.cloud/jadwal-rilis/", {
      waitUntil: "domcontentloaded",
    });

    await page.waitForSelector("#venkonten .kgjdwl321  .kglist321");

    const animeList: IAnimeScheduleList[] = [];
    let count = 0;

    const daysSections = await page
      .locator("#venkonten .kgjdwl321 .kglist321")
      .elementHandles();

    for (const section of daysSections) {
      const day = await section.$eval(
        "h2",
        (el) => el.textContent?.trim() || ""
      );
      const animeItems = await section.$$("ul li a");

      for (const item of animeItems) {
        const title = await item.evaluate((el) => el.textContent?.trim() || "");
        const link = await item.evaluate(
          (el) => (el as HTMLAnchorElement).href || ""
        );
        const key = link.split("/anime/")[1].replace("/", "");

        animeList.push({
          id: count++,
          day,
          title,
          link,
          key,
        });
      }
    }
    return animeList;
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
