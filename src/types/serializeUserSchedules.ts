export interface IUserParse {
  id: number;
  sender: string;
}

export interface IUserScheduleParse {
  id: number;
  User: IUserParse;
}

export interface IAnimeDetailParse {
  id: number;
  title: string;
  japanese: string;
  score: string;
  type: string;
  status: string;
  totalEpisodes: string;
  duration: string;
  releaseDate: string;
  studio: string;
  genres: string;
  image: string;
  synopsis: string;
  key: string;
  link: string;
  UserSchedules: IUserScheduleParse[];
}

export interface ISimplifiedResult {
  id: number;
  sender: string;
  animeDetail: Omit<IAnimeDetailParse, "UserSchedules">;
}
