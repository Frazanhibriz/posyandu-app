import {
  Controller,
  Get,
  ParseIntPipe,
  Query,
  StreamableFile,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiProduces,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { ExportLaporanQueryDto } from './dto/export-laporan-query.dto';
import { ExportLaporanService } from './export-laporan.service';
import { LaporanService } from './laporan.service';

@ApiTags('laporan')
@ApiBearerAuth()
@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'KADER')
export class LaporanController {
  constructor(
    private readonly laporanService: LaporanService,
    private readonly exportLaporanService: ExportLaporanService,
  ) {}

  @Get('laporan')
  @ApiOperation({ summary: 'Summary laporan bulanan' })
  getLaporan(
    @Query('bulan', ParseIntPipe) bulan: number,
    @Query('tahun', ParseIntPipe) tahun: number,
  ) {
    return this.laporanService.getLaporan(bulan, tahun);
  }

  @Get('beranda')
  @ApiOperation({ summary: 'Statistik beranda bulan berjalan' })
  getBeranda() {
    return this.laporanService.getBeranda();
  }

  @Get('laporan/export/excel')
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

  @Get('laporan/export/csv')
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
}
