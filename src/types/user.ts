import type { Optional } from "sequelize";
import { IAnimeDetail } from "./otaku";

export interface IUser {
  id: number;
  name: string | null;
  sender: string;
}

export interface IUserCreation extends Optional<IUser, "id"> {}

export interface IUserSchedule {
  id: number;
  user_id: number;
  anime_detail_id: number;
}

export interface IUserScheduleCreation extends Optional<IUserSchedule, "id"> {}

export interface IUserLike {
  id: number;
  user_id: number;
  anime_detail_id: number;
}

export interface IUserLikeCreation extends Optional<IUserLike, "id"> {}

export interface IUserWithLike extends IUser {
  UserLikes: IUserLike[];
}

export interface IUserLikeList extends IUserLike {
  User: IUser;
  AnimeDetail: IAnimeDetail;
}

export interface IUserScheduleList extends IUserSchedule {
  User: IUser;
  AnimeDetail: IAnimeDetail;
}
