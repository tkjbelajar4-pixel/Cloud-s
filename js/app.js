document.addEventListener('DOMContentLoaded', () => {
    if (!loadCloudinaryConfig() || !CLOUDINARY_CONFIG.cloudName) {
        showSetupModal();
    }

    const data = getData();
    const currentFolder = getCurrentFolderId();
    renderFolderTree(currentFolder);
    renderFileGrid(currentFolder);

    if (currentFolder) {
        const folder = getItem(currentFolder);
        document.getElementById('currentFolderTitle').innerText = folder ? folder.name : 'Root';
    } else {
        document.getElementById('currentFolderTitle').innerText = 'Root';
    }

    document.getElementById('newFolderBtn').addEventListener('click', () => {
        document.getElementById('folderNameInput').value = '';
        document.getElementById('folderModal').classList.add('active');
    });

    document.getElementById('cancelFolderBtn').addEventListener('click', () => {
        document.getElementById('folderModal').classList.remove('active');
    });

    document.getElementById('saveFolderBtn').addEventListener('click', () => {
        const name = document.getElementById('folderNameInput').value.trim();
        if (!name) {
            alert('Nama folder harus diisi');
            return;
        }
        const newFolder = {
            id: generateId(),
            type: 'folder',
            name: name,
            parentId: getCurrentFolderId(),
            createdAt: Date.now()
        };
        addItem(newFolder);
        document.getElementById('folderModal').classList.remove('active');
        renderFolderTree(getCurrentFolderId());
        renderFileGrid(getCurrentFolderId());
    });

    document.getElementById('settingsBtn').addEventListener('click', showSetupModal);

    initUpload();

    // New text note button
    document.getElementById('newTextNoteBtn').addEventListener('click', () => {
        document.getElementById('textNoteName').value = '';
        document.getElementById('textNoteContent').value = '';
        document.getElementById('textNoteModal').classList.add('active');
    });

    // Text note modal handlers
    document.getElementById('cancelTextNoteBtn').addEventListener('click', () => {
        document.getElementById('textNoteModal').classList.remove('active');
    });

    document.getElementById('saveTextNoteBtn').addEventListener('click', async () => {
        const name = document.getElementById('textNoteName').value.trim();
        const content = document.getElementById('textNoteContent').value;
        if (!name) {
            alert('Nama catatan harus diisi');
            return;
        }
        if (!content) {
            alert('Isi catatan tidak boleh kosong');
            return;
        }
        const folderId = getCurrentFolderId();
        await uploadTextContent(name, content, folderId);
        document.getElementById('textNoteModal').classList.remove('active');
    });

    // Rename modal handlers
    const renameModal = document.getElementById('renameModal');
    const renameInput = document.getElementById('renameInput');
    let renameItemId = null;

    window.showRenameModal = (item) => {
        renameItemId = item.id;
        renameInput.value = item.name;
        renameModal.classList.add('active');
    };

    document.getElementById('cancelRenameBtn').addEventListener('click', () => {
        renameModal.classList.remove('active');
    });

    document.getElementById('saveRenameBtn').addEventListener('click', () => {
        const newName = renameInput.value.trim();
        if (!newName) {
            alert('Nama tidak boleh kosong');
            return;
        }
        if (renameItemId) {
            updateItem(renameItemId, { name: newName });
            renderFolderTree(getCurrentFolderId());
            renderFileGrid(getCurrentFolderId());
        }
        renameModal.classList.remove('active');
    });

    // Delete confirm modal
    const deleteModal = document.getElementById('deleteConfirmModal');
    let deleteItemId = null;

    window.showDeleteConfirm = (item) => {
        deleteItemId = item.id;
        deleteModal.classList.add('active');
    };

    document.getElementById('cancelDeleteBtn').addEventListener('click', () => {
        deleteModal.classList.remove('active');
    });

    document.getElementById('confirmDeleteBtn').addEventListener('click', () => {
        if (deleteItemId) {
            deleteItem(deleteItemId);
            renderFolderTree(getCurrentFolderId());
            renderFileGrid(getCurrentFolderId());
        }
        deleteModal.classList.remove('active');
    });
});

