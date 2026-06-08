import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsInt, IsOptional, IsString, Max, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class AbsensiItemDto {
  @ApiProperty({ example: 'balita-uuid' })
  @IsString()
  balitaId!: string;

  @ApiProperty({ example: true })
  @IsBoolean()
  isHadir!: boolean;

  @ApiPropertyOptional({ example: '' })
  @IsOptional()
  @IsString()
  keterangan?: string;
}

export class BulkUpdateAbsensiDto {
  @ApiProperty({ example: 5, minimum: 1, maximum: 12 })
  @IsInt()
  @Min(1)
  @Max(12)  
  bulan!: number;

  @ApiProperty({ example: 2026 })
  @IsInt()
  tahun!: number;

  @ApiProperty({ type: [AbsensiItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AbsensiItemDto)
  items!: AbsensiItemDto[];
}
