import { Injectable, Logger } from '@nestjs/common';
import * as pdfParse from 'pdf-parse';
import { CemigPdfExtractor } from './cemig-pdf-extractor';

interface ExtractedData {
  clientNumber: string;
  customerNumber: string;
  customerName: string;
  referenceMonth: string;
  referenceYear: string;
  electricEnergyKwh?: number;
  electricEnergyValue?: number;
  sceeValue?: number;
  compensatedEnergyKwh?: number;
  publicLightingContribution?: number;
  total?: number;
}

@Injectable()
export class PdfParserService {
  private readonly logger = new Logger(PdfParserService.name);

  constructor(private cemigExtractor: CemigPdfExtractor) {}

  async extractDataFromPdf(pdfBuffer: Buffer): Promise<any> {
    try {
      // Primeiro tentamos com o extrator especializado para faturas da CEMIG
      try {
        const cemigData = await this.cemigExtractor.extractData(pdfBuffer);
        
        // Log detalhado para debug
        this.logger.debug(`Dados extraídos (CEMIG): ${JSON.stringify(cemigData)}`);
        
        // Mapeia para o formato padrão esperado pela aplicação
        this.logger.log('Dados extraídos com sucesso usando CemigPdfExtractor');
        return {
          clientNumber: cemigData.clientNumber,
          clientName: cemigData.clientName,
          referenceMonth: cemigData.referenceMonth,
          referenceYear: cemigData.referenceYear,
          energyElectricKwh: cemigData.energyElectricKwh,
          energyElectricValue: cemigData.energyElectricValue,
          energySCEEEKwh: cemigData.energySCEEEKwh,
          energySCEEEValue: cemigData.energySCEEEValue,
          energyCompensatedKwh: cemigData.energyCompensatedKwh,
          energyCompensatedValue: cemigData.energyCompensatedValue,
          publicLightingValue: cemigData.publicLightingValue,
          totalValue: cemigData.totalValue,
          dueDate: cemigData.dueDate,
          emissionDate: cemigData.emissionDate
        };
      } catch (cemigError) {
        this.logger.warn(`Extrator CEMIG falhou, tentando método genérico: ${cemigError.message}`);
      }

      // Se o extrator especializado falhar, use o método existente
      const data = await pdfParse(pdfBuffer);
      const text = data.text;
      
      // Usar o novo método de extração
      const extractedData = this.extractInvoiceData(text);
      
      this.logger.debug(`Extracted client number: ${extractedData.customerNumber}`);
      this.logger.debug(`Extracted reference month: ${extractedData.referenceMonth}, year: ${extractedData.referenceYear}`);

      // Mapear para o formato esperado pelo resto da aplicação
      return {
        clientNumber: extractedData.customerNumber,
        referenceMonth: extractedData.referenceMonth,
        referenceYear: parseInt(extractedData.referenceYear) || new Date().getFullYear(),
        energyElectricKwh: extractedData.electricEnergyKwh || 0,
        energyElectricValue: extractedData.electricEnergyValue || 0,
        energySCEEEKwh: 0, // Este valor não está sendo extraído pelo novo método
        energySCEEEValue: extractedData.sceeValue || 0,
        energyCompensatedKwh: extractedData.compensatedEnergyKwh || 0,
        energyCompensatedValue: 0, // Este valor não está sendo extraído pelo novo método
        publicLightingValue: extractedData.publicLightingContribution || 0,
      };
    } catch (error) {
      this.logger.error('Error parsing PDF:', error);
      throw new Error(`Failed to parse PDF: ${error.message}`);
    }
  }

  private extractInvoiceData(pdfText: string): ExtractedData {
    let arr = pdfText.split('\n');
    arr = this.removeEmptyElements(arr);

    const customerNumberIndex = arr.findIndex(item => item.includes('Nº DO CLIENTE'));
    const referenceMonthIndex = arr.findIndex(item => item.includes('Referente a'));
    const stateNumber = arr.findIndex(item => item.includes('INSCRIÇÃO ESTADUAL'));
    const totalIndex = arr.findIndex(item => item.includes('TOTAL'));

    // Tratamento para evitar erros se alguns índices não forem encontrados
    const customerNumber = customerNumberIndex !== -1 && arr[customerNumberIndex + 1] 
      ? arr[customerNumberIndex + 1]?.split(/\s{2,}/g) 
      : [''];

    const reference = referenceMonthIndex !== -1 && arr[referenceMonthIndex + 1] 
      ? arr[referenceMonthIndex + 1]?.split(/\s{2,}/g)[0] 
      : '';
      
    const referenceMonth = reference?.split('/')[0] || '';
    const referenceYear = reference?.split('/')[1] || '';

    let customerName = '';
    if (customerNumberIndex > 5) {
      customerName = arr[customerNumberIndex - 5] || '';
      if (stateNumber !== -1) {
        customerName = arr[customerNumberIndex - 6] || '';
      }
    }

    // Tentativa de encontrar valores de energia com verificações adicionais
    const electricEnergyData = this.findEnergyValue(arr, 'Energia Elétrica');
    const sceeeData = this.findEnergyValue(arr, 'Energia SCEEE');
    const compensatedData = this.findEnergyValue(arr, 'Energia Compensada');
    const publicLightingData = this.findValue(arr, 'Contrib Ilum Publica');
    const totalData = totalIndex !== -1 ? arr[totalIndex]?.split(/\s{2,}/g) : [];

    this.logger.debug(`Raw array data at index 3: ${JSON.stringify(arr.slice(0, 10))}`);
    
    // Extrair dados dos índices encontrados
    let electricEnergyKwh, electricEnergyValue, sceeValue, compensatedEnergyKwh, publicLightingContribution, total;

    if (electricEnergyData) {
      electricEnergyKwh = this.parseFloatSafe(electricEnergyData.quantity);
      electricEnergyValue = this.parseFloatSafe(electricEnergyData.value);
    }

    if (sceeeData) {
      sceeValue = this.parseFloatSafe(sceeeData.value);
    }

    if (compensatedData) {
      compensatedEnergyKwh = this.parseFloatSafe(compensatedData.quantity);
    }

    if (publicLightingData) {
      publicLightingContribution = this.parseFloatSafe(publicLightingData);
    }

    if (totalData && totalData.length > 1) {
      total = this.parseFloatSafe(totalData[1]);
    }

    // Fallback para método de busca baseado em regex se os valores principais não forem encontrados
    if (!electricEnergyKwh && !electricEnergyValue) {
      const regexResults = this.extractWithRegex(pdfText);
      electricEnergyKwh = regexResults.energyElectricKwh;
      electricEnergyValue = regexResults.energyElectricValue;
      sceeValue = regexResults.energySCEEEValue;
      compensatedEnergyKwh = regexResults.energyCompensatedKwh;
      publicLightingContribution = regexResults.publicLightingValue;
    }

    return {
      clientNumber: customerNumber[0] || '',
      customerNumber: customerNumber[0] || '',
      customerName,
      referenceMonth,
      referenceYear,
      electricEnergyKwh,
      electricEnergyValue,
      sceeValue,
      compensatedEnergyKwh,
      publicLightingContribution,
      total,
    };
  }

