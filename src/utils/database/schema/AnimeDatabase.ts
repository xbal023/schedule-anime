import { DataTypes, Model } from "sequelize";
import connection from "../connection";
import { IAnimeDatabase, IAnimeDatabaseCreation } from "../../../types/otaku";
import AnimeDetail from "./AnimeDetail";

class AnimeDatabase extends Model<IAnimeDatabase, IAnimeDatabaseCreation>
  implements IAnimeDatabase {
  public id!: number;
  public anime_detail_id!: number;
  public eps!: string;
  public releaseTag!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

AnimeDatabase.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    anime_detail_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: AnimeDetail,
        key: "id",
      },
    },
    eps: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    releaseTag: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize: connection,
    timestamps: true,
  }
);

export default AnimeDatabase;
