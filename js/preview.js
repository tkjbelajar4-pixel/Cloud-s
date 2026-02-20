let currentItem = null;
let currentQuality = 'auto';

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

    // Copy link
    document.getElementById('copyLinkBtn').addEventListener('click', () => {
        const url = window.location.href;
        navigator.clipboard.writeText(url).then(() => {
            alert('Tautan disalin!');
        }).catch(() => {
            prompt('Salin manual:', url);
        });
    });

    // Share
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
