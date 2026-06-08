import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { omitPassword } from '../common/utils/omit-password';
import { RolesConst } from '../common/constants/roles';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateUserDto) {
    const hashed = await bcrypt.hash(dto.password, 10);
    try {
      const user = await this.prisma.user.create({
        data: {
          nik: dto.nik,
          nama: dto.nama,
          email: dto.email,
          password: hashed,
          username: dto.username,
          role: RolesConst.KADER,
        },
      });
      return omitPassword(user);
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2002'
      ) {
        throw new ConflictException('NIK, username, atau email sudah digunakan.');
      }
      throw e;
    }
  }

  async findAll() {
    const users = await this.prisma.user.findMany({
      where: { role: RolesConst.KADER },
      orderBy: { createdAt: 'desc' },
    });
    return users.map(omitPassword);
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findFirst({
      where: { id, role: RolesConst.KADER },
    });
    if (!user) {
      throw new NotFoundException('Kader tidak ditemukan.');
    }
    return omitPassword(user);
  }

  async update(id: string, dto: UpdateUserDto) {
    await this.ensureKader(id);
    const hasField =
      dto.nik !== undefined ||
      dto.nama !== undefined ||
      dto.email !== undefined ||
      dto.username !== undefined ||
      dto.password !== undefined;
    if (!hasField) {
      throw new BadRequestException('Tidak ada field yang diperbarui.');
    }
    const data: Prisma.UserUpdateInput = {};
    if (dto.nik !== undefined) data.nik = dto.nik;
    if (dto.nama !== undefined) data.nama = dto.nama;
    if (dto.email !== undefined) data.email = dto.email;
    if (dto.username !== undefined) data.username = dto.username;
    if (dto.password !== undefined) {
      data.password = await bcrypt.hash(dto.password, 10);
    }
    try {
      const user = await this.prisma.user.update({
        where: { id },
        data,
      });
      return omitPassword(user);
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2002'
      ) {
        throw new ConflictException('NIK, username, atau email sudah digunakan.');
      }
      throw e;
    }
  }

  async remove(id: string) {
    await this.ensureKader(id);
    try {
      await this.prisma.user.delete({ where: { id } });
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2003'
      ) {
        throw new ConflictException(
          'Kader tidak dapat dihapus karena masih terhubung ke data pengukuran.',
        );
      }
      throw e;
    }
  }

  private async ensureKader(id: string) {
    const user = await this.prisma.user.findFirst({
      where: { id, role: RolesConst.KADER },
    });
    if (!user) {
      throw new NotFoundException('Kader tidak ditemukan.');
    }
  }
}
