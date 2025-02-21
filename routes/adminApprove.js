//관리자 승인 관련 라우터 - /admin/approve
const express = require('express');
const Admin = require('../models/admin');
const smtpTransport = require('../config/mailer');
const router = express.Router();

router.get('/approve', async (req, res) => {
  try {
    const { email } = req.query;

    //사용자 승인 - approved : true 상황
    const updatedAdmin = await Admin.findOneAndUpdate(
      { email },
      { approved: true },
      { new: true }
    );

    if (!updatedAdmin) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }

    //승인된 관리자에게 이메일 전송
    const mailOptions = {
      from: process.env.MAIL_USER,
      to: email,
      subject: '관리자 계정 승인 완료',
      html: `<p>안녕하세요, ${updatedAdmin.username}님.<p>
      <p>귀하의 관리자 계정이 승인되었습니다. 이제 로그인 할 수 있습니다.<p>
      <a href="http://localhost:8081/admin/login">로그인하러 가기</a>`,
    };

    await smtpTransport.sendMail(mailOptions);

    res.render('admin_approve', { email });
  } catch (error) {
    console.log('관리자 승인 요청 오류');
    res.status(500).json({ message: '서버 오류 발생', error: error.message });
  }
});

module.exports = router;
