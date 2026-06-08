import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AlasanHapus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuthUser } from '../common/types/auth-user.type';
import { hitungUsiaBulan, tanggalAwalBulan } from '../common/utils/usia-bulan';
import { CreateBalitaDto } from './dto/create-balita.dto';
import { RemoveBalitaDto } from './dto/remove-balita.dto';
import { UpdateBalitaDto } from './dto/update-balita.dto';

@Injectable()
export class BalitaService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateBalitaDto, user: AuthUser) {
    const tglLahir = new Date(dto.tglLahir);
    const usiaBulan = hitungUsiaBulan(tglLahir);
    if (usiaBulan < 0) {
      throw new BadRequestException('Tanggal lahir tidak valid.');
    }
    if (dto.lilaAwal !== undefined && dto.lilaAwal !== null && usiaBulan <= 6) {
      throw new BadRequestException('LILA hanya boleh diisi untuk usia di atas 6 bulan.');
    }
    const bulanIni = new Date();
    const tglUkur = tanggalAwalBulan(
      bulanIni.getFullYear(),
      bulanIni.getMonth() + 1,
    );
    try {
      return await this.prisma.$transaction(async (tx) => {
        const balita = await tx.balita.create({
          data: {
            nik: dto.nik,
            nama: dto.nama,
            jenisKelamin: dto.jenisKelamin,
            tglLahir,
            anakKe: dto.anakKe,
            rt: dto.rt,
            rw: dto.rw,
            namaWali: dto.namaWali,
            nikWali: dto.nikWali,
            noWhatsapp: dto.noWhatsapp,
            alamat: dto.alamat,
            panjangLahir: dto.panjangLahir,
            beratLahir: dto.beratLahir,
            lingkarKepalaLahir: dto.lingkarKepalaLahir,
            usiaKehamilan: dto.usiaKehamilan,
          },
        });

        await tx.pengukuran.create({
          data: {
            balitaId: balita.id,
            kaderId: user.id,
            tglUkur,
            beratBadan: dto.beratBadanAwal,
            tinggiBadan: dto.tinggiBadanAwal,
            lingkarKepala: dto.lingkarKepalaAwal,
            lila: dto.lilaAwal,
            catatan: dto.catatanAwal,
          },
        });

        return { ...balita, usiaBulan };
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        throw new ConflictException('NIK balita sudah terdaftar.');
      }
      throw e;
    }
  }

  async findAll() {
    const data = await this.prisma.balita.findMany({
      include: { pengukurans: true },
      orderBy: { createdAt: 'desc' },
    });
    return data.map((item) => ({
      ...item,
      usiaBulan: hitungUsiaBulan(item.tglLahir),
      pengukuran: item.pengukurans.map((p) => ({
        id: p.id,
        balitaId: p.balitaId,
        bulan: p.tglUkur.getMonth() + 1,
        tahun: p.tglUkur.getFullYear(),
        beratBadan: p.beratBadan,
        tinggiBadan: p.tinggiBadan,
        lingkarKepala: p.lingkarKepala,
        lingkarLengan: p.lila,
      })),
    }));
  }

  async findOne(id: string) {
    const balita = await this.prisma.balita.findUnique({
      where: { id },
      include: {
        pengukurans: true,
        absensis: true,
      },
    });
    if (!balita) throw new NotFoundException('Balita tidak ditemukan.');
    return {
      ...balita,
      usiaBulan: hitungUsiaBulan(balita.tglLahir),
      pengukuran: balita.pengukurans.map((p) => ({
        id: p.id,
        balitaId: p.balitaId,
        bulan: p.tglUkur.getMonth() + 1,
        tahun: p.tglUkur.getFullYear(),
        beratBadan: p.beratBadan,
        tinggiBadan: p.tinggiBadan,
        lingkarKepala: p.lingkarKepala,
        lingkarLengan: p.lila,
      })),
      absensi: balita.absensis.map((a) => ({
        id: a.id,
        balitaId: a.balitaId,
        bulan: a.tglHadir.getMonth() + 1,
        tahun: a.tglHadir.getFullYear(),
        isHadir: a.isHadir,
      })),
    };
  }

  async update(id: string, dto: UpdateBalitaDto) {
    await this.ensureExists(id);
    try {
      return await this.prisma.balita.update({
        where: { id },
        data: {
          ...dto,
          tglLahir: dto.tglLahir ? new Date(dto.tglLahir) : undefined,
        },
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        throw new ConflictException('NIK balita sudah digunakan.');
      }
      throw e;
    }
  }

  async remove(id: string, dto: RemoveBalitaDto) {
    const balita = await this.ensureExists(id);
    await this.prisma.$transaction(async (tx) => {
      await tx.balitaTerhapus.create({
        data: {
          namaBalita: balita.nama,
          nikBalita: balita.nik,
          namaWali: balita.namaWali,
          alasan: dto.alasan,
          catatan: dto.catatan,
        },
      });
      await tx.balita.delete({ where: { id: balita.id } });
    });
  }

  async archiveOver60Months() {
    const semua = await this.prisma.balita.findMany();
    const target = semua.filter((b) => hitungUsiaBulan(b.tglLahir) > 60);
    if (!target.length) return { archived: 0 };

    await this.prisma.$transaction(async (tx) => {
      await tx.balitaTerhapus.createMany({
        data: target.map((balita) => ({
          namaBalita: balita.nama,
          nikBalita: balita.nik,
          namaWali: balita.namaWali,
          alasan: AlasanHapus.OTOMATIS_SISTEM,
          catatan: 'Arsip otomatis karena usia lebih dari 60 bulan.',
        })),
      });
      await tx.balita.deleteMany({ where: { id: { in: target.map((t) => t.id) } } });
    });

    return { archived: target.length };
  }

  private async ensureExists(id: string) {
    const balita = await this.prisma.balita.findUnique({ where: { id } });
    if (!balita) throw new NotFoundException('Balita tidak ditemukan.');
    return balita;
  }
}
