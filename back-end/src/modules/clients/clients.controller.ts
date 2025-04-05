import { Controller, Get, Post, Body, Param, NotFoundException } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { Client } from './entities/client.entity';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

@ApiTags('clients')
@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Post()
  @ApiOperation({ summary: 'Criar um novo cliente' })
  @ApiResponse({ status: 201, description: 'Cliente criado com sucesso', type: Client })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  async create(@Body() createClientDto: CreateClientDto): Promise<Client> {
    return this.clientsService.create(createClientDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os clientes' })
  @ApiResponse({ status: 200, description: 'Lista de clientes retornada com sucesso', type: [Client] })
  async findAll(): Promise<Client[]> {
    return this.clientsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar um cliente pelo ID' })
  @ApiParam({ name: 'id', description: 'ID do cliente' })
  @ApiResponse({ status: 200, description: 'Cliente encontrado', type: Client })
  @ApiResponse({ status: 404, description: 'Cliente não encontrado' })
  async findOne(@Param('id') id: string): Promise<Client> {
    const client = await this.clientsService.findOne(+id);
    if (!client) {
      throw new NotFoundException(`Cliente com ID ${id} não encontrado`);
    }
    return client;
  }

  @Get('number/:clientNumber')
  @ApiOperation({ summary: 'Buscar um cliente pelo número do cliente' })
  @ApiParam({ name: 'clientNumber', description: 'Número do cliente' })
  @ApiResponse({ status: 200, description: 'Cliente encontrado', type: Client })
  @ApiResponse({ status: 404, description: 'Cliente não encontrado' })
  async findByClientNumber(@Param('clientNumber') clientNumber: string): Promise<Client> {
    const client = await this.clientsService.findByClientNumber(clientNumber);
    if (!client) {
      throw new NotFoundException(`Cliente com número ${clientNumber} não encontrado`);
    }
    return client;
  }
}