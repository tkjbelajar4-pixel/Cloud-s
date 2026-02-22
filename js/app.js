let failedAttempts = 0;

document.addEventListener('DOMContentLoaded', async () => {
    await openDB();
    const hiddenSettings = await getSetting('hidden') || {};
    const unlocked = sessionStorage.getItem('hiddenUnlocked') === 'true';
    currentHiddenMode = unlocked;
    const currentFolder = sessionStorage.getItem('currentFolderId') || (unlocked ? 'hidden' : null);
    await renderFolderTree(currentFolder);
    await renderFileGrid(currentFolder);
    updateTitle(currentFolder);
    updateHiddenUI();

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
        const current = sessionStorage.getItem('currentFolderId') || (currentHiddenMode ? 'hidden' : null);
        const newFolder = {
            id: generateId(),
            type: 'folder',
            name: name,
            parentId: current,
            createdAt: Date.now()
        };
        await addItem(newFolder);
        document.getElementById('folderModal').classList.remove('active');
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
        const folderId = sessionStorage.getItem('currentFolderId') || (currentHiddenMode ? 'hidden' : null);
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
            const current = sessionStorage.getItem('currentFolderId') || (currentHiddenMode ? 'hidden' : null);
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
            const current = sessionStorage.getItem('currentFolderId') || (currentHiddenMode ? 'hidden' : null);
            await renderFolderTree(current);
            await renderFileGrid(current);
            updateTitle(current);
        }
        deleteModal.classList.remove('active');
    });

    document.getElementById('mobileTitle').addEventListener('click', handleHiddenClick);
    document.querySelector('.content-header h3').addEventListener('click', handleHiddenClick);

    document.getElementById('searchInput').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const current = sessionStorage.getItem('currentFolderId') || (currentHiddenMode ? 'hidden' : null);
            renderFileGrid(current);
        }
    });

    document.getElementById('mobileSearchInput').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const current = sessionStorage.getItem('currentFolderId') || (currentHiddenMode ? 'hidden' : null);
            renderFileGrid(current);
        }
    });

    setupEnterKey('folderNameInput', 'saveFolderBtn');
    setupEnterKey('mediaNameInput', 'saveMetaBtn');
    setupEnterKey('renameInput', 'saveRenameBtn');
    setupEnterKey('textNoteName', 'saveTextNoteBtn');
    setupEnterKey('textNoteContent', 'saveTextNoteBtn');
    setupEnterKey('hiddenPasswordInput', 'hiddenSubmitBtn');
    setupEnterKey('hiddenQuestionInput', 'hiddenSubmitBtn');
    setupEnterKey('hiddenAnswerInput', 'hiddenSubmitBtn');
    setupEnterKey('recoveryAnswerInput', 'hiddenSubmitBtn');
    setupEnterKey('oldPasswordInput', 'saveChangeBtn');
    setupEnterKey('newPasswordInput', 'saveChangeBtn');
    setupEnterKey('confirmPasswordInput', 'saveChangeBtn');
    setupEnterKey('newQuestionInput', 'saveChangeBtn');
    setupEnterKey('newAnswerInput', 'saveChangeBtn');
    setupEnterKey('recoverNewPassword', 'saveRecoverBtn');
    setupEnterKey('recoverConfirmPassword', 'saveRecoverBtn');
    setupEnterKey('recoverNewQuestion', 'saveRecoverBtn');
    setupEnterKey('recoverNewAnswer', 'saveRecoverBtn');

    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    });

    const exitHiddenBtn = document.getElementById('exitHiddenBtn');
    const exitHiddenBtnMobile = document.getElementById('exitHiddenBtnMobile');

    exitHiddenBtn.addEventListener('click', exitHiddenMode);
    exitHiddenBtnMobile.addEventListener('click', exitHiddenMode);
});

function setupEnterKey(inputId, buttonId) {
    const input = document.getElementById(inputId);
    if (input) {
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                document.getElementById(buttonId).click();
            }
        });
    }
}

async function updateTitle(folderId) {
    const titleEl = document.getElementById('currentFolderTitle');
    if (folderId === 'hidden') {
        titleEl.innerText = 'Hidden Root';
    } else if (folderId) {
        const folder = await getItem(folderId);
        titleEl.innerText = folder ? folder.name : 'Root';
    } else {
        titleEl.innerText = 'Root';
    }
    document.getElementById('searchInput').placeholder = `Search ${titleEl.innerText}`;
}

async function handleHiddenClick() {
    const hiddenSettings = await getSetting('hidden') || {};
    if (!hiddenSettings.password) {
        showHiddenSetup();
    } else {
        failedAttempts = 0;
        showHiddenLogin();
    }
}

