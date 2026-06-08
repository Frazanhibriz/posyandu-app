import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { omitPassword } from '../common/utils/omit-password';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { nik: dto.identifier },
          { username: dto.identifier }
        ],
      },
    });

    if (!user) {
      throw new UnauthorizedException('NIK/username atau password salah.');
    }

    const valid = await bcrypt.compare(dto.password, user.password);
    
    if (!valid) {
      throw new UnauthorizedException('NIK/username atau password salah.');
    }

    const access_token = await this.jwtService.signAsync({
      sub: user.id,
      role: user.role,
    });

    return {
      access_token,
      user: omitPassword(user),
    };
  }

  // JANGAN SAMPAI KETINGGALAN BAGIAN INI:
  async me(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException();
    }
    return omitPassword(user);
  }
}