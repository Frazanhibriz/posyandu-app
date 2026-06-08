import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Gender, Prisma } from '@prisma/client';
import * as ExcelJS from 'exceljs';
import { PrismaService } from '../prisma/prisma.service';
import { tanggalAwalBulan } from '../common/utils/usia-bulan';
import { ExportLaporanQueryDto } from './dto/export-laporan-query.dto';

const BULAN_LABEL = [
  'JANUARI',
  'FEBRUARI',
  'MARET',
  'APRIL',
  'MEI',
  'JUNI',
  'JULI',
  'AGUSTUS',
  'SEPTEMBER',
  'OKTOBER',
  'NOVEMBER',
  'DESEMBER',
] as const;

const BULAN_KUNJUNGAN = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
] as const;

type ExportRow = {
  no: number;
  nama: string;
  nik: string;
  noKk: string;
  rt: string;
  namaWali: string;
  nikWali: string;
  noWhatsapp: string;
  anakKe: number;
  jenisKelamin: string;
  tglLahir: string;
  beratLahir: number | string;
  panjangLahir: number | string;
  lingkarKepalaLahir: number | string;
  usiaKehamilan: number | string;
  kunjungan: string[];
};

@Injectable()
export class ExportLaporanService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async generateExcelBuffer(query: ExportLaporanQueryDto): Promise<Buffer> {
    const rows = await this.buildRows(query);
    const meta = this.resolveMeta(query);

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Sasaran Bayi-Balita');

    // Aktifkan gridlines bawaan excel
    sheet.views = [{ showGridLines: true }];

    // --- JUDUL UTAMA (Size 14 & Bold) ---
    sheet.mergeCells('B2:AB2');
    const b2 = sheet.getCell('B2');
    b2.value = 'DATA SASARAN/KARTU REGISTER BAYI DAN BALITA';
    b2.font = { name: 'Calibri', size: 14, bold: true };
    b2.alignment = { horizontal: 'center', vertical: 'middle' };

    sheet.mergeCells('B3:AB3');
    const b3 = sheet.getCell('B3');
    b3.value = `PUSKESMAS SIDOREJO KIDUL TAHUN ${query.tahun}`;
    b3.font = { name: 'Calibri', size: 14, bold: true };
    b3.alignment = { horizontal: 'center', vertical: 'middle' };

    // --- METADATA POSYANDU (Geser kanan 1 kolom ke C & D, Font Bold) ---
    const metaConfig = [
      { r: 5, lbl: 'Nama Posyandu', val: `: ${meta.namaPosyandu}` },
      { r: 6, lbl: 'RW', val: `: ${meta.rw}` },
      { r: 7, lbl: 'Kelurahan', val: `: ${meta.kelurahan}` },
      { r: 8, lbl: 'Kecamatan', val: `: ${meta.kecamatan}` },
      { r: 9, lbl: 'Bulan', val: `: ${meta.bulanLabel}` },
    ];

    metaConfig.forEach((item) => {
      const cellLbl = sheet.getCell(`C${item.r}`);
      const cellVal = sheet.getCell(`D${item.r}`);
      cellLbl.value = item.lbl;
      cellVal.value = item.val;
      cellLbl.font = { name: 'Calibri', size: 11, bold: true };
      cellVal.font = { name: 'Calibri', size: 11, bold: true };
    });

    // --- ROW 11: HEADER GROUPING ---
    const headerRow1 = sheet.getRow(11);
    headerRow1.values = [
      '',
      'No',
      ...Array(10).fill('Identitas Bayi / Balita'),
      ...Array(4).fill('Riwayat Kelahiran'),
      ...Array(12).fill('Kunjungan'),
    ];

    // --- ROW 12: HEADER SUB-KOLOM ---
    const headerRow2 = sheet.getRow(12);
    headerRow2.values = [
      '',
      'No',
      'Nama Bayi/Balita',
      'NIK Bayi/Balita',
      'No KK',
      'Alamat (RT)',
      'Nama Wali',
      'NIK Wali',
      'Nomor WA',
      'Anak ke-',
      'Jenis Kelamin',
      'Tanggal Lahir',
      'Berat Badan Lahir',
      'Panjang Badan Lahir',
      'Lingkar Kepala  Lahir',
      'Usia Kehamilan Saat Lahir',
      ...BULAN_KUNJUNGAN,
    ];

