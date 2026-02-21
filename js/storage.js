const DB_NAME = 'NeverlabsDB';
const DB_VERSION = 1;
let db = null;

function openDB() {
    return new Promise((resolve, reject) => {
        if (db) return resolve(db);
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
            db = request.result;
            resolve(db);
        };
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('items')) {
                const itemStore = db.createObjectStore('items', { keyPath: 'id' });
                itemStore.createIndex('parentId', 'parentId', { unique: false });
                itemStore.createIndex('type', 'type', { unique: false });
            }
            if (!db.objectStoreNames.contains('files')) {
                db.createObjectStore('files', { keyPath: 'id' });
            }
        };
    });
}

async function getItems() {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction('items', 'readonly');
        const store = tx.objectStore('items');
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

async function getItem(id) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction('items', 'readonly');
        const store = tx.objectStore('items');
        const request = store.get(id);
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error);
    });
}

async function getChildren(parentId) {
    const items = await getItems();
    return items.filter(i => i.parentId === parentId).sort((a, b) => {
        if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
        return a.name.localeCompare(b.name);
    });
}

async function addItem(item) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction('items', 'readwrite');
        const store = tx.objectStore('items');
        const request = store.add(item);
        request.onsuccess = () => resolve(item);
        request.onerror = () => reject(request.error);
    });
}

async function updateItem(id, updates) {
    const item = await getItem(id);
    if (!item) return null;
    const updated = { ...item, ...updates };
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction('items', 'readwrite');
        const store = tx.objectStore('items');
        const request = store.put(updated);
        request.onsuccess = () => resolve(updated);
        request.onerror = () => reject(request.error);
    });
}

async function deleteItem(id) {
    const item = await getItem(id);
    if (!item) return;
    const children = await getChildren(id);
    for (const child of children) {
        await deleteItem(child.id);
    }
    if (item.type === 'file' && item.fileId) {
        await deleteFile(item.fileId);
    }
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction('items', 'readwrite');
        const store = tx.objectStore('items');
        const request = store.delete(id);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

async function saveFile(blob) {
    const fileId = generateId();
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction('files', 'readwrite');
        const store = tx.objectStore('files');
        const request = store.add({ id: fileId, blob });
        request.onsuccess = () => resolve(fileId);
        request.onerror = () => reject(request.error);
    });
}

async function getFile(fileId) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction('files', 'readonly');
        const store = tx.objectStore('files');
        const request = store.get(fileId);
        request.onsuccess = () => resolve(request.result ? request.result.blob : null);
        request.onerror = () => reject(request.error);
    });
}

async function deleteFile(fileId) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction('files', 'readwrite');
        const store = tx.objectStore('files');
        const request = store.delete(fileId);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

async function clearAll() {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(['items', 'files'], 'readwrite');
        tx.objectStore('items').clear();
        tx.objectStore('files').clear();
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
}

async function exportData() {
    const items = await getItems();
    return JSON.stringify(items, null, 2);
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
}
