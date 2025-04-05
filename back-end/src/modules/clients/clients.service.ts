import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from './entities/client.entity';
import { CreateClientDto } from './dto/create-client.dto';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(Client)
    private clientRepository: Repository<Client>,
    private prisma: PrismaService,
  ) {}

  async create(createClientDto: CreateClientDto): Promise<Client> {
    const client = this.clientRepository.create(createClientDto);
    return this.clientRepository.save(client);
  }

  async findAll(): Promise<Client[]> {
    return this.clientRepository.find();
  }

  async findOne(id: number): Promise<Client> {
    const client = await this.clientRepository.findOne({ where: { id } });
    if (!client) {
      throw new NotFoundException(`Cliente com ID ${id} não encontrado`);
    }
    return client;
  }

  async findByClientNumber(clientNumber: string): Promise<Client> {
    const client = await this.clientRepository.findOne({ where: { clientNumber } });
    if (!client) {
      throw new NotFoundException(`Cliente com número ${clientNumber} não encontrado`);
    }
    return client;
  }

  // Adicionar método para atualizar cliente
  async update(id: number, updateClientDto: Partial<Client>): Promise<Client> {
    const client = await this.findOne(id);
    
    // Atualizar apenas os campos presentes no DTO
    Object.assign(client, updateClientDto);
    
    return this.clientRepository.save(client);
  }
}