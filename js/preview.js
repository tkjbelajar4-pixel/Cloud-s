let currentItem = null;
let currentQuality = 'auto';
let currentTextContent = '';

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');

    if (!id) {
        showError('ID media tidak ditemukan');
        return;
    }

    const item = getItem(id);
    if (!item || item.type !== 'file') {
        showError('Media tidak ditemukan');
        return;
    }
    currentItem = item;

    document.getElementById('previewTitle').innerText = item.name;

    const mediaContainer = document.getElementById('previewMedia');
    const infoContainer = document.getElementById('previewInfo');
    const qualityBar = document.getElementById('qualityToolbar');
    const editBtn = document.getElementById('editTextBtn');

    const mime = item.mimeType || '';

    if (mime.startsWith('image/')) {
        qualityBar.style.display = 'flex';
        renderImage(item.cloudinaryUrl, 'auto');
        setupQualityButtons(item.cloudinaryUrl);
    } else if (mime.startsWith('video/')) {
        qualityBar.style.display = 'none';
        const video = document.createElement('video');
        video.src = item.cloudinaryUrl;
        video.controls = true;
        mediaContainer.appendChild(video);
    } else if (mime.startsWith('audio/')) {
        qualityBar.style.display = 'none';
        const audio = document.createElement('audio');
        audio.src = item.cloudinaryUrl;
        audio.controls = true;
        mediaContainer.appendChild(audio);
    } else if (mime.startsWith('text/') || (mime === 'application/octet-stream' && item.name && item.name.match(/\.(txt|py|js|html|css|md|json)$/i))) {
        qualityBar.style.display = 'none';
        fetch(item.cloudinaryUrl)
            .then(response => response.text())
            .then(text => {
                currentTextContent = text;
                mediaContainer.innerHTML = `<pre class="code-editor-pre">${escapeHTML(text)}</pre>`;
                editBtn.style.display = 'inline-flex';
            })
            .catch(() => {
                mediaContainer.innerHTML = `<p style="color:#f77;">Gagal memuat teks.</p>`;
            });
    } else {
        qualityBar.style.display = 'none';
        mediaContainer.innerHTML = `<div style="text-align:center; padding:40px;">
            <div style="font-size:5rem;"><i class="fas fa-file"></i></div>
            <p>File tidak dapat dipratinjau</p>
            <a href="${item.cloudinaryUrl}" target="_blank" class="btn-primary" style="display:inline-block; margin-top:20px;">Download</a>
        </div>`;
    }

    const size = item.size ? (item.size / 1024).toFixed(2) + ' KB' : 'Tidak diketahui';
    const created = new Date(item.createdAt).toLocaleString();
    infoContainer.innerHTML = `
        <p><strong>Nama:</strong> ${escapeHTML(item.name)}</p>
        <p><strong>Ukuran:</strong> ${size}</p>
        <p><strong>Tanggal upload:</strong> ${created}</p>
        <p><strong>Tipe:</strong> ${mime || 'Unknown'}</p>
        <p><a href="${item.cloudinaryUrl}" target="_blank" style="color:#7f9fcf;"><i class="fas fa-external-link-alt"></i> Buka file asli</a></p>
    `;

    document.getElementById('copyLinkBtn').addEventListener('click', () => {
        const url = window.location.href;
        navigator.clipboard.writeText(url).then(() => {
            alert('Tautan disalin!');
        }).catch(() => {
            prompt('Salin manual:', url);
        });
    });

    document.getElementById('shareBtn').addEventListener('click', () => {
        if (navigator.share) {
            navigator.share({
                title: item.name,
                url: window.location.href
            }).catch(() => {});
        } else {
            alert('Browser tidak mendukung fitur bagikan.');
        }
    });

    editBtn.addEventListener('click', () => {
        enterEditMode();
    });
});

function renderImage(baseUrl, quality) {
    let url = baseUrl;
    if (quality === 'hd') {
        url = baseUrl.replace('/upload/', '/upload/w_1920,c_limit/');
    } else if (quality === '4k') {
        url = baseUrl.replace('/upload/', '/upload/w_3840,c_limit/');
    } else {
        url = baseUrl.replace('/upload/', '/upload/q_auto,f_auto/');
    }
    const mediaContainer = document.getElementById('previewMedia');
    mediaContainer.innerHTML = `<img src="${url}" alt="${escapeHTML(currentItem.name)}" style="max-width:100%; max-height:70vh;">`;
}

function setupQualityButtons(baseUrl) {
    const btns = document.querySelectorAll('.quality-btn');
    btns.forEach(btn => {
        btn.addEventListener('click', () => {
            btns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const quality = btn.dataset.quality;
            currentQuality = quality;
            renderImage(baseUrl, quality);
        });
    });
}

