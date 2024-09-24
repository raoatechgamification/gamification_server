import { Sequelize } from "sequelize";
import dotenv from 'dotenv';

dotenv.config();

const database = process.env.DB_DATABASE;
const user = process.env.DB_USERNAME;
const password = process.env.DB_PASSWORD;
const host = process.env.DB_HOST;

if (!database || !user || !password) {
  throw new Error(
    "Missing required environment variables for database connection."
  );
}

const sequelize = new Sequelize(database, user, password, {
  host: host,
  dialect: "postgres",
});

sequelize
  .authenticate()
  .then(() => console.log("Connection has been established successfully."))
  .catch((error: any) =>
    console.log("Unable to connect to the database:", error)
  );

export default sequelize;
