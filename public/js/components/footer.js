class AppFooter extends HTMLElement {
    connectedCallback() {
        const type = this.getAttribute('type') || 'public';
        
        let footerCols = '';
        const currentYear = new Date().getFullYear();

        if (type === 'public') {
            footerCols = `
                <div class="footer-col">
                    <a href="index.html" class="logo" style="text-decoration:none; display:flex; align-items:center;">
                        <img src="images/logo.png" alt="Logo ASMAH" style="height:32px; width:auto; margin-right:8px;">
                        <span>AS<span>MAH</span></span>
                    </a>
                    <p class="footer-desc">Wadah penyampaian keluh kesah, saran, dan ide untuk kampus Politeknik Manufaktur Negeri Bangka Belitung yang lebih baik.</p>
                    <a href="admin-login.html" class="admin-link"><i class="fa-solid fa-user-shield"></i> Login Admin</a>
                </div>
                <div class="footer-col">
                    <h4>Tautan Cepat</h4>
                    <ul class="footer-links">
                        <li><a href="https://polman-babel.ac.id/"><i class="fa-solid fa-chevron-right"></i> Website Polman Babel</a></li>
                        <li><a href="https://polmanbabel.siakadcloud.com/gate/login"><i class="fa-solid fa-chevron-right"></i> Portal Akademik</a></li>
                        <li><a href="panduan.html"><i class="fa-solid fa-chevron-right"></i> Panduan Penggunaan</a></li>
                    </ul>
                </div>
                <div class="footer-col">
                    <h4>Hubungi Kami</h4>
                    <ul class="footer-contact">
                        <li><i class="fa-solid fa-location-dot"></i> Kawasan Industri Air Kantung, Sungailiat, Bangka</li>
                        <li><i class="fa-solid fa-envelope"></i> helpdesk@polman-babel.ac.id</li>
                        <li><i class="fa-solid fa-phone"></i> +62 812-3456-7890</li>
                    </ul>
                    <div class="social-icons">
                        <a href="#"><i class="fa-brands fa-instagram"></i></a>
                        <a href="#"><i class="fa-brands fa-facebook-f"></i></a>
                        <a href="#"><i class="fa-brands fa-youtube"></i></a>
                    </div>
                </div>
            `;
        } else if (type === 'panduan') {
            footerCols = `
                <div class="footer-col">
                    <a href="index.html" class="logo" style="text-decoration:none; display:flex; align-items:center;">
                        <img src="images/logo.png" alt="Logo ASMAH" style="height:32px; width:auto; margin-right:8px;">
                        <span>AS<span>MAH</span></span>
                    </a>
                    <p class="footer-desc">Wadah penyampaian keluh kesah, saran, dan ide untuk kampus Politeknik Manufaktur Negeri Bangka Belitung yang lebih baik.</p>
                </div>
                <div class="footer-col">
                    <h4>Tautan Cepat</h4>
                    <ul class="footer-links">
                        <li><a href="https://polmanbabel.siakadcloud.com/gate/login"><i class="fa-solid fa-chevron-right"></i> Portal Akademik</a></li>
                        <li><a href="https://polman-babel.ac.id/"><i class="fa-solid fa-chevron-right"></i> Website Polman Babel</a></li>
                        <li><a href="index.html"><i class="fa-solid fa-chevron-right"></i> Kembali ke Beranda</a></li>
                    </ul>
                </div>
                <div class="footer-col">
                    <h4>Hubungi Kami</h4>
                    <ul class="footer-contact">
                        <li><i class="fa-solid fa-location-dot"></i> Kawasan Industri Air Kantung, Sungailiat, Bangka</li>
                        <li><i class="fa-solid fa-envelope"></i> helpdesk@polman-babel.ac.id</li>
                        <li><i class="fa-solid fa-phone"></i> +62 812-3456-7890</li>
                    </ul>
                    <div class="social-icons">
                        <a href="#"><i class="fa-brands fa-instagram"></i></a>
                        <a href="#"><i class="fa-brands fa-facebook-f"></i></a>
                        <a href="#"><i class="fa-brands fa-youtube"></i></a>
                    </div>
                </div>
            `;
        } else if (type === 'admin') {
            footerCols = `
                <div class="footer-col">
                    <a href="admin.html" class="logo" style="text-decoration:none; display:flex; align-items:center;">
                        <img src="images/logo.png" alt="Logo ASMAH" style="height:32px; width:auto; margin-right:8px;">
                        <span>ADMIN<span> ASMAH</span></span>
                    </a>
                    <p class="footer-desc">Wadah pengelolaan keluh kesah, saran, dan ide untuk kampus Politeknik Manufaktur Negeri Bangka Belitung.</p>
                </div>
                <div class="footer-col">
                    <h4>Tautan Cepat</h4>
                    <ul class="footer-links">
                        <li><a href="index.html"><i class="fa-solid fa-chevron-right"></i> Tampilan Publik</a></li>
                        <li><a href="#"><i class="fa-solid fa-chevron-right"></i> Pengaturan Akun</a></li>
                        <li><a href="#"><i class="fa-solid fa-chevron-right"></i> Laporan Rekapitulasi</a></li>
                    </ul>
                </div>
                <div class="footer-col">
                    <h4>Bantuan Admin</h4>
                    <ul class="footer-contact">
                        <li><i class="fa-solid fa-headset"></i> IT Support Polman Babel</li>
                        <li><i class="fa-solid fa-envelope"></i> it@polman-babel.ac.id</li>
                    </ul>
                </div>
            `;
        } else if (type === 'login') {
            footerCols = `
                <div class="footer-col">
                    <a href="index.html" class="logo" style="text-decoration:none; display:flex; align-items:center;">
                        <img src="images/logo.png" alt="Logo ASMAH" style="height:32px; width:auto; margin-right:8px;">
                        <span>AS<span>MAH</span></span>
                    </a>
                    <p class="footer-desc">Portal Khusus Administrator Sistem Informasi Aspirasi Mahasiswa (ASMAH).</p>
                </div>
                <div class="footer-col" style="flex: auto; display: flex; align-items: center; justify-content: flex-end;">
                    <a href="index.html" class="admin-link"><i class="fa-solid fa-arrow-left"></i> Kembali ke Beranda</a>
                </div>
            `;
        }

        this.innerHTML = `
            <footer class="footer">
                <div class="footer-container">
                    ${footerCols}
                </div>
                <div class="footer-bottom">
                    <p>&copy; ${currentYear} Sistem Informasi Aspirasi Mahasiswa — Politeknik Manufaktur Negeri Bangka Belitung.</p>
                </div>
            </footer>
        `;
    }
}

customElements.define('app-footer', AppFooter);
