import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreatePengukuranDto {
  @ApiProperty({ example: 'balita-uuid' })
  @IsString()
  balitaId!: string;

  @ApiProperty({ example: 5, minimum: 1, maximum: 12 })
  @IsInt()
  @Min(1)
  @Max(12)
  bulan!: number;

  @ApiProperty({ example: 2026 })
  @IsInt()
  tahun!: number;

  @ApiProperty({ example: 10.5 })
  @Transform(({ value }) => Number(value))
  @IsNumber()
  beratBadan!: number;

  @ApiProperty({ example: 78.2 })
  @Transform(({ value }) => Number(value))
  @IsNumber()
  tinggiBadan!: number;

  @ApiPropertyOptional({ example: 45.1 })
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  lingkarKepala?: number;

  @ApiPropertyOptional({ example: 14.6 })
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  lila?: number;

  @ApiPropertyOptional({ example: 'Kontrol bulan Mei' })
  @IsOptional()
  @IsString()
  catatan?: string;
}
