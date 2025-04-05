import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Bill } from '../../bills/entities/bill.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Client {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @ApiProperty({ description: 'Nome do cliente' })
  name: string;

  @Column({ unique: true })
  @ApiProperty({ description: 'Número do cliente' })
  clientNumber: string;

  @OneToMany(() => Bill, bill => bill.client)
  @ApiProperty({ type: () => Bill, isArray: true, description: 'Faturas do cliente' })
  bills: Bill[];
}