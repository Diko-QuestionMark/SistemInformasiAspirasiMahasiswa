const API_BASE = '/api';

let aspirations = [];

const aspirationsContainer = document.getElementById('aspirationsContainer');
const filterBtns = document.querySelectorAll('.filter-btn');

const formModal = document.getElementById('formModal');
const btnOpenForm = document.getElementById('btnOpenForm');
const btnCloseForm = document.getElementById('btnCloseForm');
const aspirationForm = document.getElementById('aspirationForm');

const detailModal = document.getElementById('detailModal');
const btnCloseDetail = document.getElementById('btnCloseDetail');
const commentForm = document.getElementById('commentForm');

let currentActiveAspirationId = null;

function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function getStatusLabel(status) {
    if (status === 'menunggu') return 'Menunggu';
    if (status === 'diproses') return 'Diproses';
    if (status === 'selesai') return 'Selesai';
    return status;
}

function getActiveFilter() {
    return document.querySelector('.filter-btn.active')?.dataset.filter || 'all';
}

function showToast(message, type = 'success') {
    let container = document.getElementById('toastContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toastContainer';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const icon = type === 'success' ? '<i class="fa-solid fa-circle-check" style="color:var(--done);"></i>' : '<i class="fa-solid fa-circle-exclamation" style="color:#ef4444;"></i>';
    toast.innerHTML = `${icon} <span>${escapeHtml(message)}</span>`;
    container.appendChild(toast);
    
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 400);
    }, 3000);
}

async function requestJson(url, options = {}) {
    const response = await fetch(url, {
        headers: {
            'Content-Type': 'application/json',
            ...(options.headers || {})
        },
        ...options
    });

    let payload = null;
    try {
        payload = await response.json();
    } catch (error) {
        payload = null;
    }

    if (!response.ok) {
        throw new Error(payload?.error || 'Terjadi kesalahan pada server.');
    }

    return payload;
}

async function loadAspirations() {
    aspirationsContainer.innerHTML = '<p style="color: var(--text-muted); text-align: center;">Memuat aspirasi...</p>';

    try {
        const data = await requestJson(`${API_BASE}/get-aspirations`);
        aspirations = Array.isArray(data) ? data : [];
        renderAspirations(getActiveFilter());
        updateStats();

        if (currentActiveAspirationId) {
            const activeItem = aspirations.find((item) => item.id === currentActiveAspirationId);
            if (activeItem && detailModal.classList.contains('active')) {
                fillDetailModal(activeItem);
            }
        }
    } catch (error) {
        aspirations = [];
        aspirationsContainer.innerHTML = `<p style="color: #fca5a5; text-align: center;">${escapeHtml(error.message)}</p>`;
        updateStats();
    }
}

function init() {
    setupEventListeners();
    loadAspirations();
}

function renderAspirations(filterCategory) {
    aspirationsContainer.innerHTML = '';

    const filteredData = filterCategory === 'all'
        ? [...aspirations]
        : aspirations.filter((item) => item.category === filterCategory);

    filteredData.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    if (filteredData.length === 0) {
        aspirationsContainer.innerHTML = `
            <div style="text-align: center; color: var(--muted); padding: 60px 20px; grid-column: 1 / -1;">
                <i class="fa-solid fa-folder-open" style="font-size: 3rem; margin-bottom: 15px; opacity: 0.5;"></i>
                <h3 style="font-size: 1.2rem; margin-bottom: 10px; color: var(--ink);">Belum Ada Aspirasi</h3>
                <p>Belum ada laporan atau saran pada kategori ini. Jadilah yang pertama menyuarakannya!</p>
            </div>
        `;
        return;
    }

    filteredData.forEach((item) => {
        const dateObj = new Date(item.created_at);
        const dateStr = dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });

        const card = document.createElement('div');
        card.className = 'card';
        card.dataset.category = item.category;
        card.onclick = () => openDetailModal(item.id);

        card.innerHTML = `
            <div class="card-header">
                <span class="badge badge-${(item.category||'').toLowerCase()}">${escapeHtml(item.category)}</span>
                <span class="status-badge status-${escapeHtml(item.status)}">${escapeHtml(getStatusLabel(item.status))}</span>
            </div>
            <h3>${escapeHtml(item.title)}</h3>
            <p>${escapeHtml(item.description)}</p>
            <div class="card-footer" style="display: flex; justify-content: flex-end; align-items: center;">
                <div style="display: flex; gap: 1rem; color: var(--text-muted); font-size: 0.85rem;">
                    <span style="white-space: nowrap;"><i class="fa-solid fa-calendar"></i> ${escapeHtml(dateStr)}</span>
                </div>
            </div>
        `;

        aspirationsContainer.appendChild(card);
    });
}

function updateStats() {
    document.getElementById('statTotal').innerText = aspirations.length;
    document.getElementById('statProcess').innerText = aspirations.filter((item) => item.status === 'diproses').length;
    document.getElementById('statDone').innerText = aspirations.filter((item) => item.status === 'selesai').length;
}

