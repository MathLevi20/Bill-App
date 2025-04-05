import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateClientDto {
  @ApiProperty({
    description: 'Nome do cliente',
    example: 'João da Silva',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Número do cliente',
    example: '123456',
  })
  @IsNotEmpty()
  @IsString()
  clientNumber: string;
}