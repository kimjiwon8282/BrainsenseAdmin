//회원가입 관련
document.addEventListener('DOMContentLoaded', function () {
  // 이메일 인증 여부 확인
  const email = localStorage.getItem('verifiedEmail'); // localStorage에서 인증된 이메일 확인

  // 인증된 이메일이 없다면 /verify-email로 리디렉션
  if (!email) {
    window.location.href = '/verify-email'; // 인증되지 않은 이메일이라면 /verify-email로 리디렉션
  }

  const emailForm = document.getElementById('emailForm');
  const verifyForm = document.getElementById('verifyForm');

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
        document.getElementById('emailMessage').style.display = 'block';
        if (verifyForm) verifyForm.style.display = 'block';
        document.getElementById('email').disabled = true;
      } else {
        alert('이메일 전송 실패');
      }
    });
  }

  // 인증 코드 검증
  if (verifyForm) {
    verifyForm.addEventListener('submit', async function (event) {
      event.preventDefault();

      const email = document.getElementById('email').value;
      const code = document.getElementById('verificationCode').value;

      const response = await fetch('/signup/email/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });

      const result = await response.json();

      if (response.ok) {
        alert('이메일 인증 완료');
        localStorage.setItem('verifiedEmail', email); // 인증된 이메일을 localStorage에 저장
        window.location.href = '/register'; // 인증 후 /register 페이지로 리디렉션
      } else {
        alert(result.message || '인증 코드가 올바르지 않습니다.');
      }
    });
  }
});

document.addEventListener('DOMContentLoaded', function () {
  const signupForm = document.getElementById('signupForm');

  if (signupForm) {
    signupForm.addEventListener('submit', async function (event) {
      event.preventDefault();

      const account = document.getElementById('account').value;
      const username = document.getElementById('username').value;
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      const phoneNumber = document.getElementById('phoneNumber').value;

      try {
        //회원가입 요청
        const response = await fetch('/register', {
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
          alert('관리자가 승인하면 로그인할 수 있습니다.');

          //관리자 승인 요청 메일 전송
          try {
            const mailResponse = await fetch('/admin/sendmail', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email, username, account }),
            });

            const mailResult = await mailResponse.json();
            console.log(`관리자 승인 요청 결과:`, mailResult);

            if (mailResponse.ok) {
              alert('관리자에게 승인 요청이 전송되었습니다.');
            } else {
              alert('승인 요청 이메일 전송 실패');
            }
          } catch (mailError) {
            console.error('이메일 전송 오류:', mailError);
          }

          window.location.href = '/logout';
        } else {
          alert('회원가입 실패: ' + result.message);
        }
      } catch (error) {
        console.error('회원가입 요청 중 오류 발생:', error);
        alert('서버 오류 발생: ' + error.message);
      }
    });
  }
});
