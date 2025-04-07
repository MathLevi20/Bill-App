import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bill } from './entities/bill.entity';
import { CreateBillDto } from './dto/create-bill.dto';
import { ClientsService } from '../clients/clients.service';
import { PrismaService } from '../../prisma/prisma.service';
import { PdfParserService } from '../../services/pdf/pdf-parser.service';
import * as fs from 'fs';
import * as path from 'path';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class BillsService {
  private faturasPath: string;
  private readonly logger = new Logger(BillsService.name);

  constructor(
    @InjectRepository(Bill)
    private billRepository: Repository<Bill>,
    private clientsService: ClientsService,
    private prisma: PrismaService,
    private pdfParserService: PdfParserService,
    private configService: ConfigService,
  ) {
    this.faturasPath = this.configService.get<string>('FATURAS_FOLDER_PATH');
  }

  async create(createBillDto: CreateBillDto): Promise<Bill> {
    const client = await this.clientsService.findOne(createBillDto.clientId);
    
    if (!client) {
      throw new NotFoundException(`Cliente com ID ${createBillDto.clientId} não encontrado`);
    }

    // Calculando os valores derivados
    const totalEnergyConsumption = createBillDto.energyElectricKwh + createBillDto.energySCEEEKwh;
    const totalValueWithoutGD = createBillDto.energyElectricValue + createBillDto.energySCEEEValue + createBillDto.publicLightingValue;
    const gdSavings = createBillDto.energyCompensatedValue;

    const bill = this.billRepository.create({
      ...createBillDto,
      totalEnergyConsumption,
      totalValueWithoutGD,
      gdSavings,
      client
    });

    return this.billRepository.save(bill);
  }

  async findAll(): Promise<any[]> {
    const bills = await this.billRepository.find({
      relations: ['client'],
    });
    
    // Try to find matching PDF files for each bill
    const installationsWithFiles = await this.listPdfFiles();
    
    return bills.map(bill => {
      let filename = null;
      
      // Try to find matching file for this bill
      if (bill.client && bill.client.clientNumber) {
        const installation = installationsWithFiles.find(
          install => install.installation === bill.client.clientNumber
        );
        
        if (installation) {
          // Look for file matching month and year
          const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                             'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
          const monthIndex = monthNames.findIndex(
            m => m.toLowerCase() === bill.referenceMonth.toLowerCase()
          );
          
          if (monthIndex !== -1) {
            const monthNum = (monthIndex + 1).toString().padStart(2, '0');
            const filePattern = new RegExp(`${bill.client.clientNumber}-${monthNum}-${bill.referenceYear}\\.pdf$`, 'i');
            
            const matchingFile = installation.files.find(file => filePattern.test(file));
            if (matchingFile) {
              filename = matchingFile;
            }
          }
        }
      }
      
      return {
        ...bill,
        filename
      };
    });
  }

  async findOne(id: number): Promise<Bill> {
    const bill = await this.billRepository.findOne({
      where: { id },
      relations: ['client'],
    });
    
    if (!bill) {
      throw new NotFoundException(`Fatura com ID ${id} não encontrada`);
    }
    
    return bill;
  }

  async findByClientId(clientId: number): Promise<Bill[]> {
    // Verificar se o cliente existe
    await this.clientsService.findOne(clientId);
    
    return this.billRepository.find({
      where: { client: { id: clientId } },
      relations: ['client'],
    });
  }

  async processPdfBill(fileBuffer: Buffer): Promise<any> {
    try {
      const extractedData = await this.pdfParserService.extractDataFromPdf(fileBuffer);
      return extractedData;
    } catch (error) {
      throw new BadRequestException('Falha ao processar o arquivo PDF: ' + error.message);
    }
  }

  /**
   * Função recursiva que encontra todos os arquivos PDF em um diretório e suas subpastas
   */
  private findPdfFilesRecursively(dir: string): string[] {
    let results: string[] = [];
    const list = fs.readdirSync(dir);
    
    for (const file of list) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        // Se for diretório, chama recursivamente
        results = results.concat(this.findPdfFilesRecursively(filePath));
      } else if (file.toLowerCase().endsWith('.pdf')) {
        // Se for arquivo PDF, adiciona ao resultado
        results.push(filePath);
      }
    }
    
    return results;
  }

  /**
   * Tenta extrair o número da instalação do caminho do arquivo
   */
  private extractInstallationNumber(filePath: string): string {
    // Verifica se o caminho contém "Instalação_" em alguma parte
    const installationMatch = filePath.match(/Instalação_\s*(\d+)/i);
    if (installationMatch) {
      return installationMatch[1].trim();
    }
    
    // Se não, tenta extrair do nome do arquivo (assumindo formado XXXXXXXX-MM-AAAA.pdf)
    const fileName = path.basename(filePath);
    const fileNameMatch = fileName.match(/^(\d+)-\d{2}-\d{4}\.pdf$/i);
    if (fileNameMatch) {
      return fileNameMatch[1];
    }
    
    // Se não conseguir extrair, usa o nome do diretório pai
    const parentDir = path.basename(path.dirname(filePath));
    return parentDir;
  }

  async listPdfFiles(): Promise<{ installation: string; files: string[] }[]> {
    try {
      if (!fs.existsSync(this.faturasPath)) {
        throw new NotFoundException(`Diretório de faturas não encontrado: ${this.faturasPath}`);
      }

      // Encontrar todos os arquivos PDF recursivamente
      const allPdfFiles = this.findPdfFilesRecursively(this.faturasPath);
      
      // Agrupar arquivos por instalação
      const installationMap = new Map<string, string[]>();
      
      for (const pdfFile of allPdfFiles) {
        const installationNumber = this.extractInstallationNumber(pdfFile);
        const relativePath = path.relative(this.faturasPath, pdfFile);
        
        if (!installationMap.has(installationNumber)) {
          installationMap.set(installationNumber, []);
        }
        
        installationMap.get(installationNumber).push(relativePath);
      }
      
      // Converter o mapa em array de resultados
      const result = Array.from(installationMap.entries()).map(([installation, files]) => ({
        installation,
        files
      }));

      return result;

    } catch (error) {
      throw new BadRequestException(`Erro ao listar arquivos PDF: ${error.message}`);
    }
  }

  async processFilesFromFaturasFolder(options?: {
    forceUpdate?: boolean;
    clientNumberFilter?: string;
    createMissingClients?: boolean;
  }): Promise<{
    total: number;
    processed: number;
    failed: string[];
    results: any[];
  }> {
    try {
      const installationsWithFiles = await this.listPdfFiles();
      const results = [];
      const failedFiles = [];
      let totalFiles = 0;
      let processedFiles = 0;
      const createdClients = new Set<string>();
      
      // Aplicar filtro de instalação se fornecido
      let filteredInstallations = installationsWithFiles;
      if (options?.clientNumberFilter) {
        filteredInstallations = installationsWithFiles.filter(
          installation => installation.installation.includes(options.clientNumberFilter)
        );
      }
      
      for (const installation of filteredInstallations) {
        const installationNumber = installation.installation;
        
        // Verificar ou criar cliente para esta instalação
        let client;
        try {
          client = await this.clientsService.findByClientNumber(installationNumber);
          this.logger.log(`Cliente encontrado: ${client.name} (${client.clientNumber})`);
        } catch (error) {
          // Se o cliente não existir, crie-o
          const createMissingClients = options?.createMissingClients !== false; // Default é true
          
          if (createMissingClients) {
            client = await this.clientsService.create({
              name: `Instalação ${installationNumber}`,
              clientNumber: installationNumber
            });
            createdClients.add(installationNumber);
            this.logger.log(`Cliente criado: ${client.name} (${client.clientNumber})`);
          } else {
            this.logger.warn(`Cliente com número ${installationNumber} não encontrado e createMissingClients=false. Pulando arquivos.`);
            continue;
          }
        }
        
        this.logger.log(`Processando arquivos para instalação ${installationNumber} (${installation.files.length} arquivos)`);
        
        for (const relativeFilePath of installation.files) {
          totalFiles++;
          try {
            const filePath = path.join(this.faturasPath, relativeFilePath);
            
            if (!fs.existsSync(filePath)) {
              throw new Error(`Arquivo não encontrado: ${filePath}`);
            }
            
            this.logger.debug(`Processando arquivo: ${relativeFilePath}`);
            const fileBuffer = fs.readFileSync(filePath);
            
            const extractedData = await this.processPdfBill(fileBuffer);
            
            // Extrair mês e ano do nome do arquivo se não for possível extrair dos dados
            const fileName = path.basename(relativeFilePath);
            const fileNameMatch = fileName.match(/(\d+)-(\d{2})-(\d{4})\.pdf$/i);
            let inferredMonth = '';
            let inferredYear = 0;
            
            if (fileNameMatch) {
              // Convertendo número do mês para nome
              const monthNum = parseInt(fileNameMatch[2], 10);
              const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                             'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
              
              inferredMonth = months[monthNum - 1] || '';
              inferredYear = parseInt(fileNameMatch[3], 10);
            }
            
            // Usar dados do arquivo se a extração falhar
            const referenceMonth = extractedData.referenceMonth || inferredMonth;
            const referenceYear = extractedData.referenceYear || inferredYear;
            
            if (!referenceMonth || !referenceYear) {
              throw new Error(`Não foi possível determinar mês e ano de referência para o arquivo ${relativeFilePath}`);
            }
            
            // Verificar se já existe uma fatura para o mês e ano de referência
            const existingBills = await this.findByClientId(client.id);
            const existingBill = existingBills.find(
              bill => 
                bill.referenceMonth.toLowerCase() === referenceMonth.toLowerCase() && 
                bill.referenceYear === referenceYear
            );
            
            // Melhorar detecção de nome do cliente se disponível
            if (extractedData.customerName && client.name.startsWith('Instalação ')) {
              await this.clientsService.update(client.id, { name: extractedData.customerName });
              client.name = extractedData.customerName;
              this.logger.log(`Nome do cliente atualizado: ${client.name} (${client.clientNumber})`);
            }

            // Improve client name detection if available - added more logging
            if (extractedData.clientName && (
                client.name.startsWith('Instalação ') || 
                client.name === `Cliente ${installationNumber}` ||
                extractedData.clientName.length > client.name.length
            )) {
              this.logger.log(`Updating client name from "${client.name}" to "${extractedData.clientName}"`);
              await this.clientsService.update(client.id, { name: extractedData.clientName });
              client.name = extractedData.clientName;
              this.logger.log(`Nome do cliente atualizado: ${client.name} (${client.clientNumber})`);
            }
            
            if (!existingBill || options?.forceUpdate) {
              // Criar nova fatura ou atualizar existente
              const billData = {
                clientId: client.id,
                referenceMonth: referenceMonth,
                referenceYear: referenceYear,
                energyElectricKwh: extractedData.energyElectricKwh || 0,
                energyElectricValue: extractedData.energyElectricValue || 0,
                energySCEEEKwh: extractedData.energySCEEEKwh || 0,
                energySCEEEValue: extractedData.energySCEEEValue || 0,
                energyCompensatedKwh: extractedData.energyCompensatedKwh || 0,
                energyCompensatedValue: extractedData.energyCompensatedValue || 0,
                publicLightingValue: extractedData.publicLightingValue || 0,
              };
              
              let newBill;
              if (existingBill && options?.forceUpdate) {
                // Atualizar fatura existente
                Object.assign(existingBill, billData);
                newBill = await this.billRepository.save(existingBill);
                
                results.push({
                  installation: installationNumber,
                  file: relativeFilePath,
                  success: true,
                  updated: true,
                  billId: newBill.id,
                  clientId: client.id,
                  clientNumber: client.clientNumber,
                  clientName: client.name,
                  referenceMonth: newBill.referenceMonth,
                  referenceYear: newBill.referenceYear
                });
                this.logger.log(`Fatura atualizada: ${referenceMonth}/${referenceYear} (ID: ${newBill.id})`);
              } else {
                // Criar nova fatura
                newBill = await this.create(billData);
                
                results.push({
                  installation: installationNumber,
                  file: relativeFilePath,
                  success: true,
                  billId: newBill.id,
                  clientId: client.id,
                  clientNumber: client.clientNumber,
                  clientName: client.name,
                  referenceMonth: newBill.referenceMonth,
                  referenceYear: newBill.referenceYear
                });
                this.logger.log(`Fatura criada: ${referenceMonth}/${referenceYear} (ID: ${newBill.id})`);
              }
              processedFiles++;
            } else {
              results.push({
                installation: installationNumber,
                file: relativeFilePath,
                success: true,
                skipped: true,
                reason: 'Fatura já existe para este mês e ano',
                clientId: client.id,
                clientNumber: client.clientNumber,
                clientName: client.name,
                referenceMonth: referenceMonth,
                referenceYear: referenceYear
              });
              this.logger.debug(`Fatura ignorada (já existe): ${referenceMonth}/${referenceYear}`);
              processedFiles++;
            }
            
          } catch (error) {
            failedFiles.push(`Instalação ${installationNumber}/${relativeFilePath}`);
            results.push({
              installation: installationNumber,
              file: relativeFilePath,
              success: false,
              error: error.message
            });
            this.logger.error(`Erro ao processar arquivo ${relativeFilePath}: ${error.message}`);
          }
        }
      }
      
      // Resumo do processamento
      this.logger.log(`Processamento concluído: ${processedFiles}/${totalFiles} arquivos processados`);
      if (createdClients.size > 0) {
        this.logger.log(`${createdClients.size} novos clientes criados: ${Array.from(createdClients).join(', ')}`);
      }
      if (failedFiles.length > 0) {
        this.logger.warn(`${failedFiles.length} arquivos falharam no processamento`);
      }
      
      return {
        total: totalFiles,
        processed: processedFiles,
        failed: failedFiles,
        results
      };
      
    } catch (error) {
      this.logger.error(`Erro ao processar arquivos: ${error.message}`);
      throw new BadRequestException(`Erro ao processar arquivos: ${error.message}`);
    }
  }

  /**
   * Salva uma fatura a partir de dados extraídos de um PDF
   * @param extractedData Dados extraídos do PDF
   * @param clientId ID opcional de um cliente existente
   * @returns A fatura salva
   */
  async saveExtractedBill(extractedData: any, clientId?: number): Promise<Bill> {
    try {
      // Identificar o cliente pelo ID ou pelo número do cliente
      let client;
      
      if (clientId) {
        // Se foi fornecido um ID, utiliza ele para buscar o cliente
        client = await this.clientsService.findOne(clientId);
      } else if (extractedData.clientNumber) {
        // Se não foi fornecido ID, mas temos o número do cliente, tenta buscar por ele
        try {
          client = await this.clientsService.findByClientNumber(extractedData.clientNumber);
        } catch (error) {
          // Se o cliente não existe, cria um novo com base nos dados extraídos
          client = await this.clientsService.create({
            name: extractedData.customerName || `Cliente ${extractedData.clientNumber}`,
            clientNumber: extractedData.clientNumber
          });
        }
      } else {
        throw new BadRequestException('Não foi possível identificar o cliente nos dados extraídos');
      }

      // Verificar se já existe uma fatura para esse mês/ano
      const existingBills = await this.findByClientId(client.id);
      const billExists = existingBills.some(
        bill => 
          bill.referenceMonth.toLowerCase() === extractedData.referenceMonth.toLowerCase() && 
          bill.referenceYear === extractedData.referenceYear
      );
      
      if (billExists) {
        throw new BadRequestException(`Já existe uma fatura para o mês ${extractedData.referenceMonth}/${extractedData.referenceYear} para este cliente`);
      }
      
      // Criar nova fatura com os dados extraídos
      const newBill = await this.create({
        clientId: client.id,
        referenceMonth: extractedData.referenceMonth,
        referenceYear: extractedData.referenceYear,
        energyElectricKwh: extractedData.energyElectricKwh || 0,
        energyElectricValue: extractedData.energyElectricValue || 0,
        energySCEEEKwh: extractedData.energySCEEEKwh || 0,
        energySCEEEValue: extractedData.energySCEEEValue || 0,
        energyCompensatedKwh: extractedData.energyCompensatedKwh || 0,
        energyCompensatedValue: extractedData.energyCompensatedValue || 0,
        publicLightingValue: extractedData.publicLightingValue || 0,
      });
      
      return newBill;
    } catch (error) {
      throw new BadRequestException(`Erro ao salvar fatura no banco de dados: ${error.message}`);
    }
  }

  /**
   * Encontra um arquivo PDF pelo nome do arquivo
   */
  async findPdfFileByName(fileName: string): Promise<string | null> {
    try {
      if (!fs.existsSync(this.faturasPath)) {
        throw new NotFoundException(`Diretório de faturas não encontrado: ${this.faturasPath}`);
      }
      
      // Primeiro tenta encontrar o arquivo diretamente
      const directPath = path.join(this.faturasPath, fileName);
      if (fs.existsSync(directPath) && directPath.endsWith('.pdf')) {
        return directPath;
      }
      
      // Se não encontrou, busca recursivamente
      const allPdfFiles = this.findPdfFilesRecursively(this.faturasPath);
      const fileNameToFind = path.basename(fileName);
      
      // Procura por arquivos com nome correspondente
      const matchedFile = allPdfFiles.find(file => path.basename(file) === fileNameToFind);
      
      if (matchedFile) {
        return matchedFile;
      }
      
      return null;
    } catch (error) {
      throw new NotFoundException(`Não foi possível localizar o arquivo: ${error.message}`);
    }
  }

  /**
   * Encontra um arquivo PDF pelo número da instalação e nome do arquivo
   */
  async findPdfFileByInstallationAndName(installation: string, fileName: string): Promise<string | null> {
    try {
      if (!fs.existsSync(this.faturasPath)) {
        throw new NotFoundException(`Diretório de faturas não encontrado: ${this.faturasPath}`);
      }
      
      // Busca recursivamente todos os PDFs
      const allPdfFiles = this.findPdfFilesRecursively(this.faturasPath);
      
      // Primeiro, procura por arquivos que correspondam exatamente ao nome e instalação
      const exactMatch = allPdfFiles.find(file => {
        return path.basename(file) === fileName && file.includes(installation);
      });
      
      if (exactMatch) {
        return exactMatch;
      }
      
      // Se não encontrou correspondência exata, busca por qualquer arquivo que contenha a instalação
      const installationMatch = allPdfFiles.find(file => {
        return file.includes(installation) && file.endsWith('.pdf');
      });
      
      if (installationMatch) {
        return installationMatch;
      }
      
      return null;
    } catch (error) {
      throw new NotFoundException(`Não foi possível localizar o arquivo: ${error.message}`);
    }
  }

  /**
   * @deprecated Use findPdfFileByInstallationAndName instead
   */
  async getPdfFilePath(installation: string, fileName: string): Promise<string> {
    const filePath = await this.findPdfFileByInstallationAndName(installation, fileName);
    if (!filePath) {
      throw new Error(`Arquivo ${fileName} não encontrado para instalação ${installation}`);
    }
    return filePath;
  }

  /**
   * Deleta todas as faturas do banco de dados
   * @returns Um objeto com a quantidade de faturas removidas
   */
  async deleteAllBills(): Promise<{ deletedCount: number }> {
    try {
      // Buscar todas as faturas para contar
      const bills = await this.billRepository.find();
      const count = bills.length;
      
      // Excluir todas as faturas
      await this.billRepository.clear();
      
      return { deletedCount: count };
    } catch (error) {
      throw new BadRequestException(`Erro ao excluir todas as faturas: ${error.message}`);
    }
  }

  async findByDateRange(startDate?: string, endDate?: string): Promise<any[]> {
    // Create query builder for filtering by date
    const queryBuilder = this.billRepository.createQueryBuilder('bill')
      .leftJoinAndSelect('bill.client', 'client');
    
    if (startDate) {
      // Remove day component if present (convert YYYY-MM-DD to YYYY-MM)
      const [startYear, startMonth] = startDate.split('-').slice(0, 2);
      queryBuilder.andWhere(
        '(bill.referenceYear > :startYear OR (bill.referenceYear = :startYear AND POSITION(LOWER(bill.referenceMonth) IN :months) >= POSITION(LOWER(:startMonth) IN :months)))',
        { 
          startYear: Number(startYear),
          startMonth: this.getMonthName(Number(startMonth)),
          months: 'janeirofevereiromarçoabrilmaiojunhojulhoagostosetoubronovembrodezembro'
        }
      );
    }
    
    if (endDate) {
      // Remove day component if present (convert YYYY-MM-DD to YYYY-MM)
      const [endYear, endMonth] = endDate.split('-').slice(0, 2);
      queryBuilder.andWhere(
        '(bill.referenceYear < :endYear OR (bill.referenceYear = :endYear AND POSITION(LOWER(bill.referenceMonth) IN :months) <= POSITION(LOWER(:endMonth) IN :months)))',
        { 
          endYear: Number(endYear),
          endMonth: this.getMonthName(Number(endMonth)),
          months: 'janeirofevereiromarçoabrilmaiojunhojulhoagostosetoubronovembrodezembro'
        }
      );
    }
    
    const bills = await queryBuilder.getMany();
    
    // Try to find matching PDF files for each bill
    const installationsWithFiles = await this.listPdfFiles();
    
    return bills.map(bill => {
      let filename = null;
      
      // Try to find matching file for this bill
      if (bill.client && bill.client.clientNumber) {
        const installation = installationsWithFiles.find(
          install => install.installation === bill.client.clientNumber
        );
        
        if (installation) {
          // Look for file matching month and year
          const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                             'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
          const monthIndex = monthNames.findIndex(
            m => m.toLowerCase() === bill.referenceMonth.toLowerCase()
          );
          
          if (monthIndex !== -1) {
            const monthNum = (monthIndex + 1).toString().padStart(2, '0');
            const filePattern = new RegExp(`${bill.client.clientNumber}-${monthNum}-${bill.referenceYear}\\.pdf$`, 'i');
            
            const matchingFile = installation.files.find(file => filePattern.test(file));
            if (matchingFile) {
              filename = matchingFile;
            }
          }
        }
      }
      
      return {
        ...bill,
        filename
      };
    });
  }

  // Helper method to convert month number to name
  private getMonthName(monthNumber: number): string {
    const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                       'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    return monthNames[monthNumber - 1] || '';
  }
}