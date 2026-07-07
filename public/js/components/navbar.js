class AppNavbar extends HTMLElement {
    connectedCallback() {
        const type = this.getAttribute('type') || 'index';
        let innerHTML = '';

        if (type === 'index') {
            innerHTML = `
                <nav class="navbar navbar-hero">
                    <a href="index.html" class="logo" style="text-decoration:none;">
                        <img src="images/logo.png" alt="Polman Babel" class="nav-logo-img">
                        <span>AS<span>MAH</span></span>
                    </a>
                    <button class="btn-primary" id="btnOpenForm">
                        <i class="fa-solid fa-plus"></i> Kirim Aspirasi
                    </button>
                </nav>
            `;
        } else if (type === 'panduan') {
            innerHTML = `
                <nav class="navbar navbar-hero">
                    <a href="index.html" class="logo" style="text-decoration:none;">
                        <img src="images/logo.png" alt="Polman Babel" class="nav-logo-img">
                        <span>AS<span>MAH</span></span>
                    </a>
                    <a href="index.html" class="btn-primary" style="text-decoration:none;">
                        <i class="fa-solid fa-arrow-left"></i> Kembali ke Beranda
                    </a>
                </nav>
            `;
        } else if (type === 'admin') {
            innerHTML = `
                <nav class="navbar navbar-hero">
                    <a href="admin.html" class="logo" style="text-decoration:none;">
                        <img src="images/logo.png" alt="Polman Babel" class="nav-logo-img">
                        <span>AS<span>MAH</span> SENAT</span>
                    </a>
                    <div class="navbar-actions">
                        <a href="index.html" class="filter-btn" style="text-decoration:none;">
                            <i class="fa-solid fa-arrow-left" style="margin-right:6px;"></i>Kembali ke Publik
                        </a>
                        <button class="btn-primary btn-small" id="logoutBtn" type="button">
                            <i class="fa-solid fa-right-from-bracket"></i> Logout
                        </button>
                    </div>
                </nav>
            `;
        } else if (type === 'login') {
            innerHTML = `
                <nav class="navbar">
                    <a href="index.html" class="logo" style="text-decoration:none;">
                        <img src="images/logo.png" alt="Polman Babel" class="nav-logo-img">
                        <span>AS<span>MAH</span></span>
                    </a>
                </nav>
            `;
        }

        this.innerHTML = innerHTML;
    }
}

customElements.define('app-navbar', AppNavbar);
