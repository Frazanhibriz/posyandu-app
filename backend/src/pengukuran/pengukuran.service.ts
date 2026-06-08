import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthUser } from '../common/types/auth-user.type';
import { hitungUsiaBulan, tanggalAwalBulan, tanggalAkhirBulan } from '../common/utils/usia-bulan';
import { CreatePengukuranDto } from './dto/create-pengukuran.dto';
import { GetEvaluasiQueryDto } from './dto/get-evaluasi-query.dto';
import { UpdatePengukuranDto } from './dto/update-pengukuran.dto';

@Injectable()
export class PengukuranService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreatePengukuranDto, user: AuthUser) {
    const balita = await this.prisma.balita.findUnique({ where: { id: dto.balitaId } });
    if (!balita) throw new NotFoundException('Balita tidak ditemukan.');

    this.validateLila(dto.lila, balita.tglLahir, dto.tahun, dto.bulan);
    const tglUkur = tanggalAwalBulan(dto.tahun, dto.bulan);

    return this.prisma.pengukuran.create({
      data: {
        balitaId: dto.balitaId,
        kaderId: user.id,
        tglUkur,
        beratBadan: dto.beratBadan,
        tinggiBadan: dto.tinggiBadan,
        lingkarKepala: dto.lingkarKepala,
        lila: dto.lila,
        catatan: dto.catatan,
      },
    });
  }

  async findByMonth(tahun: number, bulan: number) {
    return this.prisma.pengukuran.findMany({
      where: {
        tglUkur: {
          gte: tanggalAwalBulan(tahun, bulan),
          lt: tanggalAkhirBulan(tahun, bulan),
        },
      },
      include: { balita: true, kader: true },
      orderBy: { tglUkur: 'asc' },
    });
  }

  async update(id: string, dto: UpdatePengukuranDto, user: AuthUser) {
    const existing = await this.prisma.pengukuran.findUnique({
      where: { id },
      include: { balita: true },
    });
    if (!existing) throw new NotFoundException('Data pengukuran tidak ditemukan.');

    const tahun = dto.tahun ?? existing.tglUkur.getFullYear();
    const bulan = dto.bulan ?? existing.tglUkur.getMonth() + 1;
    const lila = dto.lila ?? existing.lila ?? undefined;
    this.validateLila(lila, existing.balita.tglLahir, tahun, bulan);

    return this.prisma.pengukuran.update({
      where: { id },
      data: {
        tglUkur: dto.tahun || dto.bulan ? tanggalAwalBulan(tahun, bulan) : undefined,
        beratBadan: dto.beratBadan,
        tinggiBadan: dto.tinggiBadan,
        lingkarKepala: dto.lingkarKepala,
        lila: dto.lila,
        catatan: dto.catatan,
        kaderId: user.id,
      },
    });
  }

  async getEvaluasi(balitaId: string, query: GetEvaluasiQueryDto) {
    const balita = await this.prisma.balita.findUnique({
      where: { id: balitaId },
      select: { id: true, nama: true, tglLahir: true },
    });
    if (!balita) {
      throw new NotFoundException('Balita tidak ditemukan.');
    }

    const tahun = query.tahun ?? new Date().getFullYear();
    const type = query.type ?? 'berat';
    const start = tanggalAwalBulan(tahun, 1);
    const end = tanggalAwalBulan(tahun + 1, 1);

    const pengukuranTahunan = await this.prisma.pengukuran.findMany({
      where: {
        balitaId,
        tglUkur: { gte: start, lt: end },
      },
      orderBy: { tglUkur: 'asc' },
    });

    const grafikData: Array<number | null> = Array(12).fill(null);
    for (const item of pengukuranTahunan) {
      const monthIndex = item.tglUkur.getMonth();
      grafikData[monthIndex] = this.getMetricValue(item, type);
    }

    const tigaTerbaru = await this.prisma.pengukuran.findMany({
      where: { balitaId },
      orderBy: { tglUkur: 'desc' },
      take: 3,
    });
    if (tigaTerbaru.length < 3) {
      throw new BadRequestException(
        'Data pengukuran belum cukup. Minimal harus ada 3 bulan data terbaru berurutan.',
      );
    }

    const sortedAsc = [...tigaTerbaru].sort(
      (a, b) => a.tglUkur.getTime() - b.tglUkur.getTime(),
    );
    this.assertConsecutiveMonths(sortedAsc.map((d) => d.tglUkur));

    const analisis = this.generateManualAnalysis(sortedAsc);

    return {
      balita: {
        id: balita.id,
        nama: balita.nama,
        usiaBulan: hitungUsiaBulan(balita.tglLahir),
      },
      grafik: {
        tahun,
        type,
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'],
        data: grafikData,
      },
      analisis,
    };
  }

  private getMetricValue(
    item: {
      beratBadan: number;
      tinggiBadan: number;
      lingkarKepala: number | null;
      lila: number | null;
    },
    type: 'berat' | 'panjang' | 'lingkarKepala' | 'lingkarLengan',
  ): number | null {
    if (type === 'berat') return item.beratBadan;
    if (type === 'panjang') return item.tinggiBadan;
    if (type === 'lingkarKepala') return item.lingkarKepala;
    return item.lila;
  }

  private assertConsecutiveMonths(dates: Date[]) {
    for (let i = 1; i < dates.length; i += 1) {
      const prev = dates[i - 1];
      const cur = dates[i];
      const diffMonth =
        (cur.getFullYear() - prev.getFullYear()) * 12 +
        (cur.getMonth() - prev.getMonth());
      if (diffMonth !== 1) {
        throw new BadRequestException(
          '3 data terbaru tidak berurutan per bulan. Mohon lengkapi data pengukuran bulanan.',
        );
      }
    }
  }

  private generateManualAnalysis(
    dataAsc: Array<{
      beratBadan: number;
      tinggiBadan: number;
      lingkarKepala: number | null;
      lila: number | null;
      tglUkur: Date;
    }>,
  ): string {
    const [bulan1, bulan2, bulan3] = dataAsc;
    const dBerat = bulan3.beratBadan - bulan2.beratBadan;
    const dTinggi = bulan3.tinggiBadan - bulan2.tinggiBadan;
    const trenBerat =
      dBerat > 0
        ? `berat badan naik ${dBerat.toFixed(2)} kg`
        : dBerat < 0
          ? `berat badan turun ${Math.abs(dBerat).toFixed(2)} kg`
          : 'berat badan stabil';
    const trenTinggi =
      dTinggi > 0
        ? `tinggi/panjang badan naik ${dTinggi.toFixed(2)} cm`
        : dTinggi < 0
          ? `tinggi/panjang badan turun ${Math.abs(dTinggi).toFixed(2)} cm`
          : 'tinggi/panjang badan stabil';

    const lonjakanBerat3Bulan = bulan3.beratBadan - bulan1.beratBadan;
    const lonjakanTinggi3Bulan = bulan3.tinggiBadan - bulan1.tinggiBadan;

    return `Berdasarkan 3 bulan data terakhir, ${trenBerat} dan ${trenTinggi}. Dalam periode 3 bulan, perubahan total berat ${lonjakanBerat3Bulan.toFixed(2)} kg dan tinggi/panjang ${lonjakanTinggi3Bulan.toFixed(2)} cm. Silakan lanjutkan pemantauan rutin setiap bulan untuk evaluasi pertumbuhan yang lebih akurat.`;
  }

  private validateLila(
    lila: number | undefined,
    tglLahir: Date,
    tahun: number,
    bulan: number,
  ) {
    if (lila === undefined || lila === null) return;
    const usiaBulan = hitungUsiaBulan(tglLahir, tanggalAwalBulan(tahun, bulan));
    if (usiaBulan <= 6) {
      throw new BadRequestException('LILA tidak boleh diisi untuk usia 6 bulan ke bawah.');
    }
  }
}
