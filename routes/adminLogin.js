require('dotenv').config();
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs'); // bcryptjs
const jwt = require('jsonwebtoken');
const Admin = require('../models/admin');

router.post('/login', async (req, res) => {
  try {
    const { account, password } = req.body;

    // 1) DB에서 해당 계정 조회
    const admin = await Admin.findOne({ account });
    if (!admin) {
      return res.status(401).json({ message: '존재하지 않는 계정입니다.' });
    }

    // 2) 비밀번호 비교
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: '비밀번호가 일치하지 않습니다.' });
    }

    // 3) 승인(approved) 여부 확인
    if (!admin.approved) {
      return res.status(403).json({ message: '관리자 승인이 필요합니다.' });
    }

    // 4) JWT 생성
    const token = jwt.sign(
      { adminId: admin._id },
      process.env.JWT_SECRET, // .env에 JWT_SECRET 설정
      { expiresIn: '1h' }
    );

    // 5) httpOnly 쿠키 설정
    res.cookie('token', token, {
      httpOnly: true,    // JS로 쿠키 접근 불가 -> 보안 향상
      secure: false,     // HTTPS 사용 시 true 권장
      maxAge: 60 * 60 * 1000 // 1시간
    });

    // 6) 성공 응답
    return res.json({ message: '로그인 성공' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: '서버 오류' });
  }
});

// GET 라우트: 로그인 페이지 렌더링
router.get('/login', (req, res) => {
    res.render('admin_login');
  });

module.exports = router;
