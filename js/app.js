document.addEventListener('DOMContentLoaded', () => {
    // Cek konfigurasi Cloudinary
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
    const config = loadCloudinaryConfig();
    if (config) {
        cloudInput.value = config.cloudName || '';
        presetInput.value = config.uploadPreset || '';
    } else {
        cloudInput.value = '';
        presetInput.value = '';
    }
    modal.classList.add('active');

    const saveBtn = document.getElementById('setupSaveBtn');
    const cancelBtn = document.getElementById('setupCancelBtn');

    const onSave = () => {
        const cloud = cloudInput.value.trim();
        const preset = presetInput.value.trim();
        if (!cloud || !preset) {
            alert('Cloud Name dan Upload Preset harus diisi.');
            return;
        }
        const newConfig = saveCloudinaryConfig(cloud, preset);
        CLOUDINARY_CONFIG = newConfig;
        modal.classList.remove('active');
    };

    const onCancel = () => {
        if (!loadCloudinaryConfig()) {
            // Jika belum punya config, jangan biarkan cancel karena tidak bisa pakai app
            alert('Anda harus mengisi konfigurasi untuk menggunakan aplikasi.');
            return;
        }
        modal.classList.remove('active');
    };

    saveBtn.onclick = onSave;
    cancelBtn.onclick = onCancel;

    // Hapus event listener sebelumnya agar tidak duplikat
}
