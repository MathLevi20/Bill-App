import { Test, TestingModule } from '@nestjs/testing';
import { BillsController } from '../bills.controller';
import { BillsService } from '../bills.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateBillDto } from '../dto/create-bill.dto';
import { Response } from 'express';
import { StreamableFile } from '@nestjs/common';
import { createReadStream } from 'fs';

// Mocks
jest.mock('fs', () => ({
  createReadStream: jest.fn(),
  existsSync: jest.fn(),
  readFileSync: jest.fn(),
}));

describe('BillsController', () => {
  let controller: BillsController;
  let service: BillsService;

  const mockBillsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findByDateRange: jest.fn(),
    findOne: jest.fn(),
    findByClientId: jest.fn(),
    processPdfBill: jest.fn(),
    saveExtractedBill: jest.fn(),
    deleteAllBills: jest.fn(),
    listPdfFiles: jest.fn(),
    processFilesFromFaturasFolder: jest.fn(),
    findPdfFileByInstallationAndName: jest.fn(),
    findPdfFileByName: jest.fn(),
  };

  const mockResponse = {
    set: jest.fn(),
    setHeader: jest.fn(),
  } as unknown as Response;

  beforeEach(async () => {
    jest.clearAllMocks();
    
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BillsController],
      providers: [
        {
          provide: BillsService,
          useValue: mockBillsService,
        },
      ],
    }).compile();

    controller = module.get<BillsController>(BillsController);
    service = module.get<BillsService>(BillsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a bill', async () => {
      const createBillDto: CreateBillDto = {
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
      
      const bill = { id: 1, ...createBillDto };
      mockBillsService.create.mockResolvedValue(bill);
      
      const result = await controller.create(createBillDto);
      
      expect(mockBillsService.create).toHaveBeenCalledWith(createBillDto);
      expect(result).toEqual(bill);
    });
  });

  describe('findAll', () => {
    it('should return all bills when no date filters are provided', async () => {
      const bills = [{ id: 1 }, { id: 2 }];
      mockBillsService.findAll.mockResolvedValue(bills);
      
      const result = await controller.findAll();
      
      expect(mockBillsService.findAll).toHaveBeenCalled();
      expect(result).toEqual(bills);
    });

    it('should use findByDateRange when date filters are provided', async () => {
      const bills = [{ id: 1 }, { id: 2 }];
      mockBillsService.findByDateRange.mockResolvedValue(bills);
      
      const result = await controller.findAll();
      
      expect(mockBillsService.findByDateRange).toHaveBeenCalledWith('2023-01', '2023-12');
      expect(mockResponse.setHeader).toHaveBeenCalledTimes(2); // Cache headers
      expect(result).toEqual(bills);
    });
  });

  describe('findByDateRange', () => {
    it('should find bills by date range', async () => {
      const bills = [{ id: 1 }, { id: 2 }];
      mockBillsService.findByDateRange.mockResolvedValue(bills);
      
      const result = await controller.findByDateRange('2023-01', '2023-12', mockResponse);
      
      expect(mockBillsService.findByDateRange).toHaveBeenCalledWith('2023-01', '2023-12');
      expect(mockResponse.setHeader).toHaveBeenCalledTimes(2); // Cache headers
      expect(result).toEqual(bills);
    });
  });

  describe('findOne', () => {
    it('should find one bill by id', async () => {
      const bill = { id: 1 };
      mockBillsService.findOne.mockResolvedValue(bill);
      
      const result = await controller.findOne('1');
      
      expect(mockBillsService.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(bill);
    });
  });

  describe('uploadPdf', () => {
    it('should process and optionally save PDF data', async () => {
      const fileBuffer = Buffer.from('test');
      const file = { buffer: fileBuffer } as Express.Multer.File;
      const extractedData = { 
        clientNumber: '123456',
        referenceMonth: 'Janeiro',
        referenceYear: 2023,
      };
      const savedBill = { id: 1, ...extractedData };
      
      mockBillsService.processPdfBill.mockResolvedValue(extractedData);
      mockBillsService.saveExtractedBill.mockResolvedValue(savedBill);
      
      const result = await controller.uploadPdf(file, '1', 'true');
      
      expect(mockBillsService.processPdfBill).toHaveBeenCalledWith(fileBuffer);
      expect(mockBillsService.saveExtractedBill).toHaveBeenCalledWith(extractedData, 1);
      expect(result).toEqual({
        success: true,
        data: extractedData,
        savedBill: savedBill,
        message: 'Dados extraídos e salvos no banco de dados com sucesso',
      });
    });

    it('should throw BadRequestException when no file is provided', async () => {
      await expect(controller.uploadPdf(undefined, '1', 'true')).rejects.toThrow(BadRequestException);
    });
  });

  describe('getPdf', () => {
    it('should return a PDF file', async () => {
      const installation = '123456';
      const fileName = 'test.pdf';
      const filePath = '/path/to/test.pdf';
      const fileStream = {} as NodeJS.ReadableStream;
      
      mockBillsService.findPdfFileByInstallationAndName.mockResolvedValue(filePath);
      (createReadStream as jest.Mock).mockReturnValue(fileStream);
      
      const result = await controller.getPdf(installation, fileName, mockResponse);
      
      expect(mockBillsService.findPdfFileByInstallationAndName).toHaveBeenCalledWith(
        installation, 
        fileName
      );
      expect(mockResponse.set).toHaveBeenCalledWith({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${fileName}"`,
      });
      expect(result).toBeInstanceOf(StreamableFile);
    });

    it('should throw NotFoundException when file is not found', async () => {
      mockBillsService.findPdfFileByInstallationAndName.mockResolvedValue(null);
      
      await expect(controller.getPdf('123456', 'test.pdf', mockResponse)).rejects.toThrow(NotFoundException);
    });
  });
});
