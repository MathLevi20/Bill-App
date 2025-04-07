import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as fs from 'fs';
import * as path from 'path';
// import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'], // Aumentar o nível de logs para debug
  });
  
  app.useGlobalPipes(new ValidationPipe());
  
  // Mova o filtro de exceção para depois da configuração de rotas
  // para garantir que ele não interfira na detecção de rotas válidas
  
  // Configurar CORS para permitir acesso aos recursos
  app.enableCors({
    origin: true, // Em produção, defina os domínios permitidos
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    exposedHeaders: ['Content-Disposition'], // Importante para downloads
  });

  // Configuração do Swagger aprimorada
  const config = new DocumentBuilder()
    .setTitle('API de Faturas de Energia')
    .setDescription(`
      API para extração e gerenciamento de dados de faturas de energia elétrica.
      
      ## Funcionalidades Principais
      
      - Cadastro e gerenciamento de clientes
      - Upload, extração e armazenamento de dados de faturas de energia em PDF
      - Consulta de faturas por cliente, período ou outros filtros
      - Visualização de documentos PDF armazenados
      - Processamento em lote de arquivos PDF de fatura
    `)
    .setVersion('1.0')
    .setContact('Equipe de Desenvolvimento', 'https://example.com', 'dev@example.com')
    .setExternalDoc('Documentação Completa', 'https://example.com/docs')
    .addTag('clients', 'Operações relacionadas aos clientes')
    .addTag('bills', 'Operações relacionadas às faturas')
    .addBearerAuth() // Preparando para futura implementação de autenticação
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  
  // Customizar opções do Swagger UI para melhor experiência
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none', // Colapsar todas as rotas por padrão
      filter: true, // Habilitar filtro de busca
      tagsSorter: 'alpha', // Ordenar tags alfabeticamente
    },
  });

  // Salvar o documento Swagger como JSON
  const outputPath = path.resolve(process.cwd(), 'swagger-spec.json');
  fs.writeFileSync(outputPath, JSON.stringify(document, null, 2), { encoding: 'utf8' });
  
  // Comentado temporariamente para teste
  // app.useGlobalFilters(new HttpExceptionFilter());
  
  // Alterando a porta para 4000
  const port = process.env.PORT || 4000;
  await app.listen(port);
  console.log(`Application is running on: ${await app.getUrl()}`);
  console.log(`Swagger documentation available at: ${await app.getUrl()}/api`);
  console.log(`Root endpoint available at: ${await app.getUrl()}/`);
  
  // Imprimir todas as rotas registradas para debug
  const server = app.getHttpServer();
  const router = server._events.request._router;
  
  console.log('Rotas registradas:');
  router.stack.forEach((layer) => {
    if (layer.route) {
      const path = layer.route.path;
      const methods = Object.keys(layer.route.methods).join(',').toUpperCase();
      console.log(`${methods} ${path}`);
    }
  });
}
bootstrap();
