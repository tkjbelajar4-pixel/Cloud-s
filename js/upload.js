let pendingFile = null;
let pendingFiles = [];

function initUpload() {
    const uploadBtn = document.getElementById('uploadBtn');
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.multiple = true;
    fileInput.style.display = 'none';
    fileInput.accept = '*/*';
    document.body.appendChild(fileInput);

    uploadBtn.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        if (files.length === 1) {
            pendingFile = files[0];
            document.getElementById('mediaNameInput').value = files[0].name;
            await populateFolderSelect(sessionStorage.getItem('currentFolderId') || (currentHiddenMode ? 'hidden' : null));
            document.getElementById('uploadMetaModal').classList.add('active');
        } else {
            const folderId = sessionStorage.getItem('currentFolderId') || (currentHiddenMode ? 'hidden' : null);
            for (const file of files) {
                await saveFileToDB(file, file.name, folderId);
            }
            const current = sessionStorage.getItem('currentFolderId') || (currentHiddenMode ? 'hidden' : null);
            await renderFileGrid(current);
        }
        fileInput.value = '';
    });

    const mainContent = document.querySelector('.main-content');
    mainContent.addEventListener('dragover', (e) => {
        e.preventDefault();
        mainContent.classList.add('drag-over');
    });

    mainContent.addEventListener('dragleave', (e) => {
        mainContent.classList.remove('drag-over');
    });

    mainContent.addEventListener('drop', async (e) => {
        e.preventDefault();
        mainContent.classList.remove('drag-over');
        const items = e.dataTransfer.items;
        if (!items) return;

        const folderId = sessionStorage.getItem('currentFolderId') || (currentHiddenMode ? 'hidden' : null);
        const entries = [];
        for (let i = 0; i < items.length; i++) {
            const entry = items[i].webkitGetAsEntry();
            if (entry) entries.push(entry);
        }
        for (const entry of entries) {
            await processEntry(entry, folderId);
        }
        const current = sessionStorage.getItem('currentFolderId') || (currentHiddenMode ? 'hidden' : null);
        await renderFileGrid(current);
    });
}

async function processEntry(entry, parentId) {
    if (entry.isFile) {
        const file = await new Promise((resolve) => entry.file(resolve));
        await saveFileToDB(file, file.name, parentId);
    } else if (entry.isDirectory) {
        const folderName = entry.name;
        const newFolder = {
            id: generateId(),
            type: 'folder',
            name: folderName,
            parentId: parentId,
            createdAt: Date.now()
        };
        await addItem(newFolder);
        const reader = entry.createReader();
        const readEntries = async () => {
            const entries = await new Promise((resolve) => reader.readEntries(resolve));
            for (const subEntry of entries) {
                await processEntry(subEntry, newFolder.id);
            }
            if (entries.length > 0) await readEntries();
        };
        await readEntries();
    }
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
    const current = sessionStorage.getItem('currentFolderId') || (currentHiddenMode ? 'hidden' : null);
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
        const current = sessionStorage.getItem('currentFolderId') || (currentHiddenMode ? 'hidden' : null);
        await renderFileGrid(current);
    });

    cancelMetaBtn.addEventListener('click', hideUploadMetaModal);
});
