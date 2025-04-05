import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { BillsService } from '../modules/bills/bills.service';
import { Logger } from '@nestjs/common';

const logger = new Logger('DatabasePopulation');

async function populateDatabase() {
  logger.log('Iniciando população do banco de dados a partir das faturas...');
  
  const app = await NestFactory.create(AppModule);
  const billsService = app.get(BillsService);
  
  try {
    // Processar todas as faturas da pasta, criando clientes automaticamente
    logger.log('Processando faturas da pasta configurada...');
    
    const result = await billsService.processFilesFromFaturasFolder({
      createMissingClients: true,
      forceUpdate: false
    });
    
    logger.log(`Processamento concluído com sucesso!`);
    logger.log(`Total de arquivos processados: ${result.processed}/${result.total}`);
    
    if (result.failed.length > 0) {
      logger.warn(`${result.failed.length} arquivos falharam no processamento:`);
      result.failed.forEach(file => logger.warn(`- ${file}`));
    }
    
    // Agrupar os resultados por cliente para exibir informações mais organizadas
    const clientResults = result.results.reduce((acc: any, item: any) => {
      if (!item.success || item.skipped) return acc;
      
      const key = item.clientNumber;
      if (!acc[key]) {
        acc[key] = {
          clientId: item.clientId,
          clientNumber: item.clientNumber,
          clientName: item.clientName || `Cliente ${item.clientNumber}`,
          bills: []
        };
      }
      
      acc[key].bills.push({
        id: item.billId,
        month: item.referenceMonth,
        year: item.referenceYear,
        file: item.file,
        energyKwh: item.energyElectricKwh || 'N/A',
        value: item.totalValue || 'N/A'
      });
      
      return acc;
    }, {});
    
    // Exibir resumo por cliente
    logger.log(`\n=== RESUMO POR CLIENTE ===`);
    Object.values(clientResults).forEach((client: any) => {
      logger.log(`Cliente: ${client.clientName} (${client.clientNumber})`);
      logger.log(`Faturas processadas: ${client.bills.length}`);
      client.bills.forEach((bill: any) => {
        logger.log(`- ${bill.month}/${bill.year} (ID: ${bill.id}) - ${bill.energyKwh} kWh - R$ ${bill.value}`);
      });
      logger.log('');
    });
    
  } catch (error) {
    logger.error(`Erro ao popular banco de dados: ${error.message}`);
  } finally {
    await app.close();
  }
}

// Executar o script
populateDatabase().catch(error => {
  logger.error(`Erro não tratado: ${error.message}`);
  process.exit(1);
});
