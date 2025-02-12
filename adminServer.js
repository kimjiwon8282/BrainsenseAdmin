require('dotenv').config(); // 환경 변수 로드
const express = require('express');
const path = require('path');
const dbConnect = require('./config/dbConnect'); // 데이터베이스 연결 함수 불러오기
const orderRoutes = require('./routes/adminOrderRoutes'); // 주문 관련 라우트 추가

const app = express();
const PORT = 8081;

dbConnect(); // MongoDB 연결

// EJS 설정
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));


app.use(express.json()); // JSON 요청을 처리하는 미들웨어
app.use(express.urlencoded({ extended: true })); // 폼 데이터 파싱


// 라우트 설정
app.get('/main', (req, res) => {
    res.render('admin_main');
});

app.get('/admin_crud', (req, res) => {
    res.render('admin_crud');
});

app.get('/admin_list', (req, res) => {
    res.render('admin_list');
});

app.get('/admin_statistics', (req, res) => {
    res.render('admin_statistics');
});

app.get('/logout', (req, res) => {
    res.render('admin_login');
});

// **📌 주문 관련 라우트 (routes/orderRoutes.js에서 관리)**
app.use(orderRoutes); // routes/orderRoutes.js의 API 라우트 불러오기

// 서버 실행
app.listen(PORT, () => {
    console.log(`서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
});
