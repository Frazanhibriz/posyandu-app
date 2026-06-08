import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { tanggalAkhirBulan, tanggalAwalBulan } from '../common/utils/usia-bulan';
import { BulkUpdateAbsensiDto } from './dto/bulk-update-absensi.dto';

@Injectable()
export class AbsensiService {
  constructor(private readonly prisma: PrismaService) {}

  async bulkUpdate(dto: BulkUpdateAbsensiDto) {
    const start = tanggalAwalBulan(dto.tahun, dto.bulan);
    const end = tanggalAkhirBulan(dto.tahun, dto.bulan);

    await this.prisma.$transaction(async (tx) => {
      for (const item of dto.items) {
        const existing = await tx.absensi.findFirst({
          where: {
            balitaId: item.balitaId,
            tglHadir: { gte: start, lt: end },
          },
        });
        if (existing) {
          await tx.absensi.update({
            where: { id: existing.id },
            data: {
              isHadir: item.isHadir,
              keterangan: item.keterangan,
            },
          });
          continue;
        }
        await tx.absensi.create({
          data: {
            balitaId: item.balitaId,
            isHadir: item.isHadir,
            keterangan: item.keterangan,
            tglHadir: start,
          },
        });
      }
    });

    return this.findByMonth(dto.tahun, dto.bulan);
  }

  async findByMonth(tahun: number, bulan: number, isHadir?: boolean) {
    const start = tanggalAwalBulan(tahun, bulan);
    const end = tanggalAkhirBulan(tahun, bulan);
    return this.prisma.absensi.findMany({
      where: {
        tglHadir: { gte: start, lt: end },
        isHadir: isHadir === undefined ? undefined : isHadir,
      },
      include: { balita: true },
      orderBy: [{ isHadir: 'desc' }, { balita: { nama: 'asc' } }],
    });
  }

  async seedMonthlyDefault(tahun: number, bulan: number) {
    const start = tanggalAwalBulan(tahun, bulan);
    const end = tanggalAkhirBulan(tahun, bulan);
    const [balitas, existing] = await Promise.all([
      this.prisma.balita.findMany({ select: { id: true } }),
      this.prisma.absensi.findMany({
        where: { tglHadir: { gte: start, lt: end } },
        select: { balitaId: true },
      }),
    ]);

    const existingIds = new Set(existing.map((i) => i.balitaId));
    const data = balitas
      .filter((b) => !existingIds.has(b.id))
      .map((b) => ({
        balitaId: b.id,
        isHadir: false,
        tglHadir: start,
      }));

    if (data.length) {
      await this.prisma.absensi.createMany({ data });
    }
    return { created: data.length };
  }
}
