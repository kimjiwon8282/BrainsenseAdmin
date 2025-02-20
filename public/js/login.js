document.getElementById('loginForm').addEventListener('submit', async (event) => {
    event.preventDefault(); // 폼의 기본 제출 동작 막기
    
    const account = document.getElementById('account').value.trim();
    const password = document.getElementById('password').value.trim();

    try {
        // 서버에 로그인 요청 (POST)
        const response = await fetch('/admin/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            // 쿠키를 주고받기 위해 필요
            credentials: 'include',
            body: JSON.stringify({ account, password })
        });

        if (!response.ok) {
            // 로그인 실패 시 에러 메시지 표시
            const errorData = await response.json();
            alert(errorData.message || '로그인에 실패했습니다.');
            return;
        }

        // 로그인 성공 시 관리자 메인 페이지로 이동
        window.location.href = '/main';
    } catch (error) {
        console.error('로그인 중 오류:', error);
        alert('로그인 처리 중 오류가 발생했습니다.');
    }
});