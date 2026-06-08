-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'KADER');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('LAKI_LAKI', 'PEREMPUAN');

-- CreateEnum
CREATE TYPE "AlasanHapus" AS ENUM ('PINDAH_ALAMAT', 'USIA_LEBIH_60_BULAN', 'PERMINTAAN_WALI', 'OTOMATIS_SISTEM');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "nik" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'KADER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Balita" (
    "id" TEXT NOT NULL,
    "nik" TEXT,
    "nama" TEXT NOT NULL,
    "jenisKelamin" "Gender" NOT NULL,
    "tglLahir" TIMESTAMP(3) NOT NULL,
    "anakKe" INTEGER NOT NULL,
    "rt" INTEGER NOT NULL,
    "rw" INTEGER NOT NULL,
    "namaWali" TEXT NOT NULL,
    "nikWali" TEXT,
    "noWhatsapp" TEXT NOT NULL,
    "alamat" TEXT NOT NULL,
    "panjangLahir" DOUBLE PRECISION NOT NULL,
    "beratLahir" DOUBLE PRECISION NOT NULL,
    "lingkarKepalaLahir" DOUBLE PRECISION NOT NULL,
    "usiaKehamilan" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Balita_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pengukuran" (
    "id" TEXT NOT NULL,
    "tglUkur" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "beratBadan" DOUBLE PRECISION NOT NULL,
    "tinggiBadan" DOUBLE PRECISION NOT NULL,
    "lingkarKepala" DOUBLE PRECISION,
    "lila" DOUBLE PRECISION,
    "catatan" TEXT,
    "balitaId" TEXT NOT NULL,
    "kaderId" TEXT NOT NULL,

    CONSTRAINT "Pengukuran_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Absensi" (
    "id" TEXT NOT NULL,
    "tglHadir" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isHadir" BOOLEAN NOT NULL DEFAULT false,
    "keterangan" TEXT,
    "balitaId" TEXT NOT NULL,

    CONSTRAINT "Absensi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BalitaTerhapus" (
    "id" TEXT NOT NULL,
    "namaBalita" TEXT NOT NULL,
    "nikBalita" TEXT,
    "namaWali" TEXT NOT NULL,
    "alasan" "AlasanHapus" NOT NULL,
    "tglTerhapus" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "catatan" TEXT,

    CONSTRAINT "BalitaTerhapus_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_nik_key" ON "User"("nik");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Balita_nik_key" ON "Balita"("nik");

-- AddForeignKey
ALTER TABLE "Pengukuran" ADD CONSTRAINT "Pengukuran_balitaId_fkey" FOREIGN KEY ("balitaId") REFERENCES "Balita"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pengukuran" ADD CONSTRAINT "Pengukuran_kaderId_fkey" FOREIGN KEY ("kaderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Absensi" ADD CONSTRAINT "Absensi_balitaId_fkey" FOREIGN KEY ("balitaId") REFERENCES "Balita"("id") ON DELETE CASCADE ON UPDATE CASCADE;
