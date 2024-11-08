import 'dotenv/config';
import { Sequelize } from "sequelize";

/* For local environment */
// const dbName = process.env.DB_NAME;
// const dbUser = process.env.DB_USERNAME;
// const dbPassword = process.env.DB_PASSWORD;
// const dbHost = process.env.DB_HOST;
// const dbPort = process.env.DB_PORT;

const sequelize = new Sequelize(
    /* Render environment */
    process.env.DATABASE_URL,
    {
        // host: dbHost,
        dialect: 'postgres',
        // port: dbPort,
        // username: dbUser,
        // database: dbName,
        // password: dbPassword,
        logging: false,
        define: {
            timestamps: false
        },
        // SSL:
        dialectOptions: {
            require: true,
            rejectUnauthorized: false
        }
    });

export { sequelize };
