# Mitra Posyandu - Aplikasi Pemantauan Kesehatan Balita

Mitra Posyandu adalah aplikasi manajemen dan pemantauan kesehatan balita yang dirancang untuk membantu Kader Posyandu dalam mengelola pendaftaran balita, pencatatan pengukuran fisik bulanan, serta absensi kehadiran secara real-time.

Aplikasi ini dibangun menggunakan arsitektur monorepo yang memisahkan **Frontend (Next.js)** dan **Backend (NestJS)**.

---

## 🚀 Fitur Utama

1. **Dashboard Statistik**: Laporan real-time kehadiran bulanan balita dan status pengukuran pertumbuhan.
2. **Manajemen Balita (CRUD)**: Pendaftaran data balita dengan validasi otomatis (usia kehamilan, berat/panjang lahir, dan data orang tua/wali).
3. **Pencatatan Pengukuran Bulanan**: Input data berat badan, tinggi badan, lingkar kepala, dan Lingkar Lengan Atas (LILA).
4. **Analisis Tumbuh Kembang**: Evaluasi pertumbuhan balita menggunakan standar evaluasi medis otomatis.
5. **Absensi Bulanan**: Pencatatan kehadiran bulanan per balita yang tersinkronisasi langsung dengan database.
6. **Autentikasi & Otorisasi**: Login aman menggunakan JSON Web Token (JWT) dengan pembagian peran (Role: Admin / Kader).

---

## 🛠️ Tech Stack

* **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS 4, Recharts, Lucide Icons.
* **Backend**: NestJS, Prisma ORM, `@prisma/adapter-pg` (PostgreSQL driver adapter), Passport JWT, class-validator.
* **Database**: PostgreSQL.

---

## 📁 Struktur Proyek

```text
posyandu-app/
├── backend/       # Kode sumber server NestJS & konfigurasi database Prisma
├── frontend/      # Kode sumber web client Next.js
├── package.json   # Konfigurasi workspace monorepo & script utilitas
└── README.md      # Panduan dokumentasi proyek
```

---

## ⚙️ Panduan Instalasi dan Menjalankan Aplikasi

Ikuti urutan langkah di bawah ini untuk menjalankan aplikasi di komputer Anda:

### 📋 Prasyarat
Pastikan Anda sudah menginstal:
* [Node.js](https://nodejs.org/) (versi terbaru disarankan)
* [PostgreSQL](https://www.postgresql.org/) yang aktif di local port `5432`

---

### Langkah 1: Instalasi Dependensi
Di folder root (`posyandu-app`), jalankan perintah berikut untuk menginstal semua library frontend dan backend secara otomatis:
```bash
npm run install:all
```

---

### Langkah 2: Konfigurasi Database (Backend)
1. Buka folder `backend`:
   ```bash
   cd backend
   ```
2. Buat file `.env` di dalam folder `backend` jika belum ada, lalu isi konfigurasi database dan rahasia JWT Anda:
   ```env
   DATABASE_URL="postgresql://<username>:<password>@localhost:5432/posyandu_db?schema=public"
   JWT_SECRET="kunci-rahasia-jwt-sangat-aman-123"
   SEED_ADMIN_PASSWORD="admin123"
   ```
   *(Sesuaikan `<username>` dan `<password>` dengan user PostgreSQL lokal Anda).*

3. Jalankan migrasi schema Prisma untuk membuat tabel-tabel di database:
   ```bash
   npx prisma migrate dev --name init
   ```

4. Jalankan seeder database untuk membuat akun Admin default:
   ```bash
   npm run seed
   ```

---

### Langkah 3: Menjalankan Aplikasi
Ada dua cara untuk menjalankan aplikasi:

#### Cara A: Menggunakan Script Root (Sekaligus)
Di folder root (`posyandu-app`), jalankan perintah ini untuk menyalakan Frontend dan Backend secara bersamaan:
```bash
npm start
```
* **Frontend** akan berjalan di: [http://localhost:3000](http://localhost:3000)
* **Backend API** akan berjalan di: [http://localhost:4000](http://localhost:4000)

#### Cara B: Menjalankan Secara Terpisah (Dua Terminal)
Jika ingin melihat log secara terpisah, Anda dapat membukanya di dua terminal berbeda:
* **Terminal 1 (Backend)**:
  ```bash
  cd backend
  npm run start:dev
  ```
* **Terminal 2 (Frontend)**:
  ```bash
  cd frontend
  npm run dev
  ```

---

## 🔑 Kredensial Login Default
Setelah melakukan seed di Langkah 2, gunakan akun berikut untuk masuk ke dashboard:
* **Username**: `admin`
* **Password**: `admin123` (atau sesuai konfigurasi `SEED_ADMIN_PASSWORD` di `.env` backend)
