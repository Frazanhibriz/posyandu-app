import { Body, Controller, Get, ParseIntPipe, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { AbsensiService } from './absensi.service';
import { BulkUpdateAbsensiDto } from './dto/bulk-update-absensi.dto';

@ApiTags('absensi')
@ApiBearerAuth()
@Controller('absensi')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'KADER')
export class AbsensiController {
  constructor(private readonly absensiService: AbsensiService) {}

  @Post('bulk')
  @ApiOperation({ summary: 'Bulk update absensi per bulan/tahun' })
  bulkUpdate(@Body() dto: BulkUpdateAbsensiDto) {
    return this.absensiService.bulkUpdate(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List absensi dengan filter hadir/tidak hadir' })
  findByMonth(
    @Query('tahun', ParseIntPipe) tahun: number,
    @Query('bulan', ParseIntPipe) bulan: number,
    @Query('isHadir') isHadir?: string,
  ) {
    const parsed =
      isHadir === undefined ? undefined : ['true', '1'].includes(isHadir.toLowerCase());
    return this.absensiService.findByMonth(tahun, bulan, parsed);
  }
}
