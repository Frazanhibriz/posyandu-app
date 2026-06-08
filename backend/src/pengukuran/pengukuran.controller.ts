import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  StreamableFile,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiProduces,
  ApiTags,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { AuthUser } from '../common/types/auth-user.type';
import { ExportLaporanQueryDto } from '../laporan/dto/export-laporan-query.dto';
import { ExportLaporanService } from '../laporan/export-laporan.service';
import { CreatePengukuranDto } from './dto/create-pengukuran.dto';
import { GetEvaluasiQueryDto } from './dto/get-evaluasi-query.dto';
import { UpdatePengukuranDto } from './dto/update-pengukuran.dto';
import { PengukuranService } from './pengukuran.service';

type AuthedRequest = Request & { user: AuthUser };

@ApiTags('pengukuran')
@ApiBearerAuth()
@Controller('pengukuran')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'KADER')
export class PengukuranController {
  constructor(
    private readonly pengukuranService: PengukuranService,
    private readonly exportLaporanService: ExportLaporanService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Input pengukuran (mendukung backdate bulan/tahun)' })
  create(@Body() dto: CreatePengukuranDto, @Req() req: AuthedRequest) {
    return this.pengukuranService.create(dto, req.user);
  }

  @Get()
  @ApiOperation({ summary: 'List pengukuran berdasarkan bulan/tahun' })
  findByMonth(
    @Query('tahun', ParseIntPipe) tahun: number,
    @Query('bulan', ParseIntPipe) bulan: number,
  ) {
    return this.pengukuranService.findByMonth(tahun, bulan);
  }

  @Get('evaluasi/:balitaId')
  @ApiOperation({
    summary: 'Evaluasi balita: grafik tahunan dan analisis tren pertumbuhan',
  })
  getEvaluasi(
    @Param('balitaId', ParseUUIDPipe) balitaId: string,
    @Query() query: GetEvaluasiQueryDto,
  ) {
    return this.pengukuranService.getEvaluasi(balitaId, query);
  }

  @Get('export/excel')
  @ApiOperation({
    summary: 'Export laporan bayi/balita format ILP Sidorejo Kidul (Excel)',
  })
  @ApiProduces(
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  )
  async exportExcel(@Query() query: ExportLaporanQueryDto) {
    const buffer = await this.exportLaporanService.generateExcelBuffer(query);
    return new StreamableFile(buffer, {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      disposition: `attachment; filename="laporan-balita-${query.tahun}.xlsx"`,
    });
  }

  @Get('export/csv')
  @ApiOperation({
    summary: 'Export laporan bayi/balita format ILP Sidorejo Kidul (CSV)',
  })
  @ApiProduces('text/csv')
  async exportCsv(@Query() query: ExportLaporanQueryDto) {
    const buffer = await this.exportLaporanService.generateCsvBuffer(query);
    return new StreamableFile(buffer, {
      type: 'text/csv; charset=utf-8',
      disposition: `attachment; filename="laporan-balita-${query.tahun}.csv"`,
    });
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Edit pengukuran' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePengukuranDto,
    @Req() req: AuthedRequest,
  ) {
    return this.pengukuranService.update(id, dto, req.user);
  }
}
