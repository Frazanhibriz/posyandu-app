import { AlasanHapus } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class RemoveBalitaDto {
  @ApiProperty({ enum: AlasanHapus, example: AlasanHapus.PERMINTAAN_WALI })
  @IsEnum(AlasanHapus)
  alasan!: AlasanHapus;

  @ApiPropertyOptional({ example: 'Pindah domisili ke luar kota' })
  @IsOptional()
  @IsString()
  catatan?: string;
}
