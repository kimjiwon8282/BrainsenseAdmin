//회원가입 이메일 전송 미들웨어
const Admin = require('../models/admin');
const bcrypt = require('bcryptjs');
const smtpTransport = require('../config/mailer');

const registerAdmin = async (req, res) => {
  try {
    const { account, username, email, password, phoneNumber } = req.body;

    if (!account || !username || !email || !password || !phoneNumber) {
      return res.status(400).json({ message: '모든 필드를 입력해주세요' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = new Admin({
      account,
      username,
      email,
      password: hashedPassword,
      phoneNumber,
      approved: false,
    });

    await newAdmin.save();

    // 관리자 승인 요청 이메일 전송
    const adminEmail = process.env.ADMIN_EMAIL;
    const mailOptions = {
      from: process.env.MAIL_USER,
      to: adminEmail,
      subject: '새로운 관리자 회원가입 요청',
      html: `<p>새로운 관리자 가입 요청</p>
                 <p>이메일: ${email}</p>
                 <p>사용자명: ${username}</p>
                 <p>Account ID: ${account}</p>
                 <p>전화번호: ${phoneNumber}</p>
                 <a href="http://localhost:8081/admin/approve?email=${email}">승인하기</a>`,
    };
    console.log('관리자 승인 요청 이메일 전송 중');

    await smtpTransport.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log('이메일 전송 오류', error);
        return res
          .status(500)
          .json({ message: '이메일 전송 실패', error: error.message });
      } else {
        console.log(`이메일 전송 성공`, info.response);
        return res.status(201).json({
          message: '승인 요청이 완료되었습니다. 관리자의 승인을 기다리쇼',
        });
      }
    });
  } catch (error) {
    console.error(`회원가입 오류: ${error.message}`);
    return res
      .status(500)
      .json({ message: '서버 오류 발생', error: error.message });
  }
};

module.exports = { registerAdmin };
