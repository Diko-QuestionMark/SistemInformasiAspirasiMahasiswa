const API_BASE = '/api';
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');

function escapeHtml(value) {
  return String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function showLoginError(message) {
  loginError.innerText = message;
  loginError.style.display = message ? 'block' : 'none';
}

async function requestJson(url, options = {}) {
  try {
    const response = await fetch(url, { headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }, ...options });
    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error(payload?.error || `Terjadi kesalahan saat login (${response.status}).`);
    }
    return payload;
  } catch (error) {
    if (error.name === 'TypeError') {
      throw new Error('Tidak dapat menghubungi server login. Pastikan Anda menjalankan `npm run dev` atau menggunakan hosting Netlify.');
    }
    throw error;
  }
}

if (!loginForm) {
  console.error('Form login tidak ditemukan pada halaman.');
} else {
  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    showLoginError('');

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;

    try {
      const response = await requestJson(`${API_BASE}/auth`, {
        method: 'POST',
        body: JSON.stringify({ username, password })
      });

      if (response.token) {
        localStorage.setItem('asmah_admin_token', response.token);
        window.location.href = 'admin.html';
      } else {
        throw new Error('Token login tidak ditemukan.');
      }
    } catch (error) {
      showLoginError(escapeHtml(error.message));
    }
  });
}

