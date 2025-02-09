import { DataTypes, Model } from "sequelize";
import connection from "../connection";
import {
  IAnimeScheduleList,
  IAnimeScheduleListCreation,
} from "../../../types/otaku";

class AnimeSchedule
  extends Model<IAnimeScheduleList, IAnimeScheduleListCreation>
  implements IAnimeScheduleList {
  public id!: number;
  public title!: string;
  public link!: string;
  public day!: string;
  public key!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

AnimeSchedule.init(
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
    day: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    link: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    key: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: "AnimeDetails",
        key: "key",
      },
    },
  },
  {
    sequelize: connection,
    timestamps: true,
  }
);

export default AnimeSchedule;
