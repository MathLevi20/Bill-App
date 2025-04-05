import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule } from './modules/clients/clients.module';
import { BillsModule } from './modules/bills/bills.module';
import { PrismaModule } from './prisma/prisma.module';
import { Client } from './modules/clients/entities/client.entity';
import { Bill } from './modules/bills/entities/bill.entity';
import { ApiDocsModule } from './services/api-docs/api-docs.module';
import { PdfParserModule } from './services/pdf/pdf-parser.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerMiddleware } from './common/middleware/logger.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        // Determine se estamos em um ambiente Docker ou local
        const isDocker = process.env.NODE_ENV === 'docker';
        
        return {
          type: 'postgres',
          host: isDocker ? 'postgres' : 'localhost', // Use 'postgres' como hostname quando em Docker
          port: 5432,
          username: 'admin',
          password: 'admin',
          database: 'energy_bills',
          entities: [Client, Bill],
          synchronize: true,
        };
      },
    }),
    PrismaModule,
    ClientsModule,
    BillsModule,
    ApiDocsModule,
    PdfParserModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes('*');
  }
}
