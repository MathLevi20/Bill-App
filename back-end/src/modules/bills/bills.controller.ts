import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  Delete,
  UseInterceptors, 
  UploadedFile,
  BadRequestException,
  Res,
  NotFoundException,
  StreamableFile,
  Query
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { BillsService } from './bills.service';
import { CreateBillDto } from './dto/create-bill.dto';
import { Bill } from './entities/bill.entity';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBody, ApiParam, ApiQuery } from '@nestjs/swagger';
import { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { createReadStream } from 'fs';

@ApiTags('bills')
@Controller('bills')
export class BillsController {
  constructor(private readonly billsService: BillsService) {}

  @Post()
  @ApiOperation({ summary: 'Criar uma nova fatura' })
  @ApiResponse({ status: 201, description: 'Fatura criada com sucesso', type: Bill })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 404, description: 'Cliente não encontrado' })
  async create(@Body() createBillDto: CreateBillDto): Promise<Bill> {
    return this.billsService.create(createBillDto);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', {
    fileFilter: (req, file, cb) => {
      if (file.mimetype !== 'application/pdf') {
        return cb(new BadRequestException('Apenas arquivos PDF são permitidos'), false);
      }
      if (file.size > 5 * 1024 * 1024) { // limite de 5MB
        return cb(new BadRequestException('Arquivo muito grande (máximo 5MB)'), false);
      }
      cb(null, true);
    }
  }))
  @ApiOperation({ summary: 'Fazer upload de um PDF de fatura para extração de dados e salvamento automático' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Arquivo PDF da fatura de energia',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Arquivo PDF da fatura'
        },
        clientId: {
          type: 'string',
          description: 'ID do cliente (opcional, se não informado buscará pelo número do cliente)',
        },
        saveToDatabase: {
          type: 'boolean',
          description: 'Se verdadeiro, salva automaticamente no banco de dados',
          default: true
        }
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Dados extraídos e salvos com sucesso' })
  @ApiResponse({ status: 400, description: 'Arquivo inválido ou falha na extração/salvamento' })
  async uploadPdf(
    @UploadedFile() file: Express.Multer.File,
    @Body('clientId') clientId?: string,
    @Body('saveToDatabase') saveToDatabase?: string
  ) {
    if (!file) {
      throw new BadRequestException('Nenhum arquivo foi enviado');
    }
    
    try {
      // Extrair dados do PDF usando o serviço atualizado com CemigPdfExtractor
      const extractedData = await this.billsService.processPdfBill(file.buffer);
      
      // Verificar se devemos salvar no banco de dados
      const shouldSave = saveToDatabase !== 'false';
      let savedBill = null;
      
      if (shouldSave) {
        // Salvar no banco de dados
        savedBill = await this.billsService.saveExtractedBill(extractedData, clientId ? parseInt(clientId) : undefined);
      }
      
      return {
        success: true,
        data: extractedData,
        savedBill: savedBill,
        message: shouldSave 
          ? 'Dados extraídos e salvos no banco de dados com sucesso' 
          : 'Dados extraídos com sucesso'
      };
    } catch (error) {
      throw new BadRequestException(`Falha ao processar o arquivo PDF: ${error.message}`);
    }
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas as faturas' })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de faturas retornada com sucesso', 
    schema: {
      type: 'array',
      items: {
        allOf: [
          { $ref: '#/components/schemas/Bill' },
          { 
            type: 'object',
            properties: {
              filename: {
                type: 'string',
                nullable: true,
                description: 'Nome do arquivo PDF da fatura, quando disponível'
              }
            }
          }
        ]
      }
    }
  })
  async findAll(): Promise<any[]> {
    return this.billsService.findAll();
  }

  @Get('date-range')
  @ApiOperation({ 
    summary: 'Listar faturas por intervalo de datas',
    description: 'Retorna uma lista de faturas filtradas por período, baseando-se no mês e ano de referência das faturas. ' +
                 'Os parâmetros são opcionais: se nenhum for fornecido, todas as faturas serão retornadas; ' +
                 'se apenas startDate for fornecido, retorna faturas a partir desse mês; ' +
                 'se apenas endDate for fornecido, retorna faturas até esse mês. ' +
                 'Se o dia for fornecido (YYYY-MM-DD), apenas o mês e ano serão considerados.'
  })
  @ApiQuery({ 
    name: 'startDate', 
    required: false, 
    description: 'Data inicial no formato YYYY-MM ou YYYY-MM-DD (exemplo: 2023-01 ou 2023-01-01). Se o dia for fornecido, ele será ignorado.',
    example: '2023-01'
  })
  @ApiQuery({ 
    name: 'endDate', 
    required: false, 
    description: 'Data final no formato YYYY-MM ou YYYY-MM-DD (exemplo: 2023-12 ou 2023-12-31). Se o dia for fornecido, ele será ignorado.',
    example: '2023-12'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de faturas filtradas por data', 
    schema: {
      type: 'array',
      items: {
        allOf: [
          { $ref: '#/components/schemas/Bill' },
          { 
            type: 'object',
            properties: {
              filename: {
                type: 'string',
                nullable: true,
                description: 'Nome do arquivo PDF da fatura, quando disponível'
              }
            }
          }
        ]
      },
      example: [
        {
          "id": 1,
          "referenceMonth": "Janeiro",
          "referenceYear": 2023,
          "energyElectricKwh": 150.5,
          "energyElectricValue": 200.75,
          "energySCEEEKwh": 50.25,
          "energySCEEEValue": 75.5,
          "energyCompensatedKwh": 30.0,
          "energyCompensatedValue": 45.0,
          "publicLightingValue": 25.0,
          "totalEnergyConsumption": 200.75,
          "totalValueWithoutGD": 301.25,
          "gdSavings": 45.0,
          "client": {
            "id": 1,
            "name": "Cliente Exemplo",
            "clientNumber": "3001234567"
          },
          "filename": "3001234567-01-2023.pdf"
        }
      ]
    }
  })
  @ApiResponse({ status: 400, description: 'Formato de data inválido' })
  async findByDateRange(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Res({ passthrough: true }) response?: Response
  ): Promise<any[]> {
    const bills = await this.billsService.findByDateRange(startDate, endDate);
    
    // Adicionar cabeçalhos de cache para melhorar o desempenho
    if (response) {
      response.setHeader('Cache-Control', 'public, max-age=300'); // Cache por 5 minutos
      response.setHeader('ETag', this.generateETag(bills));
    }
    
    return bills;
  }

  private generateETag(data: any): string {
    // Gera um ETag simples baseado no conteúdo da resposta
    const str = JSON.stringify(data);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0;
    }
    return `"${hash.toString(36)}"`;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar uma fatura pelo ID' })
  @ApiParam({ name: 'id', description: 'ID da fatura' })
  @ApiResponse({ status: 200, description: 'Fatura encontrada', type: Bill })
  @ApiResponse({ status: 404, description: 'Fatura não encontrada' })
  async findOne(@Param('id') id: string): Promise<Bill> {
    return this.billsService.findOne(+id);
  }

  @Get('client/:clientId')
  @ApiOperation({ summary: 'Buscar todas as faturas de um cliente' })
  @ApiParam({ name: 'clientId', description: 'ID do cliente' })
  @ApiResponse({ status: 200, description: 'Lista de faturas do cliente', type: [Bill] })
  @ApiResponse({ status: 404, description: 'Cliente não encontrado' })
  async findByClientId(@Param('clientId') clientId: string): Promise<Bill[]> {
    return this.billsService.findByClientId(+clientId);
  }

  @Get('installations')
  @ApiOperation({ summary: 'Listar as instalações e seus arquivos PDF disponíveis' })
  @ApiResponse({ status: 200, description: 'Lista de instalações e seus arquivos PDF' })
  @ApiResponse({ status: 400, description: 'Erro ao listar arquivos' })
  async listInstallationsAndFiles() {
    return {
      installations: await this.billsService.listPdfFiles()
    };
  }

  @Get('folder/list')
  @ApiOperation({ summary: 'Listar todos os arquivos PDF na pasta de faturas (versão antiga)' })
  @ApiResponse({ status: 200, description: 'Lista de arquivos PDF' })
  @ApiResponse({ status: 400, description: 'Erro ao listar arquivos' })
  async listPdfFiles() {
    return {
      installations: await this.billsService.listPdfFiles()
    };
  }

  @Post('folder/process')
  @ApiOperation({ summary: 'Processar todos os PDFs na pasta de faturas e salvar no banco de dados' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        forceUpdate: {
          type: 'boolean',
          description: 'Se verdadeiro, atualiza faturas existentes',
          default: false
        },
        clientNumberFilter: {
          type: 'string',
          description: 'Filtro opcional para processar apenas faturas de um determinado número de cliente'
        },
        createMissingClients: {
          type: 'boolean',
          description: 'Se verdadeiro, cria clientes automaticamente quando não encontrados',
          default: true
        }
      }
    }
  })
  @ApiResponse({ status: 200, description: 'Resultado do processamento em lote' })
  @ApiResponse({ status: 400, description: 'Erro no processamento em lote' })
  async processFolder(
    @Body('forceUpdate') forceUpdate?: boolean,
    @Body('clientNumberFilter') clientNumberFilter?: string,
    @Body('createMissingClients') createMissingClients?: boolean
  ) {
    return await this.billsService.processFilesFromFaturasFolder({
      forceUpdate: forceUpdate === true,
      clientNumberFilter,
      createMissingClients
    });
  }

  @Get('pdf/:installation/:fileName(*)')
  @ApiOperation({ summary: 'Acessar um arquivo PDF específico' })
  @ApiParam({ name: 'installation', description: 'Número da instalação' })
  @ApiParam({ name: 'fileName', description: 'Nome do arquivo PDF' })
  @ApiResponse({ status: 200, description: 'Arquivo PDF retornado com sucesso' })
  @ApiResponse({ status: 404, description: 'Arquivo não encontrado' })
  async getPdf(
    @Param('installation') installation: string,
    @Param('fileName') fileName: string,
    @Res({ passthrough: true }) res: Response
  ): Promise<StreamableFile> {
    try {
      // Sanitize parameters to prevent directory traversal
      const sanitizedFileName = path.basename(fileName.replace(/^\/+/, ''));
      const sanitizedInstallation = installation.trim();
      
      const filePath = await this.billsService.findPdfFileByInstallationAndName(
        sanitizedInstallation, 
        sanitizedFileName
      );
      
      if (!filePath) {
        throw new NotFoundException(`Arquivo ${fileName} não encontrado para instalação ${installation}`);
      }
      
      const file = createReadStream(filePath);
      
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${sanitizedFileName}"`,
      });
      
      return new StreamableFile(file);
    } catch (error) {
      throw new NotFoundException(`Arquivo PDF não encontrado: ${error.message}`);
    }
  }
  
  @Get('view/:fileName(*)')
  @ApiOperation({ summary: 'Acessar um arquivo PDF pelo nome' })
  @ApiParam({ name: 'fileName', description: 'Nome do arquivo PDF' })
  @ApiResponse({ status: 200, description: 'Arquivo PDF retornado com sucesso' })
  @ApiResponse({ status: 404, description: 'Arquivo não encontrado' })
  async viewPdf(
    @Param('fileName') fileName: string,
    @Res({ passthrough: true }) res: Response
  ): Promise<StreamableFile> {
    try {
      // Remove leading slashes and sanitize the filename
      const sanitizedFileName = fileName.replace(/^\/+/, '');
      
      const filePath = await this.billsService.findPdfFileByName(sanitizedFileName);
      
      if (!filePath) {
        throw new NotFoundException(`Arquivo ${fileName} não encontrado`);
      }
      
      const file = createReadStream(filePath);
      
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${path.basename(sanitizedFileName)}"`,
      });
      
      return new StreamableFile(file);
    } catch (error) {
      throw new NotFoundException(`Arquivo PDF não encontrado: ${error.message}`);
    }
  }

  @Delete('reset')
  @ApiOperation({ summary: 'Deletar todas as faturas do banco de dados' })
  @ApiResponse({ 
    status: 200, 
    description: 'Faturas deletadas com sucesso', 
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        deletedCount: { type: 'number' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Erro ao deletar faturas' })
  async deleteAllBills() {
    const result = await this.billsService.deleteAllBills();
    return {
      message: `Todas as faturas foram removidas com sucesso`,
      deletedCount: result.deletedCount
    };
  }
}