const API_BASE = '/api';
const ADMIN_TOKEN_KEY = 'asmah_admin_token';
let aspirations = [];
const aspirationsContainer = document.getElementById('aspirationsContainer');
const filterBtns = document.querySelectorAll('.filter-btn:not(.status-filter-btn)');
const statusFilterBtns = document.querySelectorAll('.status-filter-btn');
const searchInput = document.getElementById('searchInput');
const detailModal = document.getElementById('detailModal');
const btnCloseDetail = document.getElementById('btnCloseDetail');
const commentForm = document.getElementById('commentForm');
const logoutBtn = document.getElementById('logoutBtn');
let currentActiveAspirationId = null;
let currentPage = 1;
let currentStatusFilter = 'all';
let currentSearchQuery = '';
const itemsPerPage = 12;

function escapeHtml(value) {
    return String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function getAdminToken() {
    return localStorage.getItem(ADMIN_TOKEN_KEY);
}

function logoutAdmin() {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    window.location.href = 'admin-login.html';
}

function ensureLoggedIn() {
    if (!getAdminToken()) {
        window.location.href = 'admin-login.html';
    }
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
    const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
    const token = getAdminToken();
    if (token) headers.Authorization = `Bearer ${token}`;

    const response = await fetch(url, { headers, ...options });
    let payload = null;
    try { payload = await response.json(); } catch (error) { payload = null; }
    if (response.status === 401) {
        logoutAdmin();
        throw new Error('Sesi admin tidak valid. Silakan login kembali.');
    }
    if (!response.ok) throw new Error(payload?.error || 'Terjadi kesalahan pada server.');
    return payload;
}

async function loadAspirations() {
    let skeletons = '';
    for(let i=0; i<12; i++) {
        skeletons += `
            <div class="card skeleton-card">
                <div class="card-header">
                    <div class="skeleton skeleton-badge"></div>
                    <div class="skeleton skeleton-badge"></div>
                </div>
                <div class="skeleton skeleton-title"></div>
                <div class="skeleton skeleton-text"></div>
                <div class="skeleton skeleton-text short"></div>
                <div class="card-footer" style="display: flex; justify-content: flex-end;">
                    <div class="skeleton skeleton-footer"></div>
                </div>
            </div>
        `;
    }
    aspirationsContainer.innerHTML = skeletons;
    try {
        const data = await requestJson(`${API_BASE}/get-all-aspirations`);
        aspirations = Array.isArray(data) ? data : [];
        renderAspirations(getActiveFilter());
        updateStats();
        if (currentActiveAspirationId) {
            const activeItem = aspirations.find((item) => item.id === currentActiveAspirationId);
            if (activeItem && detailModal.classList.contains('active')) fillDetailModal(activeItem);
        }
    } catch (error) {
        aspirationsContainer.innerHTML = `<p style="color: #fca5a5; text-align: center;">${escapeHtml(error.message)}</p>`;
    }
}

function renderAspirations(filterCategory) {
    aspirationsContainer.innerHTML = '';
    let filteredData = filterCategory === 'all' ? [...aspirations] : aspirations.filter((item) => item.category === filterCategory);
    
    // Apply status filter
    if (currentStatusFilter !== 'all') {
        filteredData = filteredData.filter((item) => item.status === currentStatusFilter);
    }
    
    // Apply search filter
    if (currentSearchQuery) {
        const q = currentSearchQuery.toLowerCase();
        filteredData = filteredData.filter((item) => 
            (item.title || '').toLowerCase().includes(q) || 
            (item.description || '').toLowerCase().includes(q)
        );
    }
    
    if (filteredData.length === 0) {
        aspirationsContainer.innerHTML = '<p style="text-align: center;">Tidak ada data yang cocok.</p>';
        return;
    }

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const itemsToShow = filteredData.slice(startIndex, endIndex);

    itemsToShow.forEach((item) => {
        const dateObj = new Date(item.created_at);
        const dateStr = dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
        
        const card = document.createElement('div');
        card.className = 'card';
        card.dataset.category = item.category;
        card.onclick = () => openDetailModal(item.id);

        let privateTag = item.is_private ? `<span class="badge private-badge"><i class="fa-solid fa-lock"></i> RAHASIA</span>` : '';

        card.innerHTML = `
            <div class="card-header">
                <div>
                    <span class="badge badge-${(item.category||'').toLowerCase()}">${escapeHtml(item.category)}</span>
                    ${privateTag}
                </div>
                <span class="status-badge status-${escapeHtml(item.status)}">${escapeHtml(getStatusLabel(item.status))}</span>
            </div>
            <h3>${escapeHtml(item.title)}</h3>
            <p>${escapeHtml(item.description)}</p>
            <div class="card-footer" style="color: var(--text-muted); font-size: 0.85rem; text-align: right;">
                <span style="white-space: nowrap;"><i class="fa-solid fa-calendar"></i> ${escapeHtml(dateStr)}</span>
            </div>
        `;
        aspirationsContainer.appendChild(card);
    });

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    if (totalPages > 1) {
        const paginationContainer = document.createElement('div');
        paginationContainer.style.gridColumn = '1 / -1';
        paginationContainer.style.display = 'flex';
        paginationContainer.style.justifyContent = 'center';
        paginationContainer.style.gap = '8px';
        paginationContainer.style.marginTop = '30px';
        paginationContainer.style.flexWrap = 'wrap';

        const maxVisiblePages = 20;
        let pages = [];

        if (totalPages <= maxVisiblePages) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            pages.push(1);
            let startPage = Math.max(2, currentPage - 8);
            let endPage = Math.min(totalPages - 1, currentPage + 8);
            
            if (startPage === 2) {
                endPage = Math.min(totalPages - 1, 2 + 16);
            }
            if (endPage === totalPages - 1) {
                startPage = Math.max(2, totalPages - 1 - 16);
            }

            if (startPage > 2) pages.push('...');
            for (let i = startPage; i <= endPage; i++) pages.push(i);
            if (endPage < totalPages - 1) pages.push('...');
            
            pages.push(totalPages);
        }

        pages.forEach(p => {
            if (p === '...') {
                const ellipsis = document.createElement('span');
                ellipsis.innerText = '...';
                ellipsis.style.padding = '8px 4px';
                ellipsis.style.color = 'var(--muted)';
                paginationContainer.appendChild(ellipsis);
            } else {
                const pageBtn = document.createElement('button');
                pageBtn.innerText = p;
                pageBtn.className = p === currentPage ? 'btn-primary' : 'filter-btn';
                pageBtn.style.padding = '8px 14px';
                pageBtn.style.minWidth = '40px';
                pageBtn.onclick = () => {
                    currentPage = p;
                    renderAspirations(filterCategory);
                    const filtersSection = document.querySelector('.filters');
                    if (filtersSection) {
                        filtersSection.scrollIntoView({ behavior: 'smooth' });
                    }
                };
                paginationContainer.appendChild(pageBtn);
            }
        });
        aspirationsContainer.appendChild(paginationContainer);
    }
}

