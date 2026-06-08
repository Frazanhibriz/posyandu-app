import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { tanggalAkhirBulan, tanggalAwalBulan } from '../common/utils/usia-bulan';

@Injectable()
export class LaporanService {
  constructor(private readonly prisma: PrismaService) {}

  async getLaporan(bulan: number, tahun: number) {
    const start = tanggalAwalBulan(tahun, bulan);
    const end = tanggalAkhirBulan(tahun, bulan);
    const [totalBalitaAktif, hadir, tidakHadir] = await Promise.all([
      this.prisma.balita.count(),
      this.prisma.absensi.count({ where: { tglHadir: { gte: start, lt: end }, isHadir: true } }),
      this.prisma.absensi.count({ where: { tglHadir: { gte: start, lt: end }, isHadir: false } }),
    ]);

    return { totalBalitaAktif, jumlahHadir: hadir, jumlahTidakHadir: tidakHadir };
  }

  async getBeranda() {
    const now = new Date();
    const start = tanggalAwalBulan(now.getFullYear(), now.getMonth() + 1);
    const end = tanggalAkhirBulan(now.getFullYear(), now.getMonth() + 1);

    const [totalBalita, terukurIds, hadirBulanIni] = await Promise.all([
      this.prisma.balita.count(),
      this.prisma.pengukuran.findMany({
        where: { tglUkur: { gte: start, lt: end } },
        distinct: ['balitaId'],
        select: { balitaId: true },
      }),
      this.prisma.absensi.count({
        where: {
          tglHadir: { gte: start, lt: end },
          isHadir: true,
        },
      }),
    ]);
    const sudahUkur = terukurIds.length;
    return {
      totalBalita,
      hadirBulanIni,
      belumHadir: totalBalita - hadirBulanIni,
      belumDiukur: totalBalita - sudahUkur,
    };
  }
}
