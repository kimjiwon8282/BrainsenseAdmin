document.addEventListener('DOMContentLoaded', function () {
  const savedEmail = localStorage.getItem('verifiedEmail');
  const emailInput = document.getElementById('email');
  const signupForm = document.getElementById('signupForm');
  const verifyForm = document.getElementById('verifyForm');
  const emailVerification = document.getElementById('emailVerification');
  const registrationForm = document.getElementById('registrationForm');

  // 인증된 이메일이 있다면 회원가입 폼을 보이게
  if (savedEmail && emailInput) {
    emailVerification.style.display = 'none'; // 인증 폼 숨기기
    registrationForm.style.display = 'block'; // 회원가입 폼 보이기
    emailInput.value = savedEmail; // 이메일 자동 입력
    enableRegistrationForm(); // 입력 필드 활성화
  } else {
    // 이메일 인증이 안되었으면 이메일 인증 폼만 보이게
    emailVerification.style.display = 'block';
    registrationForm.style.display = 'none';
  }

  // 이메일 인증 요청
  const emailForm = document.getElementById('emailForm');
  if (emailForm) {
    emailForm.addEventListener('submit', async function (event) {
      event.preventDefault();
      const email = document.getElementById('email').value;
      const response = await fetch('/signup/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        const emailMessage = document.getElementById('emailMessage');
        if (emailMessage) emailMessage.style.display = 'block';
        if (verifyForm) verifyForm.style.display = 'block';
        emailInput.disabled = true;
      } else {
        alert('이메일 전송 실패');
      }
    });
  }

  // 이메일 인증 코드 확인
  if (verifyForm) {
    verifyForm.addEventListener('submit', async function (event) {
      event.preventDefault();
      const emailInput = document.getElementById('email');
      const codeInput = document.getElementById('verificationCode');
      const email = emailInput.value.trim();
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
        emailVerification.style.display = 'none'; // 인증 폼 숨기기
        registrationForm.style.display = 'block'; // 회원가입 폼 보이기
        enableRegistrationForm(); // 입력 필드 활성화
      } else {
        alert(result.message || '인증 코드가 올바르지 않습니다.');
      }
    });
  }

  // 회원가입 요청
  if (signupForm) {
    signupForm.addEventListener('submit', async function (event) {
      event.preventDefault();

      const account = document.getElementById('account').value;
      const username = document.getElementById('username').value;
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      const phoneNumber = document.getElementById('phoneNumber').value;

      const response = await fetch('/signup/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          account,
          username,
          email,
          password,
          phoneNumber,
        }),
      });

      if (response.ok) {
        alert('관리자가 승인 중입니다.!');
        window.location.href = '/login';
      } else {
        alert('회원가입 실패: ' + result.message);
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