function showSetupModal() {
    const modal = document.getElementById('setupModal');
    const cloudInput = document.getElementById('setupCloudName');
    const presetInput = document.getElementById('setupUploadPreset');
    const apiKeyInput = document.getElementById('setupApiKey');
    const apiSecretInput = document.getElementById('setupApiSecret');
    const textCloudInput = document.getElementById('setupTextCloudName');
    const textPresetInput = document.getElementById('setupTextUploadPreset');
    const textApiKeyInput = document.getElementById('setupTextApiKey');
    const textApiSecretInput = document.getElementById('setupTextApiSecret');
    const config = loadCloudinaryConfig();
    if (config) {
        cloudInput.value = config.cloudName || '';
        presetInput.value = config.uploadPreset || '';
        apiKeyInput.value = config.apiKey || '';
        apiSecretInput.value = config.apiSecret || '';
        textCloudInput.value = config.textCloudName || '';
        textPresetInput.value = config.textUploadPreset || '';
        textApiKeyInput.value = config.textApiKey || '';
        textApiSecretInput.value = config.textApiSecret || '';
    } else {
        cloudInput.value = '';
        presetInput.value = '';
        apiKeyInput.value = '';
        apiSecretInput.value = '';
        textCloudInput.value = '';
        textPresetInput.value = '';
        textApiKeyInput.value = '';
        textApiSecretInput.value = '';
    }
    modal.classList.add('active');

    const saveBtn = document.getElementById('setupSaveBtn');
    const cancelBtn = document.getElementById('setupCancelBtn');

    const onSave = () => {
        const cloud = cloudInput.value.trim();
        const preset = presetInput.value.trim();
        const apiKey = apiKeyInput.value.trim();
        const apiSecret = apiSecretInput.value.trim();
        const textCloud = textCloudInput.value.trim();
        const textPreset = textPresetInput.value.trim();
        const textApiKey = textApiKeyInput.value.trim();
        const textApiSecret = textApiSecretInput.value.trim();

        if (!cloud || !preset) {
            alert('Media Cloud Name dan Upload Preset harus diisi.');
            return;
        }
        if (!textCloud || !textPreset) {
            alert('Text Cloud Name dan Upload Preset harus diisi.');
            return;
        }

        const newConfig = saveCloudinaryConfig(cloud, preset, apiKey, apiSecret, textCloud, textPreset, textApiKey, textApiSecret);
        CLOUDINARY_CONFIG = newConfig;
        modal.classList.remove('active');
        if (apiKey && apiSecret) {
            syncWithCloudinary(); // optional sync for media
        }
        if (textApiKey && textApiSecret) {
            // sync text if needed (not implemented)
        }
    };

    const onCancel = () => {
        if (!loadCloudinaryConfig()) {
            alert('Anda harus mengisi konfigurasi untuk menggunakan aplikasi.');
            return;
        }
        modal.classList.remove('active');
    };

    saveBtn.onclick = onSave;
    cancelBtn.onclick = onCancel;
}

// Optional sync for media (unchanged)
async function syncWithCloudinary() {
    const config = loadCloudinaryConfig();
    if (!config || !config.cloudName || !config.apiKey || !config.apiSecret) {
        return;
    }

    const loadingDiv = document.createElement('div');
    loadingDiv.id = 'sync-loading';
    loadingDiv.style.position = 'fixed';
    loadingDiv.style.bottom = '20px';
    loadingDiv.style.right = '20px';
    loadingDiv.style.backgroundColor = '#1a1d23';
    loadingDiv.style.padding = '10px 20px';
    loadingDiv.style.borderRadius = '30px';
    loadingDiv.style.border = '1px solid #3a4050';
    loadingDiv.style.zIndex = '10000';
    loadingDiv.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
    loadingDiv.innerHTML = '<i class="fas fa-sync fa-spin"></i> Menyinkronkan dengan Cloudinary...';
    document.body.appendChild(loadingDiv);

    try {
        const auth = btoa(`${config.apiKey}:${config.apiSecret}`);
        const baseUrl = `https://api.cloudinary.com/v1_1/${config.cloudName}`;
        const allResources = [];
        const types = ['image', 'video', 'raw'];

        for (const type of types) {
            let nextCursor = null;
            do {
                let url = `${baseUrl}/resources/${type}?max_results=100`;
                if (nextCursor) {
                    url += `&next_cursor=${nextCursor}`;
                }
                const response = await fetch(url, {
                    headers: { 'Authorization': `Basic ${auth}` }
                });
                if (!response.ok) {
                    throw new Error(`Gagal mengambil data ${type} (${response.status})`);
                }
                const data = await response.json();
                if (data.resources) {
                    allResources.push(...data.resources);
                }
                nextCursor = data.next_cursor;
            } while (nextCursor);
        }

        document.getElementById('sync-loading')?.remove();

        const data = getData();
        const existingMap = new Map();
        data.items.forEach(item => {
            if (item.type === 'file' && item.cloudinaryPublicId) {
                existingMap.set(item.cloudinaryPublicId, item);
            }
        });

        const newItems = [];
        allResources.forEach(res => {
            if (!existingMap.has(res.public_id)) {
                let mime = 'application/octet-stream';
                if (res.resource_type === 'image') mime = `image/${res.format}`;
                else if (res.resource_type === 'video') mime = `video/${res.format}`;
                else if (res.resource_type === 'raw') mime = 'application/octet-stream';

                const namePart = res.public_id.split('/').pop() || res.public_id;

                const newItem = {
                    id: generateId(),
                    type: 'file',
                    name: namePart,
                    parentId: null,
                    cloudinaryPublicId: res.public_id,
                    cloudinaryUrl: res.secure_url,
                    mimeType: mime,
                    size: res.bytes,
                    createdAt: new Date(res.created_at).getTime() || Date.now()
                };
                newItems.push(newItem);
                existingMap.set(res.public_id, newItem);
            }
        });

        if (newItems.length > 0) {
            data.items.push(...newItems);
            saveData(data);
            const currentFolder = getCurrentFolderId();
            renderFolderTree(currentFolder);
            renderFileGrid(currentFolder);
            alert(`${newItems.length} file baru ditemukan dan ditambahkan.`);
        } else {
            alert('Tidak ada file baru ditemukan di Cloudinary.');
        }
    } catch (error) {
        document.getElementById('sync-loading')?.remove();
        alert('Sinkronisasi gagal: ' + error.message);
    }
}
