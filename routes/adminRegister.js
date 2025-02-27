//관리자 회원가입 라우트
const express = require('express');
const { registerAdmin } = require('../middlewares/registerMail');
const {
  sendVerification,
  verifyEmailCode,
} = require('../middlewares/emailAuth');
const validateSignup = require('../middlewares/registerForm');
const router = express.Router();

//JSON 파싱을 위한 미들웨어 추가
router.use(express.json());

//이메일 인증 요청
router.post('/signup/email', sendVerification);
//이메일 인증 코드 검증 요청
router.post('/signup/email/verify', verifyEmailCode);
//관리자 회원가입
router.post('/admin', validateSignup, registerAdmin);

module.exports = router;
