function renderFolderTree(activeId = null) {
    const data = getData();
    const rootItems = data.items.filter(i => i.type === 'folder' && i.parentId === null);
    const container = document.getElementById('folderTree');
    container.innerHTML = '';

    const rootItem = document.createElement('div');
    rootItem.className = `folder-item ${activeId === null ? 'active' : ''}`;
    rootItem.innerHTML = '<span class="icon">📁</span> Root';
    rootItem.dataset.id = 'null';
    rootItem.addEventListener('click', () => {
        setCurrentFolderId(null);
        renderFolderTree(null);
        renderFileGrid(null);
        document.getElementById('currentFolderTitle').innerText = 'Root';
    });
    container.appendChild(rootItem);

    function renderSubfolders(parentId, level = 0) {
        const folders = data.items.filter(i => i.type === 'folder' && i.parentId === parentId);
        folders.forEach(f => {
            const div = document.createElement('div');
            div.className = `folder-item ${activeId === f.id ? 'active' : ''}`;
            div.style.paddingLeft = `${24 + level * 16}px`;
            div.innerHTML = `<span class="icon">📂</span> ${f.name}`;
            div.dataset.id = f.id;
            div.addEventListener('click', (e) => {
                e.stopPropagation();
                setCurrentFolderId(f.id);
                renderFolderTree(f.id);
                renderFileGrid(f.id);
                document.getElementById('currentFolderTitle').innerText = f.name;
            });
            container.appendChild(div);
            renderSubfolders(f.id, level + 1);
        });
    }
    renderSubfolders(null);
}

function renderFileGrid(folderId) {
    const items = getChildren(folderId);
    const grid = document.getElementById('fileGrid');
    grid.innerHTML = '';

    if (items.length === 0) {
        grid.innerHTML = '<div style="grid-column:1/-1; text-align:center; color:#5f6b7a; padding:40px;">Folder kosong</div>';
        return;
    }

    items.forEach(item => {
        const card = document.createElement('div');
        card.className = `file-card ${item.type}`;

        if (item.type === 'folder') {
            card.innerHTML = `
                <div class="file-icon">📁</div>
                <div class="file-name">${escapeHTML(item.name)}</div>
                <div class="file-meta">folder</div>
            `;
            card.addEventListener('click', () => {
                setCurrentFolderId(item.id);
                renderFolderTree(item.id);
                renderFileGrid(item.id);
                document.getElementById('currentFolderTitle').innerText = item.name;
            });
        } else {
            const icon = getFileIcon(item.mimeType);
            card.innerHTML = `
                <div class="file-icon">${icon}</div>
                <div class="file-name">${escapeHTML(item.name)}</div>
                <div class="file-meta">${new Date(item.createdAt).toLocaleDateString()}</div>
            `;
            card.addEventListener('click', () => {
                window.open(`preview.html?id=${item.id}`, '_blank');
            });
        }
        grid.appendChild(card);
    });
}

function getFileIcon(mime) {
    if (!mime) return '📄';
    if (mime.startsWith('image/')) return '🖼️';
    if (mime.startsWith('video/')) return '🎬';
    if (mime.startsWith('audio/')) return '🎵';
    return '📄';
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

function populateFolderSelect(selectedId = null) {
    const data = getData();
    const folders = data.items.filter(i => i.type === 'folder');
    const select = document.getElementById('mediaFolderSelect');
    select.innerHTML = '<option value="null">Root</option>';
    folders.forEach(f => {
        const opt = document.createElement('option');
        opt.value = f.id;
        opt.textContent = f.name;
        if (selectedId === f.id) opt.selected = true;
        select.appendChild(opt);
    });
}