import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class ExportLaporanQueryDto {
  @ApiProperty({ example: 2026, description: 'Tahun laporan kunjungan (Jan–Des)' })
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(2000)
  @Max(3000)
  tahun!: number;

  @ApiPropertyOptional({ example: 4, description: 'Bulan laporan untuk header (1–12)' })
  @IsOptional()
  @Transform(({ value }) => (value === undefined ? undefined : Number(value)))
  @IsInt()
  @Min(1)
  @Max(12)
  bulan?: number;

  @ApiPropertyOptional({ example: 9, description: 'Filter RW (opsional)' })
  @IsOptional()
  @Transform(({ value }) => (value === undefined ? undefined : Number(value)))
  @IsInt()
  @Min(0)
  rw?: number;

  @ApiPropertyOptional({ example: 'ILP CERIA 9' })
  @IsOptional()
  @IsString()
  namaPosyandu?: string;
}
