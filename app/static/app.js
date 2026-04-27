const itemsList = document.getElementById('itemsList');
const pasteBtn = document.getElementById('pasteBtn');
const submitBtn = document.getElementById('submitBtn');
const clearBtn = document.getElementById('clearBtn');
const contentInput = document.getElementById('contentInput');
const fileInput = document.getElementById('fileInput');
const uploadProgress = document.getElementById('uploadProgress');
const toast = document.getElementById('toast');
const langToggle = document.getElementById('langToggle');

let items = [];
let ws = null;
let wsReconnectTimer = null;

function connectWebSocket() {
    const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
    ws = new WebSocket(`${protocol}//${location.host}/clipsocket`);

    ws.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data);
            if (data.type === 'update') {
                fetchItems();
            }
        } catch (e) {
            console.error('Failed to parse WebSocket message:', e);
        }
    };

    ws.onclose = () => {
        wsReconnectTimer = setTimeout(connectWebSocket, 3000);
    };

    ws.onerror = () => {
        ws.close();
    };
}

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
    document.title = t('appTitle');
    langToggle.textContent = currentLang === 'zh' ? 'EN' : '中文';
}

async function clearAll() {
    if (!confirm(t('confirmClearAll'))) {
        return;
    }
    try {
        const res = await fetch('/api/items', { method: 'DELETE' });
        if (res.status === 401) {
            handleAuthError();
            return;
        }
        if (res.ok) {
            fetchItems();
            showToast(t('clearedAll'));
        }
    } catch (err) {
        console.error('Failed to clear items:', err);
    }
}

function handleAuthError() {
    window.location.href = '/';
}

async function fetchItems() {
    try {
        const res = await fetch('/api/items');
        if (res.status === 401) {
            handleAuthError();
            return;
        }
        const data = await res.json();
        items = data.items;
        renderItems();
    } catch (err) {
        console.error('Failed to fetch items:', err);
    }
}

async function addItem(content) {
    try {
        const res = await fetch('/api/items', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content })
        });
        if (res.status === 401) {
            handleAuthError();
            return;
        }
        if (res.ok) {
            fetchItems();
            showToast(t('contentAdded'));
        }
    } catch (err) {
        console.error('Failed to add item:', err);
    }
}

async function uploadFile(file) {
    const formData = new FormData();
    formData.append('file', file);

    uploadProgress.style.display = 'block';

    try {
        const res = await fetch('/api/upload', {
            method: 'POST',
            body: formData
        });

        if (res.status === 401) {
            handleAuthError();
            return;
        }

        if (res.ok) {
            fetchItems();
            showToast(t('uploadSuccess'));
        } else {
            const data = await res.json();
            showToast(data.detail || t('uploadFailed'));
        }
    } catch (err) {
        console.error('Failed to upload file:', err);
        showToast(t('uploadFailed'));
    } finally {
        uploadProgress.style.display = 'none';
        fileInput.value = '';
    }
}

async function downloadFile(itemId, filename) {
    try {
        const res = await fetch(`/api/download/${itemId}`);
        if (res.status === 401) {
            handleAuthError();
            return;
        }
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        showToast(t('downloadStart'));
    } catch (err) {
        console.error('Failed to download file:', err);
    }
}

function submitFromInput() {
    const content = contentInput.value.trim();
    if (content) {
        addItem(content);
        contentInput.value = '';
    } else {
        showToast(t('pleaseInputContent'));
    }
}

async function deleteItem(itemId, event) {
    event.stopPropagation();
    try {
        const res = await fetch(`/api/items/${itemId}`, {
            method: 'DELETE'
        });
        if (res.status === 401) {
            handleAuthError();
            return;
        }
        if (res.ok) {
            fetchItems();
        }
    } catch (err) {
        console.error('Failed to delete item:', err);
    }
}

async function copyToClipboard(content) {
    try {
        await navigator.clipboard.writeText(content);
        showToast(t('copied'));
    } catch (err) {
        const textarea = document.createElement('textarea');
        textarea.value = content;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showToast(t('copied'));
    }
}

function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2000);
}

function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / 1024 / 1024).toFixed(1) + ' MB';
    return (bytes / 1024 / 1024 / 1024).toFixed(1) + ' GB';
}

function getFileIcon(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    const icons = {
        pdf: '📄', doc: '📘', docx: '📘', txt: '📝',
        xls: '📗', xlsx: '📗', ppt: '📙', pptx: '📙',
        jpg: '🖼️', jpeg: '🖼️', png: '🖼️', gif: '🖼️',
        zip: '📦', rar: '📦', '7z': '📦', gz: '📦',
        mp3: '🎵', wav: '🎵', mp4: '🎬', avi: '🎬',
        exe: '⚙️', html: '🌐', css: '🎨', js: '⚡'
    };
    return icons[ext] || '📁';
}

function renderItems() {
    if (items.length === 0) {
        itemsList.innerHTML = `
            <div class="empty-state">
                <h2>${t('noContent')}</h2>
                <p>${t('noContentHint')}</p>
            </div>
        `;
        return;
    }

    itemsList.innerHTML = items.map(item => {
        if (item.type === 'file') {
            return `
                <div class="item" onclick="downloadFile('${item.id}', '${escapeHtml(item.filename)}')">
                    <button class="delete-btn" onclick="deleteItem('${item.id}', event)">×</button>
                    <div class="item-file">
                        <span class="file-icon">${getFileIcon(item.filename)}</span>
                        <div class="file-info">
                            <div class="file-name">${escapeHtml(item.filename)}</div>
                            <div class="file-size">${formatFileSize(item.size)}</div>
                        </div>
                    </div>
                    <span class="item-time">${formatTime(item.created_at)}</span>
                </div>
            `;
        } else {
            return `
                <div class="item" onclick="copyToClipboard(this.dataset.content)" data-content="${escapeHtml(item.content)}">
                    <button class="delete-btn" onclick="deleteItem('${item.id}', event)">×</button>
                    ${escapeHtml(item.content)}
                    <span class="item-time">${formatTime(item.created_at)}</span>
                </div>
            `;
        }
    }).join('');
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

pasteBtn.addEventListener('click', async () => {
    try {
        const text = await navigator.clipboard.readText();
        if (text.trim()) {
            contentInput.value = text;
            contentInput.focus();
            showToast(t('pastedToInput'));
        } else {
            showToast(t('clipboardEmpty'));
        }
    } catch (err) {
        showToast(t('cannotReadClipboard'));
    }
});

fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        uploadFile(file);
    }
});

submitBtn.addEventListener('click', submitFromInput);
clearBtn.addEventListener('click', clearAll);

langToggle.addEventListener('click', () => {
    toggleLanguage();
    applyTranslations();
});

contentInput.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        submitFromInput();
    }
});

document.addEventListener('paste', async (e) => {
    if (e.target !== contentInput) {
        e.preventDefault();
        const files = e.clipboardData.files;
        if (files.length > 0) {
            uploadFile(files[0]);
            return;
        }
        const text = e.clipboardData.getData('text');
        if (text.trim()) {
            addItem(text);
        }
    }
});

applyTranslations();
fetchItems();
connectWebSocket();
