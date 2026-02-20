let pendingUploadInfo = null;

function initUpload() {
    const uploadBtn = document.getElementById('uploadBtn');
    uploadBtn.addEventListener('click', () => {
        const config = loadCloudinaryConfig();
        if (!config || !config.cloudName || !config.uploadPreset) {
            showSetupModal();
            return;
        }

        const widget = cloudinary.createUploadWidget(
            {
                cloudName: config.cloudName,
                uploadPreset: config.uploadPreset,
                sources: ['local', 'camera'],
                multiple: false,
                maxFiles: 1,
                clientAllowedFormats: ['image', 'video', 'audio', 'pdf', 'doc', 'txt'],
                maxFileSize: 100000000,
                language: 'id'
            },
            (error, result) => {
                if (error) {
                    alert('Gagal mengupload: ' + (error.message || 'Periksa konfigurasi Cloudinary.'));
                    return;
                }
                if (result && result.event === 'success') {
                    pendingUploadInfo = {
                        publicId: result.info.public_id,
                        url: result.info.secure_url,
                        mimeType: result.info.resource_type === 'image' ? 'image/' + result.info.format :
                                 result.info.resource_type === 'video' ? 'video/' + result.info.format :
                                 result.info.resource_type === 'audio' ? 'audio/' + result.info.format :
                                 'application/octet-stream',
                        bytes: result.info.bytes
                    };
                    showUploadMetaModal();
                }
            }
        );
        widget.open();
    });
}

function showUploadMetaModal() {
    if (!pendingUploadInfo) return;
    document.getElementById('mediaNameInput').value = '';
    populateFolderSelect(getCurrentFolderId());
    document.getElementById('uploadMetaModal').classList.add('active');
}

function hideUploadMetaModal() {
    document.getElementById('uploadMetaModal').classList.remove('active');
    pendingUploadInfo = null;
}

document.addEventListener('DOMContentLoaded', () => {
    const saveMetaBtn = document.getElementById('saveMetaBtn');
    const cancelMetaBtn = document.getElementById('cancelMetaBtn');

    saveMetaBtn.addEventListener('click', () => {
        const name = document.getElementById('mediaNameInput').value.trim();
        const folderId = document.getElementById('mediaFolderSelect').value;
        if (!name) {
            alert('Nama tidak boleh kosong');
            return;
        }
        if (!pendingUploadInfo) return;

        const newItem = {
            id: generateId(),
            type: 'file',
            name: name,
            parentId: folderId === 'null' ? null : folderId,
            cloudinaryPublicId: pendingUploadInfo.publicId,
            cloudinaryUrl: pendingUploadInfo.url,
            mimeType: pendingUploadInfo.mimeType,
            size: pendingUploadInfo.bytes,
            createdAt: Date.now()
        };
        addItem(newItem);
        hideUploadMetaModal();
        renderFileGrid(getCurrentFolderId());
    });

    cancelMetaBtn.addEventListener('click', hideUploadMetaModal);
});