function showHiddenSetup() {
    const modal = document.getElementById('hiddenPasswordModal');
    document.getElementById('hiddenModalTitle').innerText = 'Buat Password Folder Tersembunyi';
    document.getElementById('hiddenQuestionSection').style.display = 'block';
    document.getElementById('hiddenRecoverySection').style.display = 'none';
    document.getElementById('hiddenPasswordInput').value = '';
    document.getElementById('hiddenQuestionInput').value = '';
    document.getElementById('hiddenAnswerInput').value = '';
    modal.classList.add('active');

    const submit = document.getElementById('hiddenSubmitBtn');
    const cancel = document.getElementById('hiddenCancelBtn');
    const newSubmit = submit.cloneNode(true);
    submit.parentNode.replaceChild(newSubmit, submit);
    newSubmit.addEventListener('click', async () => {
        const password = document.getElementById('hiddenPasswordInput').value;
        const question = document.getElementById('hiddenQuestionInput').value;
        const answer = document.getElementById('hiddenAnswerInput').value;
        if (!password || !question || !answer) {
            alert('Semua field harus diisi');
            return;
        }
        await setSetting('hidden', { password, question, answer });
        modal.classList.remove('active');
        alert('Password tersimpan. Klik judul lagi untuk masuk.');
    });

    const newCancel = cancel.cloneNode(true);
    cancel.parentNode.replaceChild(newCancel, cancel);
    newCancel.addEventListener('click', () => {
        modal.classList.remove('active');
    });
}

function showHiddenLogin() {
    const modal = document.getElementById('hiddenPasswordModal');
    document.getElementById('hiddenModalTitle').innerText = 'Masukkan Password';
    document.getElementById('hiddenQuestionSection').style.display = 'none';
    document.getElementById('hiddenRecoverySection').style.display = 'none';
    document.getElementById('hiddenPasswordInput').value = '';
    document.getElementById('recoveryAnswerInput').value = '';
    modal.classList.add('active');

    const submit = document.getElementById('hiddenSubmitBtn');
    const cancel = document.getElementById('hiddenCancelBtn');
    const newSubmit = submit.cloneNode(true);
    submit.parentNode.replaceChild(newSubmit, submit);
    newSubmit.addEventListener('click', async () => {
        const password = document.getElementById('hiddenPasswordInput').value;
        const hiddenSettings = await getSetting('hidden') || {};
        if (password === hiddenSettings.password) {
            sessionStorage.setItem('hiddenUnlocked', 'true');
            currentHiddenMode = true;
            modal.classList.remove('active');
            await renderFolderTree('hidden');
            await renderFileGrid('hidden');
            updateTitle('hidden');
            updateHiddenUI();
            failedAttempts = 0;
        } else {
            failedAttempts++;
            if (failedAttempts >= 3) {
                document.getElementById('hiddenRecoverySection').style.display = 'block';
                alert('Password salah 3 kali. Gunakan pertanyaan rahasia.');
            } else {
                alert(`Password salah. Percobaan ${failedAttempts}/3`);
            }
        }
    });

    const recoveryAnswer = document.getElementById('recoveryAnswerInput');
    recoveryAnswer.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            checkRecoveryAnswer();
        }
    });

    async function checkRecoveryAnswer() {
        const answer = document.getElementById('recoveryAnswerInput').value;
        const hiddenSettings = await getSetting('hidden') || {};
        if (answer === hiddenSettings.answer) {
            modal.classList.remove('active');
            showRecoverModal();
        } else {
            alert('Jawaban salah');
        }
    }

    const newCancel = cancel.cloneNode(true);
    cancel.parentNode.replaceChild(newCancel, cancel);
    newCancel.addEventListener('click', () => {
        modal.classList.remove('active');
        failedAttempts = 0;
    });
}

function showRecoverModal() {
    const modal = document.getElementById('hiddenRecoverModal');
    document.getElementById('recoverNewPassword').value = '';
    document.getElementById('recoverConfirmPassword').value = '';
    document.getElementById('recoverNewQuestion').value = '';
    document.getElementById('recoverNewAnswer').value = '';
    modal.classList.add('active');

    const save = document.getElementById('saveRecoverBtn');
    const cancel = document.getElementById('cancelRecoverBtn');
    const newSave = save.cloneNode(true);
    save.parentNode.replaceChild(newSave, save);
    newSave.addEventListener('click', async () => {
        const newPass = document.getElementById('recoverNewPassword').value;
        const confirm = document.getElementById('recoverConfirmPassword').value;
        const newQuestion = document.getElementById('recoverNewQuestion').value;
        const newAnswer = document.getElementById('recoverNewAnswer').value;

        if (!newPass) {
            alert('Password baru harus diisi');
            return;
        }
        if (newPass !== confirm) {
            alert('Password tidak cocok');
            return;
        }

        const hiddenSettings = await getSetting('hidden') || {};
        const updated = {
            password: newPass,
            question: newQuestion || hiddenSettings.question,
            answer: newAnswer || hiddenSettings.answer
        };
        await setSetting('hidden', updated);
        modal.classList.remove('active');
        alert('Password berhasil diubah. Silakan masuk dengan password baru.');
    });

    const newCancel = cancel.cloneNode(true);
    cancel.parentNode.replaceChild(newCancel, cancel);
    newCancel.addEventListener('click', () => {
        modal.classList.remove('active');
    });
}

