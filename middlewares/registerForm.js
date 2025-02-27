//회원가입 양식 관련 미들웨어
const user = require('../models/admin');

const validateSignup = async (req, res, next) => {
  const { account, username, email, password, phoneNumber } = req.body;

  if (!account || !username || !email || !password || !phoneNumber) {
    return res.status(400).json({ message: '모든 필드를 입력해주세요' });
  }

  //아이디 형식 확인 - 숫자 문자 포함 6-12자리
  const accountRex = /^[a-zA-Z0-9]{6,12}$/;
  if (!accountRex.test(account)) {
    return res.status(400).json({
      message:
        '아이디는 문자와 숫자를 포함한 6자리 이상 12자리 이하로 입력해주세요',
    });
  }
  //아이디 중복 확인
  const existingUser = await user.findOne({ account });
  if (existingUser) {
    return res.status(403).json({ message: '이미 사용중인 아이디입니다.' });
  }

  //비밀번호 형식 확인 - 문자, 숫자, 특수문자 포함 8-18자리
  const passwordRegex =
    /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,18}$/;
  if (!passwordRegex.test(password)) {
    return res.status(400).json({
      message:
        '비밀번호는 문자, 숫자, 특수문자를 포함한 8자리 이상 18자리 이하로 입력해주세요',
    });
  }
  //핸드폰 번호 확인
  const phoneRegex = /^010-\d{4}-\d{4}$/;
  if (!phoneRegex.test(phoneNumber)) {
    return res.status(400).json({
      message: '올바른 휴대폰을 입력하세요',
    });
  }

  //핸드폰 번호 중복 확인
  const existingPhone = await user.findOne({ phoneNumber });
  if (existingPhone) {
    return res.status(403).json({ message: '이미 등록된 핸드폰 번호입니다.' });
  }

  next();
};

module.exports = validateSignup;
