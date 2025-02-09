import connection from "./utils/database/connection";
import "./utils/database";

async function syncDatabase() {
  console.log("Syncronizing database.....");
  await connection.sync({ alter: true });
  process.exit();
  console.log("Process done.....");
}

syncDatabase();
