require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

const categories = ['Fasilitas', 'Akademik', 'Organisasi', 'Lainnya'];
const statuses = ['menunggu', 'diproses', 'selesai'];
const authors = ['Anonim', 'Budi Santoso', 'Siti Aminah', 'Rudi Heryanto', 'Dewi Lestari', 'Agus Setiawan', 'Anonim', 'Anonim'];

const dummyTopics = [
    // Fasilitas
    { title: 'AC Ruang Kelas Rusak', desc: 'Sudah seminggu AC di ruang kelas kami mati dan membuat gerah saat perkuliahan siang hari. Tolong segera diperbaiki.' },
    { title: 'Wifi Perpustakaan Lambat', desc: 'Koneksi internet di area perpustakaan sangat lambat, sangat menyulitkan kami mencari referensi jurnal online.' },
    { title: 'Parkiran Motor Penuh', desc: 'Lahan parkir motor di sayap kiri selalu penuh dan semrawut. Apakah bisa diperluas?' },
    { title: 'Peralatan Bengkel Aus', desc: 'Beberapa mesin bubut di bengkel teknik sudah kurang presisi karena termakan usia. Harap ada peremajaan.' },
    { title: 'Kantin Terlalu Penuh', desc: 'Saat jam istirahat, kantin sangat penuh sehingga banyak mahasiswa tidak kebagian tempat duduk.' },
    { title: 'Penerangan Jalan Kurang', desc: 'Lampu jalan dari gerbang utama menuju gedung rektorat sangat gelap kalau malam hari.' },
    { title: 'Toilet Lantai 2 Bau', desc: 'Air di toilet lantai 2 sering mati sehingga baunya sangat mengganggu kelas di sebelahnya.' },
    
    // Akademik & Pelajaran
    { title: 'Perbanyak Buku Pemrograman', desc: 'Buku di perpustakaan sangat kurang dan versinya sudah usang. Mohon diperbarui.' },
    { title: 'Jadwal Kuliah Bentrok', desc: 'Jadwal mata kuliah di semester ini banyak yang bentrok dengan praktikum. Mohon ditinjau kembali oleh prodi.' },
    { title: 'Sistem Siakad Error', desc: 'Saat masa KRS kemarin sistem sering down dan error 500, tolong perbaiki server siakadnya.' },
    { title: 'Tugas Akhir Terlalu Berat', desc: 'Beban SKS untuk tugas akhir tahun ini dirasa kurang seimbang dengan ekspektasi outputnya, mohon penyesuaian kurikulum.' },
    { title: 'Modul Praktikum Usang', desc: 'Banyak modul praktikum yang masih menggunakan referensi tahun 2010. Perlu pembaruan dari pihak prodi.' },
    
    // Dosen
    { title: 'Dosen Sering Terlambat', desc: 'Ada beberapa dosen yang sering datang terlambat lebih dari 30 menit tanpa konfirmasi sebelumnya. Mohon ditegur.' },
    { title: 'Nilai Tidak Transparan', desc: 'Beberapa mata kuliah tidak pernah mempublikasikan nilai tugas, tiba-tiba nilai akhir sudah keluar.' },
    { title: 'Metode Mengajar Membosankan', desc: 'Diharapkan para dosen bisa menggunakan metode mengajar yang lebih interaktif dan tidak hanya membaca PPT.' },
    
    // Organisasi
    { title: 'Dana BEM Belum Turun', desc: 'Kegiatan kepanitiaan sudah dekat namun dana dari kampus belum cair, mohon kejelasannya.' },
    { title: 'Dukung Unit Kegiatan Mahasiswa (UKM)', desc: 'Mohon kampus memberikan dukungan alat lebih untuk UKM Seni dan Olahraga.' },
    { title: 'Ruang Sekre HIMA Bocor', desc: 'Atap ruang sekretariat HIMA sering bocor kalau hujan deras, mohon segera diperbaiki.' },
    
    // Kampus Umum
    { title: 'Sistem Keamanan Kampus', desc: 'Kemarin ada helm hilang di parkiran, tolong perketat keamanan dan tambah CCTV.' },
    { title: 'Sampah Berserakan', desc: 'Tolong tambah tong sampah di sekitar taman kampus, banyak yang membuang sampah sembarangan.' },
    { title: 'Jam Operasional Perpus', desc: 'Apakah jam buka perpustakaan bisa diperpanjang sampai jam 19.00? Sangat membantu buat yang nugas sore.' },
    { title: 'Mesin Minuman Rusak', desc: 'Vending machine di lobi utama sering telan uang tapi minumannya tidak keluar.' },
    { title: 'Pelayanan Akademik Lambat', desc: 'Mengurus surat keterangan mahasiswa aktif sangat lama dan sering dilempar-lempar.' },
    
    // Kehidupan Kampus & Kesehatan
    { title: 'P3K Tidak Lengkap', desc: 'Kotak P3K di ruang kelas banyak yang kosong. Tolong diisi ulang.' },
    { title: 'Kantin Kurang Sehat', desc: 'Menu di kantin terlalu banyak gorengan, butuh opsi makanan sehat atau sayur.' },
    { title: 'Kucing Liar di Kelas', desc: 'Banyak kucing liar masuk kelas dan naik ke atas meja, tolong dikoordinasikan.' },
    { title: 'Ruang Diskusi Kurang', desc: 'Kami butuh area gazebo atau meja bundar tambahan untuk kerja kelompok di luar kelas.' },
    
    // Dosen Tambahan
    { title: 'Dosen A Susah Ditemui', desc: 'Saya kesulitan menemui dosen pembimbing akademik karena jadwal beliau selalu penuh di luar kampus.' },
    { title: 'Tugas Mendadak', desc: 'Dosen sering memberikan tugas dengan tenggat waktu hanya semalam, sangat membebani kami.' },
    
    // Fasilitas Tambahan
    { title: 'Proyektor Kelas Buram', desc: 'Warna proyektor di Lab Komputer 1 sudah memudar, sulit membaca teks koding.' },
    { title: 'Kursi Kuliah Patah', desc: 'Banyak kursi lipat di ruang 3A yang engselnya patah, cukup berbahaya jika diduduki.' },
    { title: 'Air Wastafel Mati', desc: 'Air di wastafel bengkel sering mati jadi kami susah mencuci tangan setelah praktikum.' }
];

function getRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

async function seed() {
    console.log('Menyuntikkan 200 data dummy ke database (menambahkan ke yang sudah ada)...');
    
    try {
        let inserted = 0;

        for (let i = 0; i < 200; i++) {
            const topic = getRandom(dummyTopics);
            const category = getRandom(categories);
            const status = getRandom(statuses);
            const author_name = getRandom(authors);
            const is_anonymous = author_name === 'Anonim';
            const is_private = Math.random() > 0.8; // 20% kemungkinan rahasia
            
            // Randomize date within the last 30 days
            const pastDate = new Date();
            pastDate.setDate(pastDate.getDate() - Math.floor(Math.random() * 30));
            pastDate.setHours(Math.floor(Math.random() * 24));
            pastDate.setMinutes(Math.floor(Math.random() * 60));

            const query = `
                INSERT INTO aspirations (title, description, category, author_name, is_anonymous, is_private, status, created_at)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            `;
            
            const values = [
                topic.title + ` #${Math.floor(Math.random() * 1000)}`, 
                topic.desc, 
                category, 
                author_name, 
                is_anonymous, 
                is_private, 
                status,
                pastDate.toISOString()
            ];

            await pool.query(query, values);
            inserted++;
            
            if (inserted % 20 === 0) {
                console.log(`Berhasil insert ${inserted} data...`);
            }
        }
        
        console.log('Selesai! 100 data dummy berhasil dimasukkan ke tabel aspirations.');
        
    } catch (err) {
        console.error('Terjadi kesalahan:', err);
    } finally {
        pool.end();
    }
}

seed();
