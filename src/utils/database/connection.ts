import { Sequelize } from 'sequelize';
import { type Options } from 'sequelize';
import { CONFIG } from '../../config';

const connectionOptions: Options = {
    dialect: "mysql",
    host: 'localhost',
    database: CONFIG.DB_NAME,
    username: CONFIG.USERNAME_DB,
    password: CONFIG.PASSWORD_DB,
    pool: { max: 120, min: 0, acquire: 120000, idle: 10000 },
    dialectOptions: {
        connectTimeout: 60000
    }
}
const connection = new Sequelize(connectionOptions)

export default connection;