document.addEventListener('DOMContentLoaded', function () {
  const emailVerificationEmail = document.getElementById(
    'emailVerificationEmail'
  );
  const emailForm = document.getElementById('emailForm');
  const emailMessage = document.getElementById('emailMessage');
  const verifyForm = document.getElementById('verifyForm');
  const registrationForm = document.getElementById('registrationForm');
  const signupForm = document.getElementById('signupForm');

  // 이메일 인증 요청
  if (emailForm) {
    emailForm.addEventListener('submit', async function (event) {
      event.preventDefault();
      const email = emailVerificationEmail.value;
      const response = await fetch('/signup/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        if (emailMessage) emailMessage.style.display = 'block';
        if (verifyForm) verifyForm.style.display = 'block';
        emailVerificationEmail.disabled = true;
      } else {
        alert('이메일 전송 실패');
      }
    });
  }

  // 이메일 인증 코드 확인
  if (verifyForm) {
    verifyForm.addEventListener('submit', async function (event) {
      event.preventDefault();
      const codeInput = document.getElementById('verificationCode');
      const email = emailVerificationEmail.value.trim();
      const code = codeInput.value.trim();

      const response = await fetch('/signup/email/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });

      const result = await response.json();

      if (response.ok) {
        alert('이메일 인증 완료');
        localStorage.setItem('verifiedEmail', email); // 인증된 이메일을 localStorage에 저장
        // 이메일 인증 폼 숨기기, 회원가입 폼 보이기
        document.getElementById('emailVerification').style.display = 'none';
        registrationForm.style.display = 'block';
        // 회원가입 폼의 이메일 입력란에 값을 넣고 비활성화
        const registrationEmail = document.getElementById('registrationEmail');
        if (registrationEmail) {
          registrationEmail.value = email;
          registrationEmail.disabled = true;
        }
        enableRegistrationForm(); // 입력 필드 활성화 (나머지 폼 필드)
      } else {
        alert(result.message || '인증 코드가 올바르지 않습니다.');
      }
    });
  }

  // 회원가입 요청
  if (signupForm) {
    signupForm.addEventListener('submit', async function (event) {
      event.preventDefault();

      // 이미 회원가입 폼의 이메일은 인증된 이메일로 채워져 있음
      const account = document.getElementById('account').value;
      const username = document.getElementById('username').value;
      const registrationEmail =
        document.getElementById('registrationEmail').value;
      const password = document.getElementById('password').value;
      const phoneNumber = document.getElementById('phoneNumber').value;

      const response = await fetch('/signup/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          account,
          username,
          email: registrationEmail,
          password,
          phoneNumber,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        alert('관리자가 승인 중입니다.!');
        window.location.href = '/login';
      } else {
        alert('회원가입 실패: ' + (result.message || '오류가 발생했습니다.'));
      }
    });
  }
});

function enableRegistrationForm() {
  document.getElementById('account').disabled = false;
  document.getElementById('username').disabled = false;
  document.getElementById('password').disabled = false;
  document.getElementById('phoneNumber').disabled = false;
}
