import { Test, TestingModule } from '@nestjs/testing';
import { PdfParserService } from './pdf-parser.service';
import { CemigPdfExtractor } from './cemig-pdf-extractor';

jest.mock('pdf-parse', () => {
  return jest.fn().mockImplementation(() => {
    return Promise.resolve({
      text: `
        COPEL - COMPANHIA PARANAENSE DE ENERGIA
        CNPJ: 12.345.678/9012-34
        
        JOÃO DA SILVA
        Rua Exemplo, 123 - Centro
        80000-000 - CURITIBA - PR
        
        Nº DO CLIENTE
        3001116735
        
        Referente a
        Janeiro/2024
        
        INSCRIÇÃO ESTADUAL
        123456789
        
        Energia Elétrica 150,75 kWh  R$ 135,80
        Energia SCEEE s/ICMS 75,25 kWh  R$ 68,50
        Energia Compensada GD I 50,00 kWh  R$ 45,30
        Contrib Ilum Publica Municipal  R$ 10,75
        
        TOTAL  R$ 215,05
      `
    });
  });
});

describe('PdfParserService', () => {
  let service: PdfParserService;
  let cemigExtractor: CemigPdfExtractor;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PdfParserService,
        {
          provide: CemigPdfExtractor,
          useValue: {
            extractData: jest.fn().mockRejectedValue(new Error('Test error - fallback to generic extractor')),
          },
        },
      ],
    }).compile();

    service = module.get<PdfParserService>(PdfParserService);
    cemigExtractor = module.get<CemigPdfExtractor>(CemigPdfExtractor);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('extractDataFromPdf', () => {
    it('should correctly extract data from PDF buffer', async () => {
      const mockBuffer = Buffer.from('mock pdf content');
      
      const result = await service.extractDataFromPdf(mockBuffer);
      
      expect(cemigExtractor.extractData).toHaveBeenCalledWith(mockBuffer);
      expect(result).toMatchObject({
        clientNumber: '3001116735',
        referenceMonth: 'Janeiro',
        energyElectricKwh: 150.75,
        energyElectricValue: 135.8,
        publicLightingValue: 10.75
      });
    });
  });
});
