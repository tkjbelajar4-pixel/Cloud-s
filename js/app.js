document.addEventListener('DOMContentLoaded', () => {
    // Inisialisasi data jika perlu
    const data = getData();
    if (data.items.length === 0) {
        // Opsional: buat folder contoh?
    }

    // Render folder tree dan file grid
    const currentFolder = getCurrentFolderId();
    renderFolderTree(currentFolder);
    renderFileGrid(currentFolder);

    // Update judul
    if (currentFolder) {
        const folder = getItem(currentFolder);
        document.getElementById('currentFolderTitle').innerText = folder ? folder.name : 'Root';
    } else {
        document.getElementById('currentFolderTitle').innerText = 'Root';
    }

    // Tombol folder baru
    document.getElementById('newFolderBtn').addEventListener('click', () => {
        document.getElementById('folderNameInput').value = '';
        document.getElementById('folderModal').classList.add('active');
    });

    // Modal folder
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

    // Inisialisasi upload
    initUpload();
});