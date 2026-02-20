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

    document.getElementById('previewTitle').innerText = item.name;

    const mediaContainer = document.getElementById('previewMedia');
    const infoContainer = document.getElementById('previewInfo');

    let mediaElement;
    const mime = item.mimeType || '';

    if (mime.startsWith('image/')) {
        mediaElement = document.createElement('img');
        mediaElement.src = item.cloudinaryUrl;
        mediaElement.alt = item.name;
    } else if (mime.startsWith('video/')) {
        mediaElement = document.createElement('video');
        mediaElement.src = item.cloudinaryUrl;
        mediaElement.controls = true;
    } else if (mime.startsWith('audio/')) {
        mediaElement = document.createElement('audio');
        mediaElement.src = item.cloudinaryUrl;
        mediaElement.controls = true;
    } else {
        // File biasa, tampilkan link download
        mediaContainer.innerHTML = `<div style="text-align:center; padding:40px;">
            <div style="font-size:5rem;">📄</div>
            <p>File tidak dapat dipratinjau</p>
            <a href="${item.cloudinaryUrl}" target="_blank" class="btn-primary" style="display:inline-block; margin-top:20px;">Download</a>
        </div>`;
    }

    if (mediaElement) {
        mediaContainer.appendChild(mediaElement);
    }

    // Info tambahan
    const size = item.size ? (item.size / 1024).toFixed(2) + ' KB' : 'Tidak diketahui';
    const created = new Date(item.createdAt).toLocaleString();
    infoContainer.innerHTML = `
        <p><strong>Nama:</strong> ${escapeHTML(item.name)}</p>
        <p><strong>Ukuran:</strong> ${size}</p>
        <p><strong>Tanggal upload:</strong> ${created}</p>
        <p><strong>Tipe:</strong> ${mime || 'Unknown'}</p>
        <p><a href="${item.cloudinaryUrl}" target="_blank" style="color:#7f9fcf;">🔗 Buka file asli</a></p>
    `;
});

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