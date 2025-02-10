import { DataTypes, Model } from "sequelize";
import connection from "../connection";
import { IAnimeDetail, IAnimeDetailCreation } from "../../../types/otaku";

class AnimeDetail extends Model<IAnimeDetail, IAnimeDetailCreation>
  implements IAnimeDetail {
  public id!: number;
  public title!: string;
  public japanese!: string;
  public score!: string;
  public type!: string;
  public status!: string;
  public totalEpisodes!: string;
  public episode!: string;
  public day!: string;
  public duration!: string;
  public releaseDate!: string;
  public studio!: string;
  public genres!: string;
  public image!: string;
  public synopsis!: string;
  public key!: string;
  public link!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

AnimeDetail.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    japanese: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    score: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    totalEpisodes: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    episode: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "unknown",
    },
    day: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "unknown",
    },
    duration: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    releaseDate: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    studio: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    genres: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    image: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    synopsis: {
      type: DataTypes.TEXT("long"),
      allowNull: false,
    },
    key: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    link: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize: connection,
    timestamps: true,
    indexes: [
      {
        name: "index_id",
        unique: true,
        fields: ["id"],
      },
      {
        name: "index_key",
        unique: true,
        fields: ["key"],
      },
    ],
  }
);

export default AnimeDetail;
