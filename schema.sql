-- Copy dan paste kode di bawah ini ke SQL Editor di akun Neon Database kamu

-- 1. Membuat tabel Aspirasi
CREATE TABLE aspirations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    author_name VARCHAR(100) DEFAULT 'Anonim',
    is_anonymous BOOLEAN DEFAULT TRUE,
    is_private BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) DEFAULT 'menunggu',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Membuat tabel Komentar
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    aspiration_id UUID REFERENCES aspirations(id) ON DELETE CASCADE,
    author_name VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Opsional: Menambahkan beberapa data awal (Dummy) untuk testing
INSERT INTO aspirations (title, description, category, author_name, status) 
VALUES ('AC Ruang Kelas 2C Teknik Mesin Mati', 'Sudah seminggu AC di ruang 2C tidak dingin sama sekali, kami kepanasan saat jam siang.', 'Fasilitas', 'Budi Santoso', 'menunggu');

INSERT INTO aspirations (title, description, category, author_name, is_anonymous, status) 
VALUES ('Perbanyak Buku Pemrograman di Perpustakaan', 'Buku-buku tentang web development (React, Node.js) di perpustakaan sangat kurang dan versinya sudah usang. Mohon diperbarui.', 'Akademik', 'Anonim', TRUE, 'diproses');
