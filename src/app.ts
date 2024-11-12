import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import bodyParser from "body-parser";
// import connectDB from "./config/db";
import logger from "./utils/logger";
import routes from "./routes/index.routes";


dotenv.config();

const app: Application = express();

// connectDB();

app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use((req: Request, res: Response, next: NextFunction) => {
  res.on("finish", () => {
    const logMessage = `${req.method} ${req.url} ${res.statusCode}`;

    if (Object.keys(req.query).length) {
      logger.info(`${logMessage} - Query Params: ${JSON.stringify(req.query)}`);
    }

    if (req.body && Object.keys(req.body).length > 0) {
      logger.info(`${logMessage} - Request Body: ${JSON.stringify(req.body)}`);
    } else {
      logger.info(logMessage);
    }
  });
  next();
});

app.get("/", (req: Request, res: Response) => {
  res.json({
    success: true,
    message: "Welcome to Gamification API V1",
  });
});

// app.use("/api/v1", require("./routes/index.routes"));
app.use("/api/v1", routes);

export default app;
