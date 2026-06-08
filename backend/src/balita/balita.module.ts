import { Module } from '@nestjs/common';
import { BalitaController } from './balita.controller';
import { BalitaService } from './balita.service';

@Module({
  controllers: [BalitaController],
  providers: [BalitaService],
  exports: [BalitaService],
})
export class BalitaModule {}
