import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as fs from 'fs';
import * as path from 'path';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Configure URL-encoded path
  app.setGlobalPrefix('', {
    exclude: ['/api', '/'],
  });
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new HttpExceptionFilter());
  
  // Configurar CORS para permitir acesso aos recursos
  app.enableCors({
    origin: true, // Em produção, defina os domínios permitidos
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    exposedHeaders: ['Content-Disposition'], // Importante para downloads
  });

  // Configuração do Swagger
  const config = new DocumentBuilder()
    .setTitle('API de Faturas de Energia')
    .setDescription('API para extração e gerenciamento de dados de faturas de energia elétrica')
    .setVersion('1.0')
    .addTag('clients', 'Operações relacionadas aos clientes')
    .addTag('bills', 'Operações relacionadas às faturas')
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Salvar o documento Swagger como JSON
  const outputPath = path.resolve(process.cwd(), 'swagger-spec.json');
  fs.writeFileSync(outputPath, JSON.stringify(document, null, 2), { encoding: 'utf8' });
  
  // Alterando a porta para 4000
  const port = 4000;
  await app.listen(port);
  console.log(`Application is running on: ${await app.getUrl()}`);
  console.log(`Swagger documentation available at: ${await app.getUrl()}/api`);
}
bootstrap();