function enterEditMode() {
    const mediaContainer = document.getElementById('previewMedia');
    const editBtn = document.getElementById('editTextBtn');
    const shareBtn = document.getElementById('shareBtn');
    const copyBtn = document.getElementById('copyLinkBtn');

    editBtn.style.display = 'none';
    shareBtn.style.display = 'none';
    copyBtn.style.display = 'none';

    mediaContainer.innerHTML = `
        <div style="width:100%;">
            <textarea id="editTextArea" class="code-editor-textarea" style="width:100%; min-height:300px;">${escapeHTML(currentTextContent)}</textarea>
            <div style="display:flex; justify-content:flex-end; gap:12px; margin-top:16px;">
                <button id="cancelEditBtn" class="btn-secondary">Batal</button>
                <button id="saveEditBtn" class="btn-secondary">Simpan</button>
            </div>
        </div>
    `;

    document.getElementById('cancelEditBtn').addEventListener('click', cancelEdit);
    document.getElementById('saveEditBtn').addEventListener('click', () => saveEdit());
}

function cancelEdit() {
    const mediaContainer = document.getElementById('previewMedia');
    const editBtn = document.getElementById('editTextBtn');
    const shareBtn = document.getElementById('shareBtn');
    const copyBtn = document.getElementById('copyLinkBtn');

    editBtn.style.display = 'inline-flex';
    shareBtn.style.display = 'inline-flex';
    copyBtn.style.display = 'inline-flex';

    mediaContainer.innerHTML = `<pre class="code-editor-pre">${escapeHTML(currentTextContent)}</pre>`;
}

async function saveEdit() {
    const newContent = document.getElementById('editTextArea').value;
    if (newContent === currentTextContent) {
        cancelEdit();
        return;
    }

    const config = loadCloudinaryConfig();
    if (!config || !config.textCloudName || !config.textUploadPreset) {
        alert('Konfigurasi teks belum lengkap. Silakan isi di pengaturan.');
        return;
    }

    const name = currentItem.name;
    const folderId = currentItem.parentId;

    const blob = new Blob([newContent], { type: 'text/plain' });
    const formData = new FormData();
    formData.append('file', blob, name.endsWith('.txt') ? name : name + '.txt');
    formData.append('upload_preset', config.textUploadPreset);

    try {
        const response = await fetch(`https://api.cloudinary.com/v1_1/${config.textCloudName}/raw/upload`, {
            method: 'POST',
            body: formData
        });
        const result = await response.json();
        if (result.error) {
            alert('Gagal menyimpan: ' + result.error.message);
            return;
        }

        const updatedItem = {
            ...currentItem,
            cloudinaryPublicId: result.public_id,
            cloudinaryUrl: result.secure_url,
            size: result.bytes,
            createdAt: Date.now()
        };
        updateItem(currentItem.id, updatedItem);
        currentItem = updatedItem;
        currentTextContent = newContent;

        const mediaContainer = document.getElementById('previewMedia');
        const editBtn = document.getElementById('editTextBtn');
        const shareBtn = document.getElementById('shareBtn');
        const copyBtn = document.getElementById('copyLinkBtn');

        editBtn.style.display = 'inline-flex';
        shareBtn.style.display = 'inline-flex';
        copyBtn.style.display = 'inline-flex';

        mediaContainer.innerHTML = `<pre class="code-editor-pre">${escapeHTML(newContent)}</pre>`;

        const size = (result.bytes / 1024).toFixed(2) + ' KB';
        const created = new Date().toLocaleString();
        document.getElementById('previewInfo').innerHTML = `
            <p><strong>Nama:</strong> ${escapeHTML(updatedItem.name)}</p>
            <p><strong>Ukuran:</strong> ${size}</p>
            <p><strong>Tanggal upload:</strong> ${created}</p>
            <p><strong>Tipe:</strong> text/plain</p>
            <p><a href="${updatedItem.cloudinaryUrl}" target="_blank" style="color:#7f9fcf;"><i class="fas fa-external-link-alt"></i> Buka file asli</a></p>
        `;
    } catch (error) {
        alert('Gagal menyimpan: ' + error.message);
    }
}

function showError(msg) {
    document.getElementById('previewTitle').innerText = 'Error';
    document.getElementById('previewMedia').innerHTML = `<div style="color:#f77; text-align:center; padding:40px;">${msg}</div>`;
    document.getElementById('previewInfo').innerHTML = '';
}

function escapeHTML(str) {
    return String(str).replace(/[&<>"]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        if (m === '"') return '&quot;';
        return m;
    });
}
