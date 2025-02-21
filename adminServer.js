require('dotenv').config(); // 환경 변수 로드
const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');
const cors = require('cors'); // CORS 에러 방지를 위해 추가
const dbConnect = require('./config/dbConnect'); // 데이터베이스 연결 함수 불러오기

// 라우트 불러오기
const orderRoutes = require('./routes/adminOrderRoutes'); // 주문 관련 라우트
const postRoutes = require('./routes/postRoutes'); // 게시글 관련 라우트
const adminRegister = require('./routes/adminRegister'); // 회원가입 라우트
const adminApprove = require('./routes/adminApprove'); // 관리자 승인 라우트
const adminSendmail = require('./routes/adminSendmail'); // 메일 발송 라우트
const adminLogin = require('./routes/adminLogin'); // 로그인 라우트

// 미들웨어 불러오기 (로그인 필요)
const loginAuthMiddleware = require('./middlewares/loginAuth');

// 이메일 인증 미들웨어
const {
  sendVerification,
  verifyEmailCode,
} = require('./middlewares/emailAuth');

const app = express();
const PORT = 8081;

// MongoDB 연결
dbConnect();

// EJS 설정
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 정적 파일 제공
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));
app.use(cors());

// 요청 바디/쿠키 파서
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

/* =======================
   [공개 (Public) 라우트]
   회원가입, 관리자 승인, 로그인, 이메일 관련 페이지/기능은 인증 없이 접근 가능
========================= */

// 회원가입 관련
app.use('/signup', adminRegister);

// 관리자 승인 관련
app.use('/admin', adminApprove);

// 로그인 라우트 (GET /admin/login, POST /admin/login)
app.use('/admin', adminLogin);

// 메일 발송 관련
app.use('/admin/sendMail', adminSendmail);

// 회원가입 폼 페이지
app.get('/register', (req, res) => {
  res.render('admin_register');
});

// 이메일 인증 API
app.post('/signup/email', sendVerification);
app.post('/signup/email/verify', verifyEmailCode);

/* =======================
   [인증이 필요한(Private) 라우트]
   아래 라우트들은 로그인 후에만 접근 가능함
========================= */

// loginAuthMiddleware를 전역 미들웨어로 적용 (이 아래의 라우트들은 모두 인증 필요)
app.use(loginAuthMiddleware);

app.get('/', (req, res) => {
  res.redirect('/main');
});

app.get('/main', (req, res) => {
  console.log('✅ /main 요청 - 인증된 사용자:', req.admin);
  res.render('admin_main', { admin: req.admin });
});

// 통계 페이지
app.get('/admin_statistics', (req, res) => {
  res.render('admin_statistics');
});

// 게시글 관련 라우트
app.use(postRoutes);

// 주문 관련 라우트
app.use(orderRoutes);

//로그아웃
app.get('/admin/logout', loginAuthMiddleware, (req, res) => {
  res.clearCookie('token', { httpOnly: true, secure: false });
  console.log('토큰 삭제됨. - 로그아웃 완료');
  res.redirect('/admin/login');
});

// 서버 실행
app.listen(PORT, () => {
  console.log(`서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
});