  private removeEmptyElements(arr: any[]): any[] {
    return arr.filter(element => element !== undefined && element !== null && element.trim() !== "");
  }

  private parseFloatSafe(value: string | undefined): number | undefined {
    if (!value) return undefined;
    // Remove caracteres não numéricos, exceto vírgula e ponto
    const cleanedValue = value.replace(/[^\d,.]/g, '').replace(',', '.');
    const result = parseFloat(cleanedValue);
    return isNaN(result) ? undefined : result;
  }

  private findEnergyValue(arr: string[], keyword: string): { quantity?: string, value?: string } | null {
    const index = arr.findIndex(item => item.includes(keyword));
    if (index === -1) return null;
    
    const parts = arr[index].split(/\s+/);
    // Procurar por padrões como "XXX kWh" e "R$ XXX"
    let quantity, value;
    
    for (let i = 0; i < parts.length; i++) {
      if (parts[i].toLowerCase() === 'kwh' && i > 0) {
        quantity = parts[i-1];
      }
      if ((parts[i] === 'R$' || parts[i] === 'R$:') && i < parts.length - 1) {
        value = parts[i+1];
      }
    }
    
    return { quantity, value };
  }

  private findValue(arr: string[], keyword: string): string | null {
    const index = arr.findIndex(item => item.includes(keyword));
    if (index === -1) return null;
    
    const parts = arr[index].split(/\s+/);
    // Procurar por padrão "R$ XXX"
    for (let i = 0; i < parts.length; i++) {
      if ((parts[i] === 'R$' || parts[i] === 'R$:') && i < parts.length - 1) {
        return parts[i+1];
      }
    }
    
    return null;
  }

  // Método de fallback usando regex
  private extractWithRegex(text: string): any {
    // Extrair número do cliente
    const clientNumberMatch = text.match(/N[o|°]\s*DO\s*CLIENTE:?\s*(\d+)/i);
    const clientNumber = clientNumberMatch ? clientNumberMatch[1] : '';

    // Extrair mês de referência
    const monthYearMatch = text.match(/Refer[eê]n[tc][ei]a\s*a\s*([A-Za-zçÇ]+)\/(\d{4})/i);
    const referenceMonth = monthYearMatch ? monthYearMatch[1] : '';
    const referenceYear = monthYearMatch ? parseInt(monthYearMatch[2]) : new Date().getFullYear();

    // Extrair valores de energia
    const energyElectricMatch = text.match(/Energia\s*El[ée]trica:?\s*([\d.,]+)\s*kWh\s*R\$\s*([\d.,]+)/i);
    const energyElectricKwh = energyElectricMatch ? this.parseFloatFromBrazilian(energyElectricMatch[1]) : 0;
    const energyElectricValue = energyElectricMatch ? this.parseFloatFromBrazilian(energyElectricMatch[2]) : 0;

    const energySCEEEMatch = text.match(/Energia\s*SCEEE\s*s\/ICMS:?\s*([\d.,]+)\s*kWh\s*R\$\s*([\d.,]+)/i);
    const energySCEEEValue = energySCEEEMatch ? this.parseFloatFromBrazilian(energySCEEEMatch[2]) : 0;

    const compensatedMatch = text.match(/Energia\s*Compensada\s*GD\s*[I1]:?\s*([\d.,]+)\s*kWh/i);
    const energyCompensatedKwh = compensatedMatch ? this.parseFloatFromBrazilian(compensatedMatch[1]) : 0;

    const publicLightMatch = text.match(/Contrib\s*Ilum\s*Publica\s*Municipal:?\s*R\$\s*([\d.,]+)/i);
    const publicLightingValue = publicLightMatch ? this.parseFloatFromBrazilian(publicLightMatch[1]) : 0;

    return {
      clientNumber,
      referenceMonth,
      referenceYear,
      energyElectricKwh,
      energyElectricValue,
      energySCEEEValue,
      energyCompensatedKwh,
      publicLightingValue,
    };
  }

  private parseFloatFromBrazilian(value: string): number {
    return parseFloat(value.replace(/\./g, '').replace(',', '.'));
  }
}