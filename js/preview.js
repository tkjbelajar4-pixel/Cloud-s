let currentItem = null;
let currentTextContent = '';

document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');

    if (!id) {
        showError('ID media tidak ditemukan');
        return;
    }

    const item = await getItem(id);
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

    qualityBar.style.display = 'none';

    const mime = item.mimeType || '';
    const blob = await getFile(item.fileId);
    if (!blob) {
        showError('File tidak ditemukan di penyimpanan');
        return;
    }

    const url = URL.createObjectURL(blob);

    if (mime.startsWith('image/')) {
        const img = document.createElement('img');
        img.src = url;
        img.style.maxWidth = '100%';
        img.style.maxHeight = '70vh';
        mediaContainer.appendChild(img);
    } else if (mime.startsWith('video/')) {
        const video = document.createElement('video');
        video.src = url;
        video.controls = true;
        mediaContainer.appendChild(video);
    } else if (mime.startsWith('audio/')) {
        const audio = document.createElement('audio');
        audio.src = url;
        audio.controls = true;
        mediaContainer.appendChild(audio);
    } else if (mime.startsWith('text/') || (mime === 'application/octet-stream' && item.name && item.name.match(/\.(txt|py|js|html|css|md|json)$/i))) {
        const text = await blob.text();
        currentTextContent = text;
        mediaContainer.innerHTML = `<pre class="code-editor-pre">${escapeHTML(text)}</pre>`;
        editBtn.style.display = 'inline-flex';
    } else {
        mediaContainer.innerHTML = `<div style="text-align:center; padding:40px;">
            <div style="font-size:5rem;"><i class="fas fa-file"></i></div>
            <p>File tidak dapat dipratinjau</p>
            <a href="${url}" download="${item.name}" class="btn-primary" style="display:inline-block; margin-top:20px;">Download</a>
        </div>`;
    }

    const size = item.size ? (item.size / 1024).toFixed(2) + ' KB' : 'Tidak diketahui';
    const created = new Date(item.createdAt).toLocaleString();
    infoContainer.innerHTML = `
        <p><strong>Nama:</strong> ${escapeHTML(item.name)}</p>
        <p><strong>Ukuran:</strong> ${size}</p>
        <p><strong>Tanggal upload:</strong> ${created}</p>
        <p><strong>Tipe:</strong> ${mime || 'Unknown'}</p>
    `;

    editBtn.addEventListener('click', () => {
        enterEditMode();
    });
});

function enterEditMode() {
    const mediaContainer = document.getElementById('previewMedia');
    const editBtn = document.getElementById('editTextBtn');
    const shareBtn = document.getElementById('shareBtn');
    const copyBtn = document.getElementById('copyLinkBtn');

    if (editBtn) editBtn.style.display = 'none';
    if (shareBtn) shareBtn.style.display = 'none';
    if (copyBtn) copyBtn.style.display = 'none';

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

    if (editBtn) editBtn.style.display = 'inline-flex';
    if (shareBtn) shareBtn.style.display = 'inline-flex';
    if (copyBtn) copyBtn.style.display = 'inline-flex';

    mediaContainer.innerHTML = `<pre class="code-editor-pre">${escapeHTML(currentTextContent)}</pre>`;
}

async function saveEdit() {
    const newContent = document.getElementById('editTextArea').value;
    if (newContent === currentTextContent) {
        cancelEdit();
        return;
    }

    const name = currentItem.name;
    const folderId = currentItem.parentId;

    await deleteFile(currentItem.fileId);

    const blob = new Blob([newContent], { type: 'text/plain' });
    const file = new File([blob], name.endsWith('.txt') ? name : name + '.txt', { type: 'text/plain' });
    const newFileId = await saveFile(file);

    const updatedItem = {
        ...currentItem,
        fileId: newFileId,
        size: blob.size,
        createdAt: Date.now()
    };
    await updateItem(currentItem.id, updatedItem);
    currentItem = updatedItem;
    currentTextContent = newContent;

    cancelEdit();

    const size = (blob.size / 1024).toFixed(2) + ' KB';
    const created = new Date().toLocaleString();
    document.getElementById('previewInfo').innerHTML = `
        <p><strong>Nama:</strong> ${escapeHTML(updatedItem.name)}</p>
        <p><strong>Ukuran:</strong> ${size}</p>
        <p><strong>Tanggal upload:</strong> ${created}</p>
        <p><strong>Tipe:</strong> text/plain</p>
    `;
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
