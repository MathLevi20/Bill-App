import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as fs from 'fs';
import * as path from 'path';

async function generateSwaggerJson() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('API de Faturas de Energia')
    .setDescription('API para extração e gerenciamento de dados de faturas de energia elétrica')
    .setVersion('1.0')
    .addTag('clients', 'Operações relacionadas aos clientes')
    .addTag('bills', 'Operações relacionadas às faturas')
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  
  // Salvar o documento Swagger como JSON
  const outputPath = path.resolve(process.cwd(), 'swagger-spec.json');
  fs.writeFileSync(outputPath, JSON.stringify(document, null, 2), { encoding: 'utf8' });
  
  console.log(`Swagger JSON gerado em: ${outputPath}`);
  
  await app.close();
}

generateSwaggerJson();
