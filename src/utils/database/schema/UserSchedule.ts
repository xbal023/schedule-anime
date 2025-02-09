import { DataTypes, Model } from "sequelize";
import connection from "../connection";
import { IUserSchedule, IUserScheduleCreation } from "../../../types/user";
import User from "./User";
import UserLike from "./UserLike";
import AnimeDetail from "./AnimeDetail";

class UserSchedule extends Model<IUserSchedule, IUserScheduleCreation>
  implements IUserSchedule {
  public readonly id!: number;
  public user_id!: number;
  public anime_detail_id!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

UserSchedule.init(
  {
    id: {
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
      type: DataTypes.INTEGER,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        key: "id",
        model: User,
      },
    },
    anime_detail_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        key: "id",
        model: AnimeDetail,
      },
    },
  },
  {
    sequelize: connection,
    timestamps: true,
  }
);

export default UserSchedule;
