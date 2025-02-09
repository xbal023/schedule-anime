import { Composer } from "telegraf";
import helpCommand from "../commands/help";
import startCommand from "../commands/start";
import adminCommand from "../commands/admin";

import likeHears from "../hears/likeHears";
import ongoingHears from "../hears/ongoingHears";
import reminderHears from "../hears/reminderHears";
import showScheduleHears from "../hears/showScheduleHears";
import getDetailAnimeHears from "../hears/getDetailAnimeHears";

import getDaySchedule from "../actions/getDaySchedule";
import backSchedule from "../actions/backSchedule";
import getSynopsis from "../actions/getSynopsis";
import setLike from "../actions/setLike";
import setRemind from "../actions/setRemind";

import type { NextFunction } from "express";
import type { MyContext } from "../types/telegraf";

const composers = new Composer<MyContext>();

composers.use((ctx: MyContext, next: NextFunction) => {
  ctx.session = ctx.session ?? { page: 0 };
  (ctx.session as { page: number }).page ??= 0;
  return next();
});

composers.use(helpCommand.middleware());
composers.use(startCommand.middleware());
composers.use(adminCommand.middleware());

composers.use(likeHears.middleware());
composers.use(ongoingHears.middleware());
composers.use(reminderHears.middleware());
composers.use(showScheduleHears.middleware());
composers.use(getDetailAnimeHears.middleware());

composers.use(getDaySchedule.middleware());
composers.use(backSchedule.middleware());
composers.use(getSynopsis.middleware());
composers.use(setLike.middleware());
composers.use(setRemind.middleware());

export default composers;
