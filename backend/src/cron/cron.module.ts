import { Module } from '@nestjs/common';
import { AbsensiModule } from '../absensi/absensi.module';
import { BalitaModule } from '../balita/balita.module';
import { CronService } from './cron.service';

@Module({
  imports: [BalitaModule, AbsensiModule],
  providers: [CronService],
})
export class CronModule {}
