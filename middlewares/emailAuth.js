//이메일 인증 미들웨어 - 이메일 인증 코드 사용
const smtpTransport = require('../config/mailer');

const verificationCodes = new Map();

const sendVerification = async (req, res) => {
  try {
    const { email } = req.body;
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    console.log(`생성된 인증 코드: ${code}`);

    verificationCodes.set(email, code);
    setTimeout(() => {
      verificationCodes.delete(email);
    }, 5 * 60 * 1000);

    const mailOptions = {
      from: process.env.MAIL_USER,
      to: email,
      subject: '이메일 인증코드',
      text: `인증번호: ${code} (5분 내에 입력해주세요)`,
    };

    await smtpTransport.sendMail(mailOptions);
    res.status(200).json({ message: '이메일 인증 요청이 전송되었습니다.' });
  } catch (error) {
    res.status(500).json({
      message: '이메일 전송 중 오류가 발생했습니다.',
      error: error.message,
    });
  }
};

//이메일 인증코드 검증
const verifyEmailCode = async (req, res) => {
  try {
    console.log(`🔍 [SERVER] 요청된 데이터:`, req.body);

    const { email, code } = req.body;

    if (!email || !code) {
      console.error(`❌ [SERVER] 이메일 또는 코드가 누락됨`);
      return res
        .status(400)
        .json({ message: '이메일과 인증 코드를 입력하세요' });
    }

    console.log(
      `🔍 [SERVER] 인증 코드 검증 요청: email=${email}, 입력 코드=${code}`
    );

    const storedCode = verificationCodes.get(email);

    console.log(
      `🧐 [SERVER] 저장된 인증 코드: ${storedCode} (type: ${typeof storedCode})`
    );

    if (!storedCode) {
      console.error(`❌ [SERVER] 인증 코드 없음: ${email}`);
      return res
        .status(400)
        .json({ message: '인증 코드가 만료되었거나 요청되지 않았습니다.' });
    }

    if (storedCode != code) {
      console.error(
        `❌ [SERVER] 인증 코드 불일치! 저장된 코드: ${storedCode}, 입력된 코드: ${code}`
      );
      return res
        .status(400)
        .json({ message: '인증 코드가 올바르지 않습니다.' });
    }

    verificationCodes.delete(email);
    console.log(`✅ [SERVER] 인증 성공: ${email}`);

    res.status(200).json({ message: '이메일 인증이 완료되었습니다.' });
  } catch (error) {
    console.error(`❌ [SERVER] 인증 처리 오류: ${error.message}`);
    res.status(500).json({ message: '서버 오류 발생', error: error.message });
  }
};

module.exports = { sendVerification, verifyEmailCode };
