# Test Lokal Netlify

Project ini memakai:
- Frontend statis dari root project
- Netlify Functions di `netlify/functions`
- PostgreSQL melalui env `DATABASE_URL`

## 1. Install Netlify CLI

Pilih salah satu:

```powershell
npm install -g netlify-cli
```

atau

```powershell
npm install --save-dev netlify-cli
```

Kalau memilih install lokal, command `npm run dev` di project ini akan langsung memakainya.

## 2. Siapkan environment variable

Copy `.env.example` menjadi `.env`, lalu isi `DATABASE_URL` dari Neon/PostgreSQL kamu.

Contoh:

```env
DATABASE_URL=postgresql://user:password@ep-example.ap-southeast-1.aws.neon.tech/dbname?sslmode=require
```

## 3. Siapkan database

Jalankan isi file `schema.sql` di SQL Editor database kamu untuk membuat tabel:
- `aspirations`
- `comments`

Kalau mau, sekalian jalankan data dummy yang sudah ada di file itu.

## 4. Jalankan local dev server

```powershell
npm run dev
```

Netlify Dev akan:
- menyajikan `index.html` dari root project
- menjalankan function di `/.netlify/functions/*`
- membuat redirect `/api/*` sesuai `netlify.toml`

Biasanya aplikasi bisa dibuka di:

```text
http://localhost:8888
```

## 5. Cara cek apakah koneksi berhasil

Tes cepat di browser:
- Buka halaman utama dan pastikan daftar aspirasi tampil
- Kirim aspirasi baru
- Buka detail aspirasi dan kirim komentar

Tes endpoint langsung:

```text
http://localhost:8888/api/get-aspirations
```

Kalau berhasil, endpoint itu akan mengembalikan JSON daftar aspirasi.

## 6. Kalau muncul error

Checklist:
- `DATABASE_URL` sudah benar
- tabel dari `schema.sql` sudah dibuat
- Netlify CLI sudah terpasang
- port `8888` tidak sedang dipakai aplikasi lain

## 7. Cek sintaks frontend

```powershell
npm run check:frontend
```
