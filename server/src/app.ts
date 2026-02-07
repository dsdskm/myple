import express, { Application, NextFunction, Request, Response } from "express";
import dotenv from "dotenv";
import infoRouter from "./router/info.router";
import placeRouter from "./router/place.router";
import categoryRouter from "./router/category.router";
import accountRouter from "./router/account.router";
import productRouter from "./router/product.router";
import tossRouter from "./router/toss.router";
import fileRouter from "./router/file.router";
import scriptRouter from "./router/script.router";
import logRouter from "./router/log.router";
import billRouter from "./router/bill.router";
import noticeRouter from "./router/notice.router";
// .env 파일의 환경 변수를 로드합니다.
dotenv.config();

// Firebase 초기화 코드를 import하여 실행되도록 합니다.
import "./config/firebase";
import cors from "cors";
import { getLocal192IP } from "./common/utils";

const app: Application = express();
const port = process.env.PORT || 3000;
const API_KEY = process.env.API_KEY ?? "";

const apiKeyMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // ① 헤더에서 가져오기
  const headerKey = req.header("x-api-key");

  // ② 쿼리스트링에서 가져오기 (예: /api?key=abcde)
  const queryKey = req.query.key as string | undefined;

  const providedKey = headerKey ?? queryKey;

  if (providedKey && providedKey === API_KEY) {
    // 키가 유효하면 다음 미들웨어/라우터로 진행
    return next();
  }

  // 키가 없거나 일치하지 않을 때
  res.status(401).json({
    success: false,
    message: "Invalid or missing API key",
  });
};

// Middleware
app.use(cors());
app.use(express.json()); // JSON 요청 본문을 파싱하기 위해 필요
app.use(express.urlencoded({ extended: true }));
app.use(apiKeyMiddleware);
// Routes
app.get("/", (req: Request, res: Response) => {
  res.send("Welcome to the myple API Server!");
});

app.use("/info", infoRouter);
app.use("/account", accountRouter);
app.use("/place", placeRouter);
app.use("/category", categoryRouter);
app.use("/toss", tossRouter);
app.use("/product", productRouter);
app.use("/file", fileRouter);
app.use("/script", scriptRouter);
app.use("/bill", billRouter);
app.use("/notice", noticeRouter);
app.use("/log", logRouter);

// 서버 시작
app.listen(port, () => {
  console.log(`Server is running at ${getLocal192IP()}:${port}`);
});
