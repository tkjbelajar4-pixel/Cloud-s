function renderFolderTree(activeId = null) {
    const data = getData();
    const container = document.getElementById('folderTree');
    container.innerHTML = '';

    const rootItem = document.createElement('div');
    rootItem.className = `folder-item ${activeId === null ? 'active' : ''}`;
    rootItem.innerHTML = '<i class="fas fa-folder"></i> Root';
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
            div.innerHTML = `<i class="fas fa-folder-open"></i> ${f.name}`;
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
        card.dataset.id = item.id;

        if (item.type === 'folder') {
            card.innerHTML = `
                <div class="file-icon"><i class="fas fa-folder" style="font-size:2.8rem;"></i></div>
                <div class="file-name">${escapeHTML(item.name)}</div>
                <div class="file-meta">folder</div>
                <div class="card-menu"><i class="fas fa-ellipsis-v"></i></div>
                <div class="dropdown-menu"></div>
            `;
            card.addEventListener('click', (e) => {
                if (e.target.closest('.card-menu')) return;
                setCurrentFolderId(item.id);
                renderFolderTree(item.id);
                renderFileGrid(item.id);
                document.getElementById('currentFolderTitle').innerText = item.name;
            });
        } else {
            const iconClass = getFileIconFA(item.mimeType);
            card.innerHTML = `
                <div class="file-icon"><i class="${iconClass}" style="font-size:2.8rem;"></i></div>
                <div class="file-name">${escapeHTML(item.name)}</div>
                <div class="file-meta">${new Date(item.createdAt).toLocaleDateString()}</div>
                <div class="card-menu"><i class="fas fa-ellipsis-v"></i></div>
                <div class="dropdown-menu"></div>
            `;
            card.addEventListener('click', (e) => {
                if (e.target.closest('.card-menu')) return;
                window.open(`preview.html?id=${item.id}`, '_blank');
            });
        }

        // dropdown menu
        const menuBtn = card.querySelector('.card-menu');
        const dropdown = card.querySelector('.dropdown-menu');
        menuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            document.querySelectorAll('.dropdown-menu.show').forEach(m => m.classList.remove('show'));
            dropdown.classList.toggle('show');
            populateDropdown(dropdown, item);
        });

        grid.appendChild(card);
    });

    // close dropdown when clicking outside
    document.addEventListener('click', () => {
        document.querySelectorAll('.dropdown-menu.show').forEach(m => m.classList.remove('show'));
    });
}

function populateDropdown(dropdown, item) {
    dropdown.innerHTML = '';
    const renameOpt = document.createElement('div');
    renameOpt.className = 'dropdown-item';
    renameOpt.innerHTML = '<i class="fas fa-pen"></i> Rename';
    renameOpt.addEventListener('click', (e) => {
        e.stopPropagation();
        showRenameModal(item);
    });
    dropdown.appendChild(renameOpt);

    const deleteOpt = document.createElement('div');
    deleteOpt.className = 'dropdown-item';
    deleteOpt.innerHTML = '<i class="fas fa-trash"></i> Hapus';
    deleteOpt.addEventListener('click', (e) => {
        e.stopPropagation();
        showDeleteConfirm(item);
    });
    dropdown.appendChild(deleteOpt);
}

function getFileIconFA(mime) {
    if (!mime) return 'fas fa-file';
    if (mime.startsWith('image/')) return 'fas fa-image';
    if (mime.startsWith('video/')) return 'fas fa-video';
    if (mime.startsWith('audio/')) return 'fas fa-music';
    return 'fas fa-file';
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
