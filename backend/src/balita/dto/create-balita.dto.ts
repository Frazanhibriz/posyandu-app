import { Gender } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Min,
} from 'class-validator';

export class CreateBalitaDto {
  @ApiPropertyOptional({ example: '3201010203040001' })
  @IsOptional()
  @IsString()
  nik?: string;

  @ApiProperty({ example: 'Budi' })
  @IsString()
  @IsNotEmpty()
  nama!: string;

  @ApiProperty({ enum: Gender, example: Gender.LAKI_LAKI })
  @IsEnum(Gender)
  jenisKelamin!: Gender;

  @ApiProperty({ example: '2024-01-15' })
  @IsDateString()
  tglLahir!: string;

  @ApiProperty({ example: 1 })
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  anakKe!: number;

  @ApiProperty({ example: 1 })
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(0)
  rt!: number;

  @ApiProperty({ example: 2 })
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(0)
  rw!: number;

  @ApiProperty({ example: 'Ibu Ani' })
  @IsString()
  @IsNotEmpty()
  namaWali!: string;

  @ApiPropertyOptional({ example: '3201010101010002' })
  @IsOptional()
  @IsString()
  nikWali?: string;

  @ApiProperty({ example: '081234567890' })
  @Matches(/^(08|62|\+62)[0-9]{9,13}$/)
  noWhatsapp!: string;

  @ApiProperty({ example: 'Jl. Merdeka No. 1' })
  @IsString()
  @IsNotEmpty()
  alamat!: string;

  @ApiProperty({ example: 49.5 })
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @Min(1)
  panjangLahir!: number;

  @ApiProperty({ example: 3.2 })
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @Min(0.5)
  beratLahir!: number;

  @ApiProperty({ example: 34 })
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @Min(10)
  lingkarKepalaLahir!: number;

  @ApiProperty({ example: 39 })
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(20)
  usiaKehamilan!: number;

  @ApiProperty({ example: 6.1, description: 'Berat badan awal (kg)' })
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @Min(0.5)
  beratBadanAwal!: number;

  @ApiProperty({ example: 61, description: 'Tinggi/Panjang awal (cm)' })
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @Min(20)
  tinggiBadanAwal!: number;

  @ApiPropertyOptional({ example: 39.5 })
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  lingkarKepalaAwal?: number;

  @ApiPropertyOptional({ example: 12.8 })
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  lilaAwal?: number;

  @ApiPropertyOptional({ example: 'Pengukuran pertama saat pendaftaran' })
  @IsOptional()
  @IsString()
  catatanAwal?: string;
}
