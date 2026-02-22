const DB_NAME = 'NeverlabsDB';
const DB_VERSION = 2;
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
            if (!db.objectStoreNames.contains('settings')) {
                db.createObjectStore('settings', { keyPath: 'key' });
            }
            if (!db.objectStoreNames.contains('thumbnails')) {
                db.createObjectStore('thumbnails', { keyPath: 'fileId' });
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
        await deleteThumbnail(item.fileId);
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

async function saveThumbnail(fileId, blob) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction('thumbnails', 'readwrite');
        const store = tx.objectStore('thumbnails');
        const request = store.put({ fileId, blob });
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

async function getThumbnail(fileId) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction('thumbnails', 'readonly');
        const store = tx.objectStore('thumbnails');
        const request = store.get(fileId);
        request.onsuccess = () => resolve(request.result ? request.result.blob : null);
        request.onerror = () => reject(request.error);
    });
}

async function deleteThumbnail(fileId) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction('thumbnails', 'readwrite');
        const store = tx.objectStore('thumbnails');
        const request = store.delete(fileId);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

async function getSetting(key) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction('settings', 'readonly');
        const store = tx.objectStore('settings');
        const request = store.get(key);
        request.onsuccess = () => resolve(request.result ? request.result.value : null);
        request.onerror = () => reject(request.error);
    });
}

async function setSetting(key, value) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction('settings', 'readwrite');
        const store = tx.objectStore('settings');
        const request = store.put({ key, value });
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

async function clearAll() {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(['items', 'files', 'settings', 'thumbnails'], 'readwrite');
        tx.objectStore('items').clear();
        tx.objectStore('files').clear();
        tx.objectStore('settings').clear();
        tx.objectStore('thumbnails').clear();
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
}

async function exportData() {
    const items = await getItems();
    const settings = await getSetting('hidden') || {};
    return JSON.stringify({ items, settings }, null, 2);
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
}
