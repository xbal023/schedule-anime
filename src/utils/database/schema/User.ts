import { DataTypes, Model } from "sequelize";
import connection from "../connection";
import { IUser, IUserCreation } from "../../../types/user";

class User extends Model<IUser, IUserCreation> implements IUser {
  public readonly id!: number;
  public name!: string | null;
  public sender!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

User.init(
  {
    id: {
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
      type: DataTypes.INTEGER,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    sender: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize: connection,
    timestamps: true,
  }
);

export default User;