function showAboutModal() {
    const modal = document.getElementById('setupModal');
    modal.classList.add('active');

    const deleteBtn = document.getElementById('deleteAllDataBtn');
    const exportBtn = document.getElementById('exportDataBtn');
    const closeBtn = document.getElementById('aboutCloseBtn');
    const changeHiddenBtn = document.getElementById('changeHiddenPasswordBtn');
    const deleteHiddenBtn = document.getElementById('deleteHiddenPasswordBtn');

    const newDelete = deleteBtn.cloneNode(true);
    deleteBtn.parentNode.replaceChild(newDelete, deleteBtn);
    newDelete.addEventListener('click', async () => {
        if (confirm('Apakah Anda yakin ingin menghapus SEMUA data? Tindakan ini tidak dapat dibatalkan.')) {
            await clearAll();
            sessionStorage.clear();
            currentHiddenMode = false;
            await renderFolderTree(null);
            await renderFileGrid(null);
            document.getElementById('currentFolderTitle').innerText = 'Root';
            modal.classList.remove('active');
            updateHiddenUI();
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

    const newChange = changeHiddenBtn.cloneNode(true);
    changeHiddenBtn.parentNode.replaceChild(newChange, changeHiddenBtn);
    newChange.addEventListener('click', () => {
        modal.classList.remove('active');
        showChangeHiddenPassword();
    });

    const newDeleteHidden = deleteHiddenBtn.cloneNode(true);
    deleteHiddenBtn.parentNode.replaceChild(newDeleteHidden, deleteHiddenBtn);
    newDeleteHidden.addEventListener('click', () => {
        modal.classList.remove('active');
        showDeleteHiddenPassword();
    });
}

async function showChangeHiddenPassword() {
    const hiddenSettings = await getSetting('hidden') || {};
    if (!hiddenSettings.password) {
        alert('Belum ada password tersembunyi');
        return;
    }
    const modal = document.getElementById('hiddenChangePasswordModal');
    document.getElementById('oldPasswordInput').value = '';
    document.getElementById('newPasswordInput').value = '';
    document.getElementById('confirmPasswordInput').value = '';
    document.getElementById('newQuestionInput').value = hiddenSettings.question || '';
    document.getElementById('newAnswerInput').value = hiddenSettings.answer || '';
    modal.classList.add('active');

    const save = document.getElementById('saveChangeBtn');
    const cancel = document.getElementById('cancelChangeBtn');
    const newSave = save.cloneNode(true);
    save.parentNode.replaceChild(newSave, save);
    newSave.addEventListener('click', async () => {
        const old = document.getElementById('oldPasswordInput').value;
        const newPass = document.getElementById('newPasswordInput').value;
        const confirm = document.getElementById('confirmPasswordInput').value;
        const newQuestion = document.getElementById('newQuestionInput').value;
        const newAnswer = document.getElementById('newAnswerInput').value;

        if (old !== hiddenSettings.password) {
            alert('Password lama salah');
            return;
        }
        if (!newPass) {
            alert('Password baru harus diisi');
            return;
        }
        if (newPass !== confirm) {
            alert('Password baru tidak cocok');
            return;
        }

        await setSetting('hidden', {
            password: newPass,
            question: newQuestion || hiddenSettings.question,
            answer: newAnswer || hiddenSettings.answer
        });
        modal.classList.remove('active');
        alert('Password berhasil diubah');
    });

    const newCancel = cancel.cloneNode(true);
    cancel.parentNode.replaceChild(newCancel, cancel);
    newCancel.addEventListener('click', () => {
        modal.classList.remove('active');
    });
}

async function showDeleteHiddenPassword() {
    const hiddenSettings = await getSetting('hidden') || {};
    if (!hiddenSettings.password) {
        alert('Belum ada password tersembunyi');
        return;
    }
    const pwd = prompt('Masukkan password untuk menghapus folder tersembunyi:');
    if (pwd === hiddenSettings.password) {
        await setSetting('hidden', {});
        sessionStorage.removeItem('hiddenUnlocked');
        currentHiddenMode = false;
        await renderFolderTree(null);
        await renderFileGrid(null);
        document.getElementById('currentFolderTitle').innerText = 'Root';
        updateHiddenUI();
        alert('Password folder tersembunyi telah dihapus');
    } else {
        alert('Password salah');
    }
}

function exitHiddenMode() {
    sessionStorage.removeItem('hiddenUnlocked');
    currentHiddenMode = false;
    sessionStorage.removeItem('currentFolderId');
    renderFolderTree(null);
    renderFileGrid(null);
    updateTitle(null);
    updateHiddenUI();
}

function updateHiddenUI() {
    const exitBtn = document.getElementById('exitHiddenBtn');
    const exitBtnMobile = document.getElementById('exitHiddenBtnMobile');
    if (currentHiddenMode) {
        exitBtn.style.display = 'flex';
        exitBtnMobile.style.display = 'flex';
    } else {
        exitBtn.style.display = 'none';
        exitBtnMobile.style.display = 'none';
    }
}
