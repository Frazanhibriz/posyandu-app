import { Module } from '@nestjs/common';
import { LaporanModule } from '../laporan/laporan.module';
import { PengukuranController } from './pengukuran.controller';
import { PengukuranService } from './pengukuran.service';

@Module({
  imports: [LaporanModule],
  controllers: [PengukuranController],
  providers: [PengukuranService],
  exports: [PengukuranService],
})
export class PengukuranModule {}
