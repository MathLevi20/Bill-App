import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBillDto {
  @ApiProperty({ description: 'ID do cliente' })
  @IsNotEmpty()
  @IsNumber()
  clientId: number;

  @ApiProperty({ description: 'Mês de referência da fatura' })
  @IsNotEmpty()
  @IsString()
  referenceMonth: string;

  @ApiProperty({ description: 'Ano de referência da fatura' })
  @IsNotEmpty()
  @IsNumber()
  referenceYear: number;

  @ApiProperty({ description: 'Consumo de energia elétrica em kWh' })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  energyElectricKwh: number;

  @ApiProperty({ description: 'Valor da energia elétrica consumida' })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  energyElectricValue: number;

  @ApiProperty({ description: 'Consumo de energia SCEEE em kWh' })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  energySCEEEKwh: number;

  @ApiProperty({ description: 'Valor da energia SCEEE consumida' })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  energySCEEEValue: number;

  @ApiProperty({ description: 'Consumo de energia compensada em kWh' })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  energyCompensatedKwh: number;

  @ApiProperty({ description: 'Valor da energia compensada' })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  energyCompensatedValue: number;

  @ApiProperty({ description: 'Valor da iluminação pública' })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  publicLightingValue: number;
}