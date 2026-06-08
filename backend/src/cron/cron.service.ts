import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { BalitaService } from '../balita/balita.service';
import { AbsensiService } from '../absensi/absensi.service';

@Injectable()
export class CronService {
  constructor(
    private readonly balitaService: BalitaService,
    private readonly absensiService: AbsensiService,
  ) {}

  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
  async handleMonthlyReset() {
    const now = new Date();
    await this.balitaService.archiveOver60Months();
    await this.absensiService.seedMonthlyDefault(now.getFullYear(), now.getMonth() + 1);
  }
}
