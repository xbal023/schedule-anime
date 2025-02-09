import { Optional } from "sequelize";
import { AnimeDetail } from "../utils/database";

export interface IAnimeDatabase {
  id: number;
  eps: string;
  releaseTag: string;
  anime_detail_id: number;
}

export interface IAnimeList {
  id: number;
  title: string;
  img: string;
  key: string;
  link: string;
  eps: string;
  releaseTag: string;
}

export interface IAnimeScheduleList {
  id: number;
  day: string;
  title: string;
  link: string;
  key: string;
}

export interface IAnimeDetail {
  id: number;
  title: string;
  japanese: string;
  score: string;
  type: string;
  status: string;
  totalEpisodes: string;
  duration: string;
  releaseDate: string;
  link: string;
  studio: string;
  genres: string;
  image: string;
  synopsis: string;
  key: string;
}

export interface IAnimeDatabaseCreation
  extends Optional<IAnimeDatabase, "id"> {}

export interface IAnimeScheduleListCreation
  extends Optional<IAnimeScheduleList, "id"> {}

export interface IAnimeDetailCreation extends Optional<IAnimeDetail, "id"> {}

export interface IAnimeScheduleDetail {
  id: number;
  day: string;
  title: string;
  link: string;
  key: string;
  AnimeDetail: AnimeDetail;
}
