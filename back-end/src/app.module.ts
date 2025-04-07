import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule } from './modules/clients/clients.module';
import { BillsModule } from './modules/bills/bills.module';
import { PrismaModule } from './prisma/prisma.module';
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
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get<string>('NODE_ENV') === 'production'
          ? configService.get<string>('DATABASE_URL')
          : configService.get<string>('DATABASE_URL_LOCAL'),
        entities: [__dirname + '/modules/**/*.entity{.ts,.js}'],
        synchronize: true,
      }),
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
