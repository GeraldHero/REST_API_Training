import express from "express";
import http from "http";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import compression from "compression";
import cors from "cors";
import mongoose from "mongoose";
import "dotenv/config";

import router from "./router";

const app = express();
app.use(
  cors({
    credentials: true,
  })
);

app.use(compression());
app.use(cookieParser());
app.use(bodyParser.json());

const server = http.createServer(app);
const PORT = process.env.PORT;
server.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});

mongoose.Promise = Promise;
mongoose
  .connect(process.env.MONGO_URL)
  .then((res) => {
    console.log("Connected to Database");
  })
  .catch((err) => {
    console.log(
      `Initial Distribution API Database connection error occured -`,
      err
    );
  });

app.use("/", router());
