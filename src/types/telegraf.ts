import type { Context } from "telegraf";

export interface MyContext extends Context {
  session:
    | {
        page: number;
      }
    | {};
}
