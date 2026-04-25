const itemsList = document.getElementById('itemsList');
const pasteBtn = document.getElementById('pasteBtn');
const submitBtn = document.getElementById('submitBtn');
const clearBtn = document.getElementById('clearBtn');
const contentInput = document.getElementById('contentInput');
const fileInput = document.getElementById('fileInput');
const uploadProgress = document.getElementById('uploadProgress');
const toast = document.getElementById('toast');

let items = [];

async function clearAll() {
    if (!confirm('确定要清空所有内容吗？此操作不可恢复！')) {
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
            showToast('已清空所有内容');
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
            showToast('内容已添加');
        }
    } catch (err) {
        console.error('Failed to add item:', err);
    }
}

async function uploadFile(file) {
    const formData = new FormData();
    formData.append('file', file);

    uploadProgress.style.display = 'block';
    const progressFill = uploadProgress.querySelector('.progress-fill');
    const progressText = uploadProgress.querySelector('.progress-text');

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
            showToast('文件上传成功');
        } else {
            const data = await res.json();
            showToast(data.detail || '上传失败');
        }
    } catch (err) {
        console.error('Failed to upload file:', err);
        showToast('上传失败');
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
        showToast('开始下载');
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
        showToast('请输入内容');
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
        showToast('已复制到剪贴板');
    } catch (err) {
        const textarea = document.createElement('textarea');
        textarea.value = content;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showToast('已复制到剪贴板');
    }
}

function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2000);
}

function formatTime(isoString) {
    const date = new Date(isoString);
    const now = new Date();
    const diff = now - date;

    if (diff < 60000) return '刚刚';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} 分钟前`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} 小时前`;
    return date.toLocaleDateString('zh-CN', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
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
                <h2>📋 暂无内容</h2>
                <p>在输入框中输入内容，或上传文件</p>
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
            showToast('已粘贴到输入框');
        } else {
            showToast('剪贴板为空');
        }
    } catch (err) {
        showToast('无法读取剪贴板，请按 Ctrl+V');
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

contentInput.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        submitFromInput();
    }
});

document.addEventListener('paste', async (e) => {
    if (e.target !== contentInput) {
        e.preventDefault();
        // 先检查是否有文件
        const files = e.clipboardData.files;
        if (files.length > 0) {
            uploadFile(files[0]);
            return;
        }
        // 否则作为文本处理
        const text = e.clipboardData.getData('text');
        if (text.trim()) {
            addItem(text);
        }
    }
});

fetchItems();
setInterval(fetchItems, 5000);
