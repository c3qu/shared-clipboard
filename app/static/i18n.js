const translations = {
    zh: {
        // Common
        appTitle: '共享剪贴板',
        copied: '已复制到剪贴板',

        // Login page
        loginTitle: '登录 - 共享剪贴板',
        loginPasswordLabel: '请输入访问密码',
        loginPasswordPlaceholder: '请输入密码',
        loginButton: '登录',
        passwordRequired: '请输入密码',
        loginFailed: '登录失败',
        wrongPassword: '密码错误',
        networkError: '网络错误，请重试',

        // Main page
        clearAll: '🗑️ 清空全部',
        contentPlaceholder: '在此输入或粘贴内容，按 Ctrl+Enter 提交...',
        pasteButton: '📋 从剪贴板粘贴',
        uploadFile: '📎 上传文件',
        addButton: '添加',
        uploading: '上传中...',
        loading: '加载中...',
        confirmClearAll: '确定要清空所有内容吗？此操作不可恢复！',
        clearedAll: '已清空所有内容',
        contentAdded: '内容已添加',
        uploadSuccess: '文件上传成功',
        uploadFailed: '上传失败',
        downloadStart: '开始下载',
        pleaseInputContent: '请输入内容',
        pastedToInput: '已粘贴到输入框',
        clipboardEmpty: '剪贴板为空',
        cannotReadClipboard: '无法读取剪贴板，请按 Ctrl+V',
        noContent: '📋 暂无内容',
        noContentHint: '在输入框中输入内容，或上传文件',

        // Time format
        justNow: '刚刚',
        minutesAgo: '分钟前',
        hoursAgo: '小时前',
    },
    en: {
        // Common
        appTitle: 'Shared Clipboard',
        copied: 'Copied to clipboard',

        // Login page
        loginTitle: 'Login - Shared Clipboard',
        loginPasswordLabel: 'Enter access password',
        loginPasswordPlaceholder: 'Enter password',
        loginButton: 'Login',
        passwordRequired: 'Please enter password',
        loginFailed: 'Login failed',
        wrongPassword: 'Wrong password',
        networkError: 'Network error, please try again',

        // Main page
        clearAll: '🗑️ Clear All',
        contentPlaceholder: 'Type or paste content here, press Ctrl+Enter to submit...',
        pasteButton: '📋 Paste from Clipboard',
        uploadFile: '📎 Upload File',
        addButton: 'Add',
        uploading: 'Uploading...',
        loading: 'Loading...',
        confirmClearAll: 'Are you sure you want to clear all content? This cannot be undone!',
        clearedAll: 'All content cleared',
        contentAdded: 'Content added',
        uploadSuccess: 'File uploaded successfully',
        uploadFailed: 'Upload failed',
        downloadStart: 'Download started',
        pleaseInputContent: 'Please input content',
        pastedToInput: 'Pasted to input',
        clipboardEmpty: 'Clipboard is empty',
        cannotReadClipboard: 'Cannot read clipboard, please press Ctrl+V',
        noContent: '📋 No Content',
        noContentHint: 'Type content in the input box or upload a file',

        // Time format
        justNow: 'just now',
        minutesAgo: 'min ago',
        hoursAgo: 'h ago',
    }
};

let currentLang = localStorage.getItem('lang') || 'zh';

function t(key) {
    return translations[currentLang][key] || key;
}

function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('lang', lang);
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
}

function toggleLanguage() {
    setLanguage(currentLang === 'zh' ? 'en' : 'zh');
    return currentLang;
}

function formatTime(isoString) {
    const date = new Date(isoString);
    const now = new Date();
    const diff = now - date;

    if (diff < 60000) return t('justNow');
    if (diff < 3600000) return `${Math.floor(diff / 60000)} ${t('minutesAgo')}`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} ${t('hoursAgo')}`;

    const locale = currentLang === 'zh' ? 'zh-CN' : 'en-US';
    return date.toLocaleDateString(locale, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}
