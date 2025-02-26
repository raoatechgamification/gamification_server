import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import express, { Application, NextFunction, Request, Response } from "express";
// import connectDB from "./config/db";
import routes from "./routes/index.routes";
import logger from "./utils/logger";

import request from "request";
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
app.use(express.json({ limit: "5000mb" }));

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
    message: "Welcome to Gamification API V1.",
  });
});

app.post("/sendMessage", (req, res) => {
  let resData = {
    status: false,
    answare: "",
    respondData: {},
  };
  try {
    const options = {
      method: "POST",
      url: "https://graph.facebook.com/v22.0/532308433307074/messages",
      headers: {
        Authorization:
          "Bearer EAASuIZBZCyC9wBO55cFhZB9o1QZAlVkboz8K4dYGzlAG2N24nMYUEgbsgdHoDsOze8vfV1FmtqIsVwJKNZBSKfJd79ZCpyW9pM4AseF7WCQUFzxVAVbM0rcHyVHfgWHBLRteOoOmL4rRH5KuzKvAQXZCq9r1PzlzrC2rh9iV03xtUp7SDvNw0UWUa7dPp5sHlMZBDGyTfER4nQORfLYd78NDhRsyqyEZD",
        "Content-Type": "application/json",
      },
      body: {
        messaging_product: "whatsapp",
        to: process.env.TO,
        type: "template",
        template: {
          name: "hello_world",
          language: {
            code: "en_US",
          },
        },
      },
      json: true,
    };
    request(options, function (error, response, body) {
      if (error) throw new Error(error);
      //+++++++++++++++++++++++++++++++++++++++++++++
      resData.status = true;
      resData.respondData = body;
      return res.status(200).json(resData);
    });
  } catch (e) {
    resData.status = false;
    resData.answare = e instanceof Error ? e.message : String(e);
    return res.status(200).json(resData);
  }
});

// app.use("/api/v1", require("./routes/index.routes"));
app.use("/api/v1", routes);

export default app;
