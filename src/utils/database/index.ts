import AnimeDetail from "./schema/AnimeDetail";
import User from "./schema/User";
import UserSchedule from "./schema/UserSchedule";
import UserLike from "./schema/UserLike";

AnimeDetail.hasMany(UserLike, {
  foreignKey: "anime_detail_id",
  onDelete: "CASCADE",
});

UserLike.belongsTo(AnimeDetail, {
  foreignKey: "anime_detail_id",
  onDelete: "CASCADE",
});

AnimeDetail.hasMany(UserSchedule, {
  foreignKey: "anime_detail_id",
  onDelete: "CASCADE",
});

UserSchedule.belongsTo(AnimeDetail, {
  foreignKey: "anime_detail_id",
  onDelete: "CASCADE",
});

User.hasMany(UserSchedule, {
  foreignKey: "user_id",
  onDelete: "CASCADE",
});

UserSchedule.belongsTo(User, {
  foreignKey: "user_id",
  onDelete: "CASCADE",
});

User.hasMany(UserLike, {
  foreignKey: "user_id",
  onDelete: "CASCADE",
});

UserLike.belongsTo(User, {
  foreignKey: "user_id",
  onDelete: "CASCADE",
});

export { User, UserLike, UserSchedule, AnimeDetail };