function updateStats() {
    document.getElementById('statTotal').innerText = aspirations.length;
    document.getElementById('statMenunggu').innerText = aspirations.filter((item) => item.status === 'menunggu').length;
    document.getElementById('statDiproses').innerText = aspirations.filter((item) => item.status === 'diproses').length;
    document.getElementById('statSelesai').innerText = aspirations.filter((item) => item.status === 'selesai').length;
    document.getElementById('statPrivate').innerText = aspirations.filter((item) => item.is_private).length;
}

function setupEventListeners() {
    filterBtns.forEach((btn) => {
        btn.addEventListener('click', (event) => {
            filterBtns.forEach((item) => item.classList.remove('active'));
            event.currentTarget.classList.add('active');
            currentPage = 1;
            renderAspirations(event.currentTarget.dataset.filter);
        });
    });
    
    statusFilterBtns.forEach((btn) => {
        btn.addEventListener('click', (event) => {
            statusFilterBtns.forEach((item) => item.classList.remove('active'));
            event.currentTarget.classList.add('active');
            currentStatusFilter = event.currentTarget.dataset.status;
            currentPage = 1;
            renderAspirations(getActiveFilter());
        });
    });
    
    if (searchInput) {
        let debounceTimer;
        searchInput.addEventListener('input', () => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                currentSearchQuery = searchInput.value.trim();
                currentPage = 1;
                renderAspirations(getActiveFilter());
            }, 300);
        });
    }
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logoutAdmin);
    }
    btnCloseDetail.addEventListener('click', () => detailModal.classList.remove('active'));
    commentForm.addEventListener('submit', handleCommentSubmit);
    window.addEventListener('click', (event) => {
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

function openDetailModal(id) {
    const item = aspirations.find((a) => a.id === id);
    if (!item) return;
    currentActiveAspirationId = id;
    fillDetailModal(item);
    detailModal.classList.add('active');
}

function fillDetailModal(item) {
    document.getElementById('detailTitle').innerText = item.title;
    document.getElementById('detailCategory').innerText = item.category;
    document.getElementById('detailDescription').innerText = item.description;
    document.getElementById('statusSelect').value = item.status;
    
    if (item.is_private) {
        document.getElementById('detailPrivateFlag').style.display = 'inline-block';
    } else {
        document.getElementById('detailPrivateFlag').style.display = 'none';
    }

    const dateObj = new Date(item.created_at);
    document.getElementById('detailDate').innerText = dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

    const list = document.getElementById('commentsList');
    document.getElementById('commentCount').innerText = (item.comments || []).length;
    if ((item.comments || []).length === 0) {
        list.innerHTML = '<p>Belum ada komentar.</p>';
    } else {
        list.innerHTML = item.comments.map((comment) => {
            const d = new Date(comment.date);
            return `<div class="comment-item">
                <div class="comment-header">
                    <span class="comment-author" ${comment.author.includes('Admin') ? 'style="color:#ef4444;"' : ''}>${escapeHtml(comment.author)}</span>
                    <span class="comment-date">${escapeHtml(d.toLocaleDateString('id-ID'))}</span>
                </div>
                <p>${escapeHtml(comment.content)}</p>
            </div>`;
        }).join('');
    }
}

async function updateStatus() {
    const newStatus = document.getElementById('statusSelect').value;
    try {
        await requestJson(`${API_BASE}/update-status`, {
            method: 'POST',
            body: JSON.stringify({ id: currentActiveAspirationId, status: newStatus })
        });
        showToast('Status berhasil diubah!', 'success');
        loadAspirations();
    } catch (error) {
        showToast(error.message, 'error');
    }
}

async function deleteAspiration() {
    if (!confirm('Apakah Anda yakin ingin menghapus aspirasi ini secara permanen?')) return;
    
    try {
        await requestJson(`${API_BASE}/delete-aspiration`, {
            method: 'DELETE',
            body: JSON.stringify({ id: currentActiveAspirationId })
        });
        showToast('Aspirasi berhasil dihapus!', 'success');
        detailModal.classList.remove('active');
        loadAspirations();
    } catch (error) {
        showToast(error.message, 'error');
    }
}

async function handleCommentSubmit(event) {
    event.preventDefault();
    const content = document.getElementById('commentContent').value.trim();
    try {
        await requestJson(`${API_BASE}/add-comment`, {
            method: 'POST',
            body: JSON.stringify({ aspiration_id: currentActiveAspirationId, author_name: 'Admin ASMAH', content })
        });
        commentForm.reset();
        await loadAspirations();
        showToast('Tanggapan berhasil dikirim.', 'success');
    } catch (error) {
        showToast(error.message, 'error');
    }
}

ensureLoggedIn();
setupEventListeners();
loadAspirations();
