import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PrismaService } from './prisma/prisma.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getConnection } from 'typeorm';

async function testConnection() {
  console.log('Testando conexão com o banco de dados...');
  console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
  console.log(`URL do banco: ${process.env.DATABASE_URL}`);
  
  const app = await NestFactory.create(AppModule);
  
  try {
    // Testar conexão Prisma
    const prisma = app.get(PrismaService);
    console.log('Testando conexão Prisma...');
    const prismaUsers = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('Conexão Prisma bem-sucedida:', prismaUsers);
    
    // Testar conexão TypeORM
    console.log('Testando conexão TypeORM...');
    const connection = getConnection();
    const typeormResult = await connection.query('SELECT 1 as test');
    console.log('Conexão TypeORM bem-sucedida:', typeormResult);
    
    console.log('Todos os testes de conexão foram bem-sucedidos!');
  } catch (error) {
    console.error('Erro ao conectar ao banco de dados:', error);
  } finally {
    await app.close();
  }
}

testConnection();
