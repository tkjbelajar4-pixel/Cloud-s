document.addEventListener('DOMContentLoaded', async () => {
    await openDB();
    const currentFolder = sessionStorage.getItem('currentFolderId') || null;
    await renderFolderTree(currentFolder);
    await renderFileGrid(currentFolder);
    updateTitle(currentFolder);

    document.getElementById('newFolderBtn').addEventListener('click', () => {
        document.getElementById('folderNameInput').value = '';
        document.getElementById('folderModal').classList.add('active');
    });

    document.getElementById('cancelFolderBtn').addEventListener('click', () => {
        document.getElementById('folderModal').classList.remove('active');
    });

    document.getElementById('saveFolderBtn').addEventListener('click', async () => {
        const name = document.getElementById('folderNameInput').value.trim();
        if (!name) {
            alert('Nama folder harus diisi');
            return;
        }
        const newFolder = {
            id: generateId(),
            type: 'folder',
            name: name,
            parentId: sessionStorage.getItem('currentFolderId') || null,
            createdAt: Date.now()
        };
        await addItem(newFolder);
        document.getElementById('folderModal').classList.remove('active');
        const current = sessionStorage.getItem('currentFolderId') || null;
        await renderFolderTree(current);
        await renderFileGrid(current);
        updateTitle(current);
    });

    document.getElementById('settingsBtn').addEventListener('click', showAboutModal);

    initUpload();

    document.getElementById('newTextNoteBtn').addEventListener('click', () => {
        document.getElementById('textNoteName').value = '';
        document.getElementById('textNoteContent').value = '';
        document.getElementById('textNoteModal').classList.add('active');
    });

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
        const folderId = sessionStorage.getItem('currentFolderId') || null;
        await uploadTextContent(name, content, folderId);
        document.getElementById('textNoteModal').classList.remove('active');
    });

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

    document.getElementById('saveRenameBtn').addEventListener('click', async () => {
        const newName = renameInput.value.trim();
        if (!newName) {
            alert('Nama tidak boleh kosong');
            return;
        }
        if (renameItemId) {
            await updateItem(renameItemId, { name: newName });
            const current = sessionStorage.getItem('currentFolderId') || null;
            await renderFolderTree(current);
            await renderFileGrid(current);
            updateTitle(current);
        }
        renameModal.classList.remove('active');
    });

    const deleteModal = document.getElementById('deleteConfirmModal');
    let deleteItemId = null;

    window.showDeleteConfirm = (item) => {
        deleteItemId = item.id;
        deleteModal.classList.add('active');
    };

    document.getElementById('cancelDeleteBtn').addEventListener('click', () => {
        deleteModal.classList.remove('active');
    });

    document.getElementById('confirmDeleteBtn').addEventListener('click', async () => {
        if (deleteItemId) {
            await deleteItem(deleteItemId);
            const current = sessionStorage.getItem('currentFolderId') || null;
            await renderFolderTree(current);
            await renderFileGrid(current);
            updateTitle(current);
        }
        deleteModal.classList.remove('active');
    });
});

async function updateTitle(folderId) {
    const titleEl = document.getElementById('currentFolderTitle');
    if (folderId) {
        const folder = await getItem(folderId);
        titleEl.innerText = folder ? folder.name : 'Root';
    } else {
        titleEl.innerText = 'Root';
    }
}

function showAboutModal() {
    const modal = document.getElementById('setupModal');
    modal.classList.add('active');

    const deleteBtn = document.getElementById('deleteAllDataBtn');
    const exportBtn = document.getElementById('exportDataBtn');
    const closeBtn = document.getElementById('aboutCloseBtn');

    const newDelete = deleteBtn.cloneNode(true);
    deleteBtn.parentNode.replaceChild(newDelete, deleteBtn);
    newDelete.addEventListener('click', async () => {
        if (confirm('Apakah Anda yakin ingin menghapus SEMUA data? Tindakan ini tidak dapat dibatalkan.')) {
            await clearAll();
            sessionStorage.removeItem('currentFolderId');
            await renderFolderTree(null);
            await renderFileGrid(null);
            document.getElementById('currentFolderTitle').innerText = 'Root';
            modal.classList.remove('active');
        }
    });

    const newExport = exportBtn.cloneNode(true);
    exportBtn.parentNode.replaceChild(newExport, exportBtn);
    newExport.addEventListener('click', async () => {
        const data = await exportData();
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'neverlabs-backup.json';
        a.click();
        URL.revokeObjectURL(url);
    });

    const newClose = closeBtn.cloneNode(true);
    closeBtn.parentNode.replaceChild(newClose, closeBtn);
    newClose.addEventListener('click', () => {
        modal.classList.remove('active');
    });
}
