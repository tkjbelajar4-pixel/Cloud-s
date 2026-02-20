const STORAGE_KEY = 'neverlabs_cloud_data';

function getData() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
        const initial = { version: 1, items: [] };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
        return initial;
    }
    try {
        return JSON.parse(raw);
    } catch {
        return { version: 1, items: [] };
    }
}

function saveData(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
}

function getCurrentFolderId() {
    return sessionStorage.getItem('currentFolderId') || null;
}

function setCurrentFolderId(id) {
    if (id === null) {
        sessionStorage.removeItem('currentFolderId');
    } else {
        sessionStorage.setItem('currentFolderId', id);
    }
}

function getFolderPath(folderId) {
    const data = getData();
    const path = [];
    let current = folderId ? data.items.find(i => i.id === folderId) : null;
    while (current) {
        path.unshift(current);
        current = data.items.find(i => i.id === current.parentId);
    }
    return path;
}

function addItem(item) {
    const data = getData();
    data.items.push(item);
    saveData(data);
    return item;
}

function updateItem(id, updates) {
    const data = getData();
    const index = data.items.findIndex(i => i.id === id);
    if (index !== -1) {
        data.items[index] = { ...data.items[index], ...updates };
        saveData(data);
        return data.items[index];
    }
    return null;
}

function deleteItem(id) {
    const data = getData();
    const children = data.items.filter(i => i.parentId === id);
    children.forEach(child => deleteItem(child.id));
    data.items = data.items.filter(i => i.id !== id);
    saveData(data);
}

function getChildren(parentId) {
    const data = getData();
    return data.items.filter(i => i.parentId === parentId).sort((a, b) => {
        if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
        return a.name.localeCompare(b.name);
    });
}

function getItem(id) {
    const data = getData();
    return data.items.find(i => i.id === id);
}
