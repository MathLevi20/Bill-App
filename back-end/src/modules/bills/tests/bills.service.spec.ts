import { Test, TestingModule } from '@nestjs/testing';
import { BillsService } from '../bills.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Bill } from '../entities/bill.entity';
import { ClientsService } from '../../clients/clients.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { PdfParserService } from '../../../services/pdf/pdf-parser.service';
import { ConfigService } from '@nestjs/config';

// Mock para fs
jest.mock('fs', () => ({
  existsSync: jest.fn().mockReturnValue(true),
  readdirSync: jest.fn().mockImplementation((path) => {
    if (path === './Faturas') {
      return ['Instalação_ 3001116735', 'Instalação_ 3001422762', 'outros-arquivos'];
    } else if (path.includes('Instalação_')) {
      return ['3001116735-01-2024.pdf', '3001116735-02-2024.pdf', 'subpasta'];
    } else if (path.includes('subpasta')) {
      return ['3001116735-03-2024.pdf'];
    }
    return [];
  }),
  statSync: jest.fn().mockImplementation((path) => ({
    isDirectory: () => path.includes('Instalação_') || path.includes('subpasta')
  })),
  readFileSync: jest.fn().mockReturnValue(Buffer.from('mock pdf content')),
}));

// Mock para path
jest.mock('path', () => ({
  join: jest.fn((...args) => args.join('/')),
  basename: jest.fn((path) => {
    const parts = path.split('/');
    return parts[parts.length - 1];
  }),
  dirname: jest.fn((path) => {
    const parts = path.split('/');
    parts.pop();
    return parts.join('/');
  }),
  relative: jest.fn((from, to) => {
    // Simplificado para o teste
    return to.replace(from + '/', '');
  })
}));

describe('BillsService', () => {
  let service: BillsService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BillsService,
        {
          provide: getRepositoryToken(Bill),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn().mockReturnValue({
              id: 1, 
              referenceMonth: 'Janeiro', 
              referenceYear: 2024
            }),
            save: jest.fn(entity => Promise.resolve({ 
              id: 1, 
              ...entity 
            })),
          },
        },
        {
          provide: ClientsService,
          useValue: {
            findOne: jest.fn().mockResolvedValue({ id: 1, name: 'Test Client', clientNumber: '3001116735' }),
            findByClientNumber: jest.fn().mockImplementation((clientNumber) => {
              if (clientNumber === '3001116735') {
                return Promise.resolve({ id: 1, name: 'Test Client', clientNumber: '3001116735' });
              }
              throw new Error('Cliente não encontrado');
            }),
            create: jest.fn().mockResolvedValue({ id: 2, name: 'New Client', clientNumber: '3001422762' }),
          },
        },
        {
          provide: PrismaService,
          useValue: {},
        },
        {
          provide: PdfParserService,
          useValue: {
            extractDataFromPdf: jest.fn().mockResolvedValue({
              clientNumber: '3001116735',
              referenceMonth: 'Janeiro',
              referenceYear: 2024,
              energyElectricKwh: 100,
              energyElectricValue: 150,
              energySCEEEKwh: 50,
              energySCEEEValue: 80,
              energyCompensatedKwh: 30,
              energyCompensatedValue: 40,
              publicLightingValue: 20
            }),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('./Faturas'),
          },
        },
      ],
    }).compile();

    service = module.get<BillsService>(BillsService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  
  describe('listPdfFiles', () => {
    it('should find PDF files recursively in directories', async () => {
      const result = await service.listPdfFiles();
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
      // Verifique se os resultados contêm as instalações esperadas
      expect(result.some(item => item.installation === '3001116735')).toBeTruthy();
    });
  });
});
