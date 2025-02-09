
## SETUP ENV

```yaml
BOT_TOKEN=
WEBHOOK_URL=
PORT=

DB_NAME=kurosimi
USERNAME_DB=
PASSWORD_DB=
```

## Basic installation

> npm install

> npx playwright install-deps

> npx playwright install chromium

## Create database

```sql
> CREATE DATABASE kurosimi
> exit
```

## sync the database

```sh
> npx ts-node src/syncDatabase.ts
Syncronizing database.....
Executing (default).....
Executing (default).....
Executing (default).....
Executing (default).....
Executing (default).....
```

Waiting for success and close

## Runing script

```sh
> npx ts-node src/server.ts
```

## Log success

```sh
🚀 Run cuyy 6382
🐱‍👤 Bot Telegram is now launced!
Executing (default): SELECT count(*) AS `count` FROM `AnimeDatabases` AS `AnimeDatabase`;
Executing (default): SELECT count(*) AS `count` FROM `AnimeSchedules` AS `AnimeSchedule`;
Checking database!
Scraping page: 1
Scraping page: 2
Scraping page: 3
Scraping page: 4
Executing (default): SELECT `id`, `key` FROM `AnimeDetails` AS `AnimeDetail` WHERE `AnimeDetail`.`key` IN ('neet-kuoichi-sub-indo', 'medalist-sub-indo', 'touharate-mahjong-sub-indo', 'solo-level-s2-sub-indo', 'a-rank-party-sub-indo', 'ao-exorcist-yosuga-sub-indo', 'chi-chikyuu-tsuite-sub-indo', 'borto-sub-indo');
Executing (default): SELECT `AnimeDatabase`.`id`, `AnimeDatabase`.`eps`, `AnimeDatabase`.`anime_detail_id`, `AnimeDetail`.`id` AS `AnimeDetail.id`, `AnimeDetail`.`key` AS `AnimeDetail.key` FROM `AnimeDatabases` AS `AnimeDatabase` LEFT OUTER JOIN `AnimeDetails` AS `AnimeDetail` ON `AnimeDatabase`.`key` = `AnimeDetail`.`id`;
Scraping.... neet-kuoichi-sub-indo
....
```