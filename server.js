require('dotenv').config(); // 환경 변수 로드
const express = require('express');
const path = require('path');
const dbConnect = require('./config/dbConnect'); // 데이터베이스 연결 함수 불러오기
const orderRoutes = require('./routes/userOrderRoutes'); // 주문 관련 라우트 추가
const productRoutes = require('./routes/productRoutes');
const companyRoutes = require('./routes/companyRoutes');
const csRoutes = require('./routes/csRoutes');

const app = express();
const port = 8080;

dbConnect(); // MongoDB 연결

// EJS 설정
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.json()); // JSON 요청을 처리하는 미들웨어
app.use(express.urlencoded({ extended: true })); // 폼 데이터 파싱

// **📌 주문 관련 라우트 (routes/orderRoutes.js에서 관리)**
app.use(orderRoutes); // routes/orderRoutes.js의 API 라우트 불러오기

app.use('/product', productRoutes);
app.use('/company', companyRoutes);
app.use('/cs', csRoutes);

app.get('/home', (req, res) => {
  res.send('사용자 메인페이지');
});

app.get('/tech', (req, res) => {
  res.send('tech페이지');
});

app.listen(port, () => {
  console.log(`main server listening on port ${port}`);
});

const dbDisconnect = require('./config/dbDisconnect');
process.on('SIGINT', async () => {
  console.log('SIGINT signal received: closing MongoDB connection');
  await dbDisconnect();
  process.exit(0);
});
