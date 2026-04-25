const loginForm = document.getElementById('loginForm');
const passwordInput = document.getElementById('passwordInput');
const errorMsg = document.getElementById('errorMsg');

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const password = passwordInput.value.trim();

    if (!password) {
        showError('请输入密码');
        return;
    }

    try {
        const res = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password }),
            cache: 'no-store',
            credentials: 'same-origin'
        });

        if (res.ok) {
            // 用reload而不是href，强制刷新验证cookie
            window.location.reload();
        } else {
            const data = await res.json();
            showError(data.detail || '登录失败');
        }
    } catch (err) {
        showError('网络错误，请重试');
    }
});

function showError(msg) {
    errorMsg.textContent = msg;
    errorMsg.style.display = 'block';
    setTimeout(() => {
        errorMsg.style.display = 'none';
    }, 3000);
}

passwordInput.focus();
