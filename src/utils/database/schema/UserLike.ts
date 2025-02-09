import { DataTypes, Model } from "sequelize";
import connection from "../connection";
import { IUserLike, IUserLikeCreation } from "../../../types/user";
import User from "./User";
import AnimeDetail from "./AnimeDetail";

class UserLike extends Model<IUserLike, IUserLikeCreation>
  implements IUserLike {
  public readonly id!: number;
  public user_id!: number;
  public anime_detail_id!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

UserLike.init(
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

export default UserLike;
