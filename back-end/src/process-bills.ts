import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BillsService } from './modules/bills/bills.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const billsService = app.get(BillsService);
  
  console.log('Iniciando processamento de PDFs na pasta de faturas...');
  
  // Obter argumentos da linha de comando
  const forceUpdate = process.argv.includes('--force-update');
  
  // Obter filtro de cliente, se fornecido
  const clientFilterArg = process.argv.find(arg => arg.startsWith('--client='));
  const clientNumberFilter = clientFilterArg ? clientFilterArg.split('=')[1] : undefined;
  
  if (clientNumberFilter) {
    console.log(`Aplicando filtro para cliente: ${clientNumberFilter}`);
  }
  
  if (forceUpdate) {
    console.log('Modo de atualização forçada: faturas existentes serão atualizadas');
  }
  
  try {
    const result = await billsService.processFilesFromFaturasFolder({
      forceUpdate,
      clientNumberFilter
    });
    
    console.log(`\n====== RESULTADO DO PROCESSAMENTO ======`);
    console.log(`Total de arquivos: ${result.total}`);
    console.log(`Processados com sucesso: ${result.processed}`);
    console.log(`Arquivos com falha: ${result.failed.length}`);
    
    if (result.failed.length > 0) {
      console.log('\nArquivos com falha:');
      result.failed.forEach(file => console.log(`- ${file}`));
    }
    
    console.log('\nDetalhes do processamento:');
    
    // Agrupar resultados por instalação para exibição mais organizada
    const groupedResults = (result.results as Array<any>).reduce((groups, item) => {
      const key = item.installation || 'desconhecido';
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(item);
      return groups;
    }, {});
    
    Object.entries(groupedResults).forEach(([installation, items]) => {
      console.log(`\nInstalação: ${installation}`);
      (items as Array<any>).forEach((item: any) => {
        if (item.success) {
          if (item.skipped) {
            console.log(`  - ${item.file}: Ignorado (${item.reason})`);
          } else if (item.updated) {
            console.log(`  - ${item.file}: Atualizado (${item.referenceMonth}/${item.referenceYear})`);
          } else {
            console.log(`  - ${item.file}: Processado com sucesso (${item.referenceMonth}/${item.referenceYear})`);
          }
        } else {
          console.log(`  - ${item.file}: Falha (${item.error})`);
        }
      });
    });
    
  } catch (error) {
    console.error('Erro ao processar arquivos:', error.message);
  }
  
  await app.close();
}

bootstrap();
