import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Client } from '../../clients/entities/client.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Bill {
  @PrimaryGeneratedColumn()
  @ApiProperty({ example: 1, description: 'ID da fatura' })
  id: number;

  @Column()
  @ApiProperty({ example: 'Janeiro', description: 'Mês de referência da fatura' })
  referenceMonth: string;

  @Column()
  @ApiProperty({ example: 2023, description: 'Ano de referência da fatura' })
  referenceYear: number;

  @Column('float')
  @ApiProperty({ example: 100.5, description: 'Consumo de energia elétrica em kWh' })
  energyElectricKwh: number;

  @Column('float')
  @ApiProperty({ example: 150.75, description: 'Valor da energia elétrica consumida' })
  energyElectricValue: number;

  @Column('float')
  @ApiProperty({ example: 50.25, description: 'Consumo de energia SCEEE em kWh' })
  energySCEEEKwh: number;

  @Column('float')
  @ApiProperty({ example: 75.5, description: 'Valor da energia SCEEE consumida' })
  energySCEEEValue: number;

  @Column('float')
  @ApiProperty({ example: 20.0, description: 'Consumo de energia compensada em kWh' })
  energyCompensatedKwh: number;

  @Column('float')
  @ApiProperty({ example: 30.0, description: 'Valor da energia compensada' })
  energyCompensatedValue: number;

  @Column('float')
  @ApiProperty({ example: 10.0, description: 'Valor da iluminação pública' })
  publicLightingValue: number;

  @Column('float')
  @ApiProperty({ example: 170.75, description: 'Consumo total de energia em kWh' })
  totalEnergyConsumption: number;

  @Column('float')
  @ApiProperty({ example: 256.25, description: 'Valor total sem GD' })
  totalValueWithoutGD: number;

  @Column('float')
  @ApiProperty({ example: 30.0, description: 'Economia com GD' })
  gdSavings: number;

  @CreateDateColumn()
  @ApiProperty({ example: '2023-01-01T00:00:00.000Z', description: 'Data de criação da fatura' })
  createdAt: Date;

  @UpdateDateColumn()
  @ApiProperty({ example: '2023-01-01T00:00:00.000Z', description: 'Data de atualização da fatura' })
  updatedAt: Date;

  @ManyToOne(() => Client, client => client.bills)
  @ApiProperty({ type: () => Client, description: 'Cliente associado à fatura' })
  client: Client;
}