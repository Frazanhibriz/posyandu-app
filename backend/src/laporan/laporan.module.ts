import { Module } from '@nestjs/common';
import { ExportLaporanService } from './export-laporan.service';
import { LaporanController } from './laporan.controller';
import { LaporanService } from './laporan.service';

@Module({
  controllers: [LaporanController],
  providers: [LaporanService, ExportLaporanService],
  exports: [ExportLaporanService],
})
export class LaporanModule {}