    // Eksekusi merge cell header
    sheet.mergeCells('B11:B12');   // No
    sheet.mergeCells('C11:L11');   // Identitas Bayi / Balita
    sheet.mergeCells('M11:P11');   // Riwayat Kelahiran
    sheet.mergeCells('Q11:AB11');  // Kunjungan dengan Kunjungan

    // --- ROW 13: PENOMORAN INDEKS HORIZONTAL (Size 9, Italic, Tanpa Bold) ---
    const numberRow = sheet.getRow(13);
    numberRow.values = ['', ...Array.from({ length: 27 }, (_, i) => i + 1)];

    // Warna Gray, Accent 3, Lighter 60% (Hex: E6E6E6)
    const headerFill: ExcelJS.Fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE6E6E6' },
    };

    // Styling baris header 11, 12, dan 13
    [11, 12, 13].forEach((rowNum) => {
      const row = sheet.getRow(rowNum);
      row.eachCell((cell, colNumber) => {
        if (colNumber >= 2 && colNumber <= 28) {
          cell.fill = headerFill;
          
          // Konfigurasi border manual per cell agar terhindar dari tipe error compiler
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
          };

          if (rowNum === 13) {
            cell.font = { name: 'Calibri', size: 9, italic: true, bold: false };
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
          } else {
            cell.font = { name: 'Calibri', size: 11, bold: true };
            cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
          }
        }
      });
    });

    // --- POPULASI BARIS DATA (Mulai dari Baris 14, Rapat setelah Baris 13) ---
    rows.forEach((row, index) => {
      const excelRow = sheet.getRow(14 + index);
      excelRow.values = [
        '',
        row.no,
        row.nama,
        row.nik,
        row.noKk,
        row.rt,
        row.namaWali,
        row.nikWali,
        row.noWhatsapp,
        row.anakKe,
        row.jenisKelamin,
        row.tglLahir,
        row.beratLahir,
        row.panjangLahir,
        row.lingkarKepalaLahir,
        row.usiaKehamilan,
        ...row.kunjungan,
      ];

      excelRow.eachCell((cell, colNumber) => {
        if (colNumber >= 2 && colNumber <= 28) {
          cell.font = { name: 'Calibri', size: 11 };
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
          };

          // Default perataan teks kiri
          cell.alignment = { horizontal: 'left', vertical: 'middle' };

          // Aturan khusus perataan Tengah (Center) sesuai keluhan kamu
          if (
            colNumber === 2 ||                      // No urut vertikal
            colNumber === 10 ||                     // Anak ke-
            colNumber === 11 ||                     // Jenis Kelamin (L/P)
            colNumber === 12 ||                     // Tanggal Lahir
            (colNumber >= 13 && colNumber <= 16) || // Ukuran Riwayat Kelahiran
            (colNumber >= 17 && colNumber <= 28)    // Tanda ceklis Kunjungan Jan-Des
          ) {
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
          }
        }
      });
    });

    // --- SET LEBAR KOLOM ---
    sheet.columns.forEach((col) => {
      col.width = 16;
    });
    sheet.getColumn(2).width = 6;   // Kolom No
    sheet.getColumn(3).width = 30;  // Kolom Nama Bayi/Balita (Dilebarkan)
    sheet.getColumn(4).width = 22;  // Kolom NIK Bayi/Balita

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  async generateCsvBuffer(query: ExportLaporanQueryDto): Promise<Buffer> {
    const rows = await this.buildRows(query);
    const headers = [
      'No',
      'Nama Bayi/Balita',
      'NIK Bayi/Balita',
      'No KK',
      'Alamat (RT)',
      'Nama Wali',
      'NIK Wali',
      'Nomor WA',
      'Anak ke-',
      'Jenis Kelamin',
      'Tanggal Lahir',
      'Berat Badan Lahir',
      'Panjang Badan Lahir',
      'Lingkar Kepala Lahir',
      'Usia Kehamilan Saat Lahir',
      ...BULAN_KUNJUNGAN,
    ];

    const lines = [headers.map((h) => this.escapeCsv(h)).join(',')];
    for (const row of rows) {
      lines.push(
        [
          row.no,
          row.nama,
          row.nik,
          row.noKk,
          row.rt,
          row.namaWali,
          row.nikWali,
          row.noWhatsapp,
          row.anakKe,
          row.jenisKelamin,
          row.tglLahir,
          row.beratLahir,
          row.panjangLahir,
          row.lingkarKepalaLahir,
          row.usiaKehamilan,
          ...row.kunjungan,
        ]
          .map((v) => this.escapeCsv(String(v ?? '')))
          .join(','),
      );
    }

    return Buffer.from(`\uFEFF${lines.join('\n')}`, 'utf-8');
  }

  private async buildRows(query: ExportLaporanQueryDto): Promise<ExportRow[]> {
    const where: Prisma.BalitaWhereInput = {};
    if (query.rw !== undefined) {
      where.rw = query.rw;
    }

    const tahunStart = tanggalAwalBulan(query.tahun, 1);
    const tahunEnd = tanggalAwalBulan(query.tahun + 1, 1);

    const balitas = await this.prisma.balita.findMany({
      where,
      include: {
        absensis: {
          where: {
            tglHadir: { gte: tahunStart, lt: tahunEnd },
          },
        },
        pengukurans: {
          orderBy: { tglUkur: 'asc' },
          take: 1,
        },
      },
      orderBy: [{ rw: 'asc' }, { rt: 'asc' }, { nama: 'asc' }],
    });

    return balitas.map((balita, index) => {
      const kunjunganMap = new Set<number>();
      for (const absensi of balita.absensis) {
        kunjunganMap.add(absensi.tglHadir.getMonth() + 1);
      }

      const kunjungan = Array.from({ length: 12 }, (_, i) =>
        kunjunganMap.has(i + 1) ? '√' : '',
      );

      const pengukuranPertama = balita.pengukurans[0];

      return {
        no: index + 1,
        nama: balita.nama,
        nik: balita.nik ?? '',
        noKk: '',
        rt: `RT ${balita.rt}`,
        namaWali: balita.namaWali,
        nikWali: balita.nikWali ?? '',
        noWhatsapp: balita.noWhatsapp,
        anakKe: balita.anakKe,
        jenisKelamin: this.mapGender(balita.jenisKelamin),
        tglLahir: this.formatDate(balita.tglLahir),
        beratLahir: balita.beratLahir ?? pengukuranPertama?.beratBadan ?? '',
        panjangLahir: balita.panjangLahir ?? pengukuranPertama?.tinggiBadan ?? '',
        lingkarKepalaLahir:
          balita.lingkarKepalaLahir ?? pengukuranPertama?.lingkarKepala ?? '',
        usiaKehamilan: balita.usiaKehamilan,
        kunjungan,
      };
    });
  }

  private resolveMeta(query: ExportLaporanQueryDto) {
    const bulanIndex = (query.bulan ?? new Date().getMonth() + 1) - 1;
    return {
      namaPosyandu:
        query.namaPosyandu ??
        this.config.get<string>('POSYANDU_NAMA') ??
        'ILP CERIA 9',
      rw: query.rw ?? this.config.get<string>('POSYANDU_RW') ?? '09',
      kelurahan:
        this.config.get<string>('POSYANDU_KELURAHAN') ?? 'SIDOREJO KIDUL',
      kecamatan: this.config.get<string>('POSYANDU_KECAMATAN') ?? 'TINGKIR',
      bulanLabel: BULAN_LABEL[bulanIndex],
    };
  }

  private mapGender(gender: Gender): string {
    return gender === Gender.LAKI_LAKI ? 'L' : 'P';
  }

  private formatDate(date: Date): string {
    const d = date.getDate().toString().padStart(2, '0');
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const y = date.getFullYear();
    return `${d}/${m}/${y}`;
  }

  private escapeCsv(value: string): string {
    if (/[",\n\r]/.test(value)) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }
}