function setupEventListeners() {
    filterBtns.forEach((btn) => {
        btn.addEventListener('click', (event) => {
            filterBtns.forEach((item) => item.classList.remove('active'));
            event.currentTarget.classList.add('active');
            renderAspirations(event.currentTarget.dataset.filter);
        });
    });

    btnOpenForm.addEventListener('click', () => formModal.classList.add('active'));
    btnCloseForm.addEventListener('click', () => formModal.classList.remove('active'));
    aspirationForm.addEventListener('submit', handleFormSubmit);

    btnCloseDetail.addEventListener('click', () => detailModal.classList.remove('active'));
    commentForm.addEventListener('submit', handleCommentSubmit);

    window.addEventListener('click', (event) => {
        if (event.target === formModal) formModal.classList.remove('active');
        if (event.target === detailModal) detailModal.classList.remove('active');
    });

    window.addEventListener('scroll', () => {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 20) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
}

async function handleFormSubmit(event) {
    event.preventDefault();

    // Cek cooldown (30 detik)
    const lastSubmitTime = localStorage.getItem('lastSubmitTime');
    if (lastSubmitTime) {
        const timeDiff = Date.now() - parseInt(lastSubmitTime);
        if (timeDiff < 30000) {
            const remainingSeconds = Math.ceil((30000 - timeDiff) / 1000);
            showToast(`Harap tunggu ${remainingSeconds} detik lagi untuk mengirim aspirasi baru.`, 'error');
            return;
        }
    }

    const title = document.getElementById('title').value.trim();
    const category = document.getElementById('category').value;
    const description = document.getElementById('description').value.trim();
    const isPrivate = document.getElementById('isPrivate').checked;

    const submitButton = aspirationForm.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.innerText = 'Mengirim...';

    try {
        await requestJson(`${API_BASE}/add-aspiration`, {
            method: 'POST',
            body: JSON.stringify({
                title,
                category,
                description,
                is_private: isPrivate
            })
        });

        localStorage.setItem('lastSubmitTime', Date.now().toString());
        aspirationForm.reset();
        formModal.classList.remove('active');
        await loadAspirations();
        window.scrollTo(0, 0);
        showToast(isPrivate ? 'Laporan rahasia berhasil dikirim ke Admin.' : 'Aspirasi berhasil dikirim.', 'success');
    } catch (error) {
        showToast(error.message, 'error');
    } finally {
        submitButton.disabled = false;
        submitButton.innerText = 'Kirim Sekarang';
    }
}

function openDetailModal(id) {
    const item = aspirations.find((aspiration) => aspiration.id === id);
    if (!item) return;

    currentActiveAspirationId = id;
    fillDetailModal(item);
    detailModal.classList.add('active');
}

function fillDetailModal(item) {
    document.getElementById('detailTitle').innerText = item.title;
    document.getElementById('detailCategory').innerText = item.category;
    document.getElementById('detailDescription').innerText = item.description;

    const dateObj = new Date(item.created_at);
    document.getElementById('detailDate').innerText = dateObj.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    const statusBadge = document.getElementById('detailStatus');
    statusBadge.className = `status-badge status-${item.status}`;
    statusBadge.innerText = getStatusLabel(item.status);

    renderComments(item.comments || []);
}

function renderComments(comments) {
    const list = document.getElementById('commentsList');
    document.getElementById('commentCount').innerText = comments.length;

    if (comments.length === 0) {
        list.innerHTML = '<p style="color: var(--text-muted); font-size: 0.9rem;">Belum ada komentar. Jadilah yang pertama memberikan tanggapan!</p>';
        return;
    }

    list.innerHTML = comments.map((comment) => {
        const dateObj = new Date(comment.date);
        const dateStr = dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });

        return `
            <div class="comment-item">
                <div class="comment-header">
                    <span class="comment-author">${escapeHtml(comment.author || 'Anonim')}</span>
                    <span class="comment-date">${escapeHtml(dateStr)}</span>
                </div>
                <p>${escapeHtml(comment.content)}</p>
            </div>
        `;
    }).join('');
}

async function handleCommentSubmit(event) {
    event.preventDefault();

    const content = document.getElementById('commentContent').value.trim();

    const submitButton = commentForm.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.innerText = 'Mengirim...';

    try {
        await requestJson(`${API_BASE}/add-comment`, {
            method: 'POST',
            body: JSON.stringify({
                aspiration_id: currentActiveAspirationId,
                author_name: 'Anonim',
                content
            })
        });

        commentForm.reset();
        await loadAspirations();
        showToast('Komentar berhasil ditambahkan.', 'success');
        
        // Auto scroll to bottom of comments
        setTimeout(() => {
            const commentsList = document.getElementById('commentsList');
            if (commentsList && commentsList.lastElementChild) {
                commentsList.lastElementChild.scrollIntoView({ behavior: 'smooth', block: 'end' });
            }
        }, 100);
    } catch (error) {
        showToast(error.message, 'error');
    } finally {
        submitButton.disabled = false;
        submitButton.innerText = 'Kirim Komentar';
    }
}



init();
