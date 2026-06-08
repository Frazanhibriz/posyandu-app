import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsIn, IsInt, IsOptional, Max, Min } from 'class-validator';

export class GetEvaluasiQueryDto {
  @ApiPropertyOptional({ example: 2026, description: 'Default: tahun sekarang' })
  @IsOptional()
  @Transform(({ value }) => (value === undefined ? undefined : Number(value)))
  @IsInt()
  @Min(2000)
  @Max(3000)
  tahun?: number;

  @ApiPropertyOptional({
    example: 'berat',
    enum: ['berat', 'panjang', 'lingkarKepala', 'lingkarLengan'],
    description: 'Default: berat',
  })
  @IsOptional()
  @IsIn(['berat', 'panjang', 'lingkarKepala', 'lingkarLengan'])
  type?: 'berat' | 'panjang' | 'lingkarKepala' | 'lingkarLengan';
}
