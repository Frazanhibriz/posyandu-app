import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { AuthUser } from '../common/types/auth-user.type';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BalitaService } from './balita.service';
import { CreateBalitaDto } from './dto/create-balita.dto';
import { RemoveBalitaDto } from './dto/remove-balita.dto';
import { UpdateBalitaDto } from './dto/update-balita.dto';

type AuthedRequest = Request & { user: AuthUser };

@ApiTags('balita')
@ApiBearerAuth()
@Controller('balita')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'KADER')
export class BalitaController {
  constructor(private readonly balitaService: BalitaService) {}

  @Post()
  @ApiOperation({ summary: 'Registrasi balita + pengukuran pertama bulan berjalan' })
  create(@Body() dto: CreateBalitaDto, @Req() req: AuthedRequest) {
    return this.balitaService.create(dto, req.user);
  }

  @Get()
  @ApiOperation({ summary: 'Daftar balita aktif' })
  findAll() {
    return this.balitaService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detail balita aktif' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.balitaService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Edit data balita' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateBalitaDto) {
    return this.balitaService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Hapus balita (arsipkan ke BalitaTerhapus)' })
  remove(@Param('id', ParseUUIDPipe) id: string, @Body() dto: RemoveBalitaDto) {
    return this.balitaService.remove(id, dto);
  }
}
