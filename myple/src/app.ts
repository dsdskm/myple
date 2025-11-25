import express, { Application, Request, Response } from 'express';
import dotenv from 'dotenv';
import placeRouter from './router/place.router';
import accountRouter from "./router/account.router"

// .env 파일의 환경 변수를 로드합니다.
dotenv.config();

// Firebase 초기화 코드를 import하여 실행되도록 합니다.
import './config/firebase';
import cors from 'cors';

const app: Application = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors())
app.use(express.json()); // JSON 요청 본문을 파싱하기 위해 필요
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req: Request, res: Response) => {
    res.send('Welcome to the myple API Server!');
});

app.use('/account', accountRouter);
app.use('/place', placeRouter);

// 서버 시작
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
