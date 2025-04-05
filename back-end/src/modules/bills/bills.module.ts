import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BillsService } from './bills.service';
import { BillsController } from './bills.controller';
import { Bill } from './entities/bill.entity';
import { ClientsModule } from '../clients/clients.module';
import { PrismaModule } from '../../prisma/prisma.module';
import { PdfParserModule } from '../../services/pdf/pdf-parser.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([Bill]),
    ClientsModule,
    PrismaModule,
    PdfParserModule,
    ConfigModule,
  ],
  controllers: [BillsController],
  providers: [BillsService],
})
export class BillsModule {}
