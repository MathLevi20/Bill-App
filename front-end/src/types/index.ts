export interface Client {
  id?: string;
  name: string;
  clientNumber: string;
  bills?: Bill[];
}

export interface CreateClientDto {
  name: string;
  clientNumber: string;
}

export interface Bill {
  id: string;
  referenceMonth: string;
  referenceYear: number;
  energyElectricKwh: number;
  energyElectricValue: number;
  energySCEEEKwh: number;
  energySCEEEValue: number;
  energyCompensatedKwh: number;
  energyCompensatedValue: number;
  publicLightingValue: number;
  totalEnergyConsumption: number;
  totalValueWithoutGD: number;
  gdSavings: number;
  createdAt: string;
  updatedAt: string;
  client: Client;
  filename: string;
}

export interface CreateBillDto {
  clientId: number;
  referenceMonth: string;
  referenceYear: number;
  energyElectricKwh: number;
  energyElectricValue: number;
  energySCEEEKwh: number;
  energySCEEEValue: number;
  energyCompensatedKwh: number;
  energyCompensatedValue: number;
  publicLightingValue: number;
}

export interface FilterParams {
  clientNumber?: string;
  startDate?: string;
  endDate?: string;
  year?: string; // Add this line

}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string;
    borderColor: string;
    borderWidth: number;
  }[];
}

export interface SummaryCard {
  title: string;
  value: number;
  unit: string;
}
