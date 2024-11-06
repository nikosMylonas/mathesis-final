import 'dotenv/config';
import { Sequelize } from "sequelize";

const dbName = process.env.DB_NAME;
const dbUser = process.env.DB_USERNAME;
const dbPassword = process.env.DB_PASSWORD;
const dbHost = process.env.DB_HOST;
const dbPort = process.env.DB_PORT;

const sequelize = new Sequelize({
    host: dbHost,
    dialect: 'postgres',
    port: dbPort,
    username: dbUser,
    database: dbName,
    password: dbPassword,
    logging: false,
    define: {
        timestamps: false
    }
});

export { sequelize };
