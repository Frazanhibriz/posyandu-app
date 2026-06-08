export function hitungUsiaBulan(tglLahir: Date, referensi: Date = new Date()): number {
  return (
    (referensi.getFullYear() - tglLahir.getFullYear()) * 12 +
    (referensi.getMonth() - tglLahir.getMonth())
  );
}

export function tanggalAwalBulan(tahun: number, bulan: number): Date {
  return new Date(tahun, bulan - 1, 1, 0, 0, 0, 0);
}

export function tanggalAkhirBulan(tahun: number, bulan: number): Date {
  return new Date(tahun, bulan, 1, 0, 0, 0, 0);
}
