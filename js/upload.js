let pendingFile = null;

function initUpload() {
    const uploadBtn = document.getElementById('uploadBtn');
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.style.display = 'none';
    fileInput.accept = '*/*';
    document.body.appendChild(fileInput);

    uploadBtn.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        pendingFile = file;
        document.getElementById('mediaNameInput').value = file.name;
        await populateFolderSelect(sessionStorage.getItem('currentFolderId') || null);
        document.getElementById('uploadMetaModal').classList.add('active');
    });
}

function hideUploadMetaModal() {
    document.getElementById('uploadMetaModal').classList.remove('active');
    pendingFile = null;
}

async function saveFileToDB(file, name, folderId) {
    const fileId = await saveFile(file);
    const newItem = {
        id: generateId(),
        type: 'file',
        name: name,
        parentId: folderId === 'null' ? null : folderId,
        mimeType: file.type || 'application/octet-stream',
        size: file.size,
        createdAt: Date.now(),
        fileId: fileId
    };
    await addItem(newItem);
    return newItem;
}

async function uploadTextContent(name, content, folderId) {
    const blob = new Blob([content], { type: 'text/plain' });
    const file = new File([blob], name.endsWith('.txt') ? name : name + '.txt', { type: 'text/plain' });
    await saveFileToDB(file, name, folderId);
    const current = sessionStorage.getItem('currentFolderId') || null;
    await renderFileGrid(current);
}

document.addEventListener('DOMContentLoaded', () => {
    const saveMetaBtn = document.getElementById('saveMetaBtn');
    const cancelMetaBtn = document.getElementById('cancelMetaBtn');

    saveMetaBtn.addEventListener('click', async () => {
        const name = document.getElementById('mediaNameInput').value.trim();
        const folderId = document.getElementById('mediaFolderSelect').value;
        if (!name) {
            alert('Nama tidak boleh kosong');
            return;
        }
        if (!pendingFile) return;
        await saveFileToDB(pendingFile, name, folderId);
        hideUploadMetaModal();
        const current = sessionStorage.getItem('currentFolderId') || null;
        await renderFileGrid(current);
    });

    cancelMetaBtn.addEventListener('click', hideUploadMetaModal);
});
