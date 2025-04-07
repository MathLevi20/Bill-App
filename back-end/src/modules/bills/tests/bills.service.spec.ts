import { Test, TestingModule } from '@nestjs/testing';
import { BillsService } from '../bills.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Bill } from '../entities/bill.entity';
import { ClientsService } from '../../clients/clients.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { PdfParserService } from '../../../services/pdf/pdf-parser.service';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';

// Mock fs and path to avoid file system operations during tests
jest.mock('fs', () => ({
  existsSync: jest.fn().mockReturnValue(true),
  readdirSync: jest.fn().mockReturnValue([]),
  statSync: jest.fn().mockReturnValue({ isDirectory: () => false }),
  readFileSync: jest.fn()
}));

jest.mock('path', () => ({
  join: jest.fn().mockImplementation((...args) => args.join('/')),
  basename: jest.fn().mockImplementation((path) => path.split('/').pop()),
  dirname: jest.fn().mockImplementation((path) => path.split('/').slice(0, -1).join('/')),
  relative: jest.fn().mockImplementation((from, to) => to.replace(from, '')),
}));

describe('BillsService', () => {
  let service: BillsService;
  let billRepositoryMock: any; // Use any to avoid TypeScript complaints
  let clientsServiceMock: any;
  let pdfParserServiceMock: any;

  beforeEach(async () => {
    // Create mocks with jest.fn()
    billRepositoryMock = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn().mockResolvedValue([]),
      findOne: jest.fn(),
      clear: jest.fn().mockResolvedValue(undefined),
      createQueryBuilder: jest.fn().mockReturnValue({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      }),
    };

    clientsServiceMock = {
      findOne: jest.fn(),
      findByClientNumber: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    };

    pdfParserServiceMock = {
      extractDataFromPdf: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BillsService,
        {
          provide: getRepositoryToken(Bill),
          useValue: billRepositoryMock,
        },
        {
          provide: ClientsService,
          useValue: clientsServiceMock,
        },
        {
          provide: PrismaService,
          useValue: {},
        },
        {
          provide: PdfParserService,
          useValue: pdfParserServiceMock,
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
    
    // Add a spy on listPdfFiles method and mock its implementation
    jest.spyOn(service, 'listPdfFiles').mockResolvedValue([]);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a bill', async () => {
      const createBillDto = {
        clientId: 1,
        referenceMonth: 'Janeiro',
        referenceYear: 2023,
        energyElectricKwh: 100,
        energyElectricValue: 150,
        energySCEEEKwh: 50,
        energySCEEEValue: 75,
        energyCompensatedKwh: 30,
        energyCompensatedValue: 45,
        publicLightingValue: 10,
      };

      const client = { id: 1, name: 'Test Client', clientNumber: '123456' };
      const expectedBill = { 
        id: 1,
        ...createBillDto, 
        client,
        totalEnergyConsumption: 150,
        totalValueWithoutGD: 235,
        gdSavings: 45,
      };

      clientsServiceMock.findOne.mockResolvedValue(client);
      billRepositoryMock.create.mockReturnValue(expectedBill);
      billRepositoryMock.save.mockResolvedValue(expectedBill);

      const result = await service.create(createBillDto);

      expect(clientsServiceMock.findOne).toHaveBeenCalledWith(1);
      expect(billRepositoryMock.create).toHaveBeenCalled();
      expect(billRepositoryMock.save).toHaveBeenCalled();
      expect(result).toEqual(expectedBill);
    });

    it('should throw NotFoundException when client not found', async () => {
      const createBillDto = {
        clientId: 999,
        referenceMonth: 'Janeiro',
        referenceYear: 2023,
        energyElectricKwh: 100,
        energyElectricValue: 150,
        energySCEEEKwh: 50,
        energySCEEEValue: 75,
        energyCompensatedKwh: 30,
        energyCompensatedValue: 45,
        publicLightingValue: 10,
      };

      clientsServiceMock.findOne.mockResolvedValue(null);

      await expect(service.create(createBillDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByDateRange', () => {
    it('should find bills by date range', async () => {
      const mockBills = [
        { id: 1, referenceMonth: 'Janeiro', referenceYear: 2023, client: { clientNumber: '123' } },
        { id: 2, referenceMonth: 'Fevereiro', referenceYear: 2023, client: { clientNumber: '456' } },
      ];

      // Mock the queryBuilder methods properly
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockBills),
      };

      billRepositoryMock.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      
      // Mock listPdfFiles to avoid any file system operations
      jest.spyOn(service, 'listPdfFiles').mockResolvedValue([]);

      const result = await service.findByDateRange('2023-01', '2023-12');

      expect(billRepositoryMock.createQueryBuilder).toHaveBeenCalled();
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalled();
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledTimes(2);
      expect(mockQueryBuilder.getMany).toHaveBeenCalled();
      expect(result).toHaveLength(2);
    });
  });

  describe('processPdfBill', () => {
    it('should process a PDF and extract data', async () => {
      const fileBuffer = Buffer.from('test');
      const extractedData = { 
        clientNumber: '123456',
        referenceMonth: 'Janeiro',
        referenceYear: 2023,
      };

      pdfParserServiceMock.extractDataFromPdf.mockResolvedValue(extractedData);

      const result = await service.processPdfBill(fileBuffer);

      expect(pdfParserServiceMock.extractDataFromPdf).toHaveBeenCalledWith(fileBuffer);
      expect(result).toEqual(extractedData);
    });

    it('should throw BadRequestException on processing error', async () => {
      const fileBuffer = Buffer.from('test');
      
      pdfParserServiceMock.extractDataFromPdf.mockRejectedValue(new Error('Invalid PDF'));

      await expect(service.processPdfBill(fileBuffer)).rejects.toThrow(BadRequestException);
    });
  });
});
