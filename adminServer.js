require('dotenv').config(); // 환경 변수 로드
const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');
const cors = require('cors'); // CORS 에러 방지를 위해 추가
const dbConnect = require('./config/dbConnect'); // 데이터베이스 연결 함수 불러오기
const orderRoutes = require('./routes/adminOrderRoutes'); // 주문 관련 라우트 추가
const postRoutes = require('./routes/postRoutes'); //게시글 관련 라우트 추가
const authRoutes = require('./routes/auth');
const adminRegister = require('./routes/adminRegister');
const adminApprove = require('./routes/adminApprove');
const adminSendmail = require('./routes/adminSendmail');
const {
  sendVerification,
  verifyEmailCode,
} = require('./middlewares/emailAuth');
const adminAuth = require('./middlewares/adminAuth');

const app = express();
const PORT = 8081;

dbConnect(); // MongoDB 연결

// EJS 설정
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));
app.use(cors()); // 프론트엔드와 통신할 때 필요한 경우 추가


app.use(express.json()); // JSON 요청을 처리하는 미들웨어
app.use(express.urlencoded({ extended: true })); // 폼 데이터 파싱
app.use(cookieParser());


//로그인 관련 라우터
app.use('/auth', authRoutes);
app.use('/signup', adminRegister); //회원가입
app.use('/admin', adminApprove);
app.use('/admin/sendMail', adminSendmail);

//보호된 경로
app.get('/profile', adminAuth, (req, res) => {
  res.json({ message: '프로필 메시지', admin: req.admin });
});


app.get('/main', (req, res) => {
  console.log('✅ /main 요청 - 인증된 사용자:', req.admin);
  res.render('admin_main');
});


app.get('/admin_statistics', (req, res) => {
  res.render('admin_statistics');
});

app.get('/login', (req, res) => {//로그아웃 후 로그인 페이지로 redirection
  res.render('admin_login');
});

app.get('/register', (req, res) => {//회원가입 관련 페이지
  res.render('admin_register');
});

app.get('/verify-email', (req, res) => {
  res.render('admin_verifyemail');
});

app.post('/signup/email', sendVerification);//이메일 인증 API
app.post('/signup/email/verify', verifyEmailCode);

// **📌 주문 관련 라우트 (routes/orderRoutes.js에서 관리)**
//app.use(orderRoutes); // routes/orderRoutes.js의 API 라우트 불러오기

// **📌 게시글 관련 라우트 (routes/postRoutes.js에서 관리)**
app.use(postRoutes); // routes/postRoutes.js의 API 라우트 불러오기
app.use(orderRoutes); // routes/orderRoutes.js의 API 라우트 불러오기

// 서버 실행
app.listen(PORT, () => {
  console.log(`서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
});

