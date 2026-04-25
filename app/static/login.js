const loginForm = document.getElementById('loginForm');
const passwordInput = document.getElementById('passwordInput');
const errorMsg = document.getElementById('errorMsg');
const langToggle = document.getElementById('langToggle');

function applyTranslations() {
    document.documentElement.lang = currentLang === 'zh' ? 'zh-CN' : 'en';
    document.querySelectorAll('[data-i18n]').forEach(el => {
        el.textContent = t(el.getAttribute('data-i18n'));
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        el.placeholder = t(el.getAttribute('data-i18n-placeholder'));
    });
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
        el.title = t(el.getAttribute('data-i18n-title'));
    });
    document.title = t('loginTitle');
    langToggle.textContent = currentLang === 'zh' ? 'EN' : '中文';
}

langToggle.addEventListener('click', () => {
    toggleLanguage();
    applyTranslations();
});

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const password = passwordInput.value.trim();

    if (!password) {
        showError(t('passwordRequired'));
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
            window.location.reload();
        } else {
            const data = await res.json();
            showError(data.detail === '密码错误' ? t('wrongPassword') : (data.detail || t('loginFailed')));
        }
    } catch (err) {
        showError(t('networkError'));
    }
});

function showError(msg) {
    errorMsg.textContent = msg;
    errorMsg.style.display = 'block';
    setTimeout(() => {
        errorMsg.style.display = 'none';
    }, 3000);
}

applyTranslations();
passwordInput.focus();
