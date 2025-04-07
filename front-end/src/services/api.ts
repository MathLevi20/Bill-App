import axios from 'axios';
import { Bill, Client, FilterParams, CreateBillDto, CreateClientDto } from '../types/index';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

const api = axios.create({
  baseURL: API_URL,
});

// Utility function to convert full date to YYYY-MM format
const convertToYearMonth = (dateString: string): string => {
  if (!dateString) return '';
  // Extract just YYYY-MM portion from a full date
  return dateString.substring(0, 7);
};

// Client API calls
export const getClients = async (): Promise<Client[]> => {
  const response = await api.get('/clients');
  return response.data;
};

export const getClientById = async (id: string): Promise<Client> => {
  const response = await api.get(`/clients/${id}`);
  return response.data;
};

export const getClientByNumber = async (clientNumber: string): Promise<Client> => {
  const response = await api.get(`/clients/number/${clientNumber}`);
  return response.data;
};

export const createClient = async (clientData: CreateClientDto): Promise<Client> => {
  const response = await api.post('/clients', clientData);
  return response.data;
};

// Bill API calls
export const getBills = async (filters: FilterParams = {}): Promise<Bill[]> => {
  const params: Record<string, any> = {};
  
  if (filters.clientNumber) {
    // We'll filter client numbers on the frontend since the API doesn't support direct filtering
  }
  
  // Use the correct query parameter names that match the backend
  if (filters.startDate) {
    params.startDate = filters.startDate;
  }
  
  if (filters.endDate) {
    params.endDate = filters.endDate;
  }
  
  console.log(`Fetching bills with params:`, params);
  
  const response = await api.get('/bills', { params });
  let bills = response.data;
  
  // Client number filtering on frontend
  if (filters.clientNumber) {
    bills = bills.filter((bill: Bill) => bill.client.clientNumber === filters.clientNumber);
  }
  console.log(`Fetching bills with params:`, bills);

  return bills;
};

// New function to get bills by date range using the specific endpoint
export const getBillsByDateRange = async (startDate?: string, endDate?: string): Promise<Bill[]> => {
  const params: Record<string, string> = {};
  
  if (startDate) {
    params.startDate = startDate; // Format should be YYYY-MM (e.g., 2024-06)
  }
  
  if (endDate) {
    params.endDate = endDate; // Format should be YYYY-MM (e.g., 2024-12)
  }
  
  try {
    const response = await api.get('/bills/date-range', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching bills by date range:', error);
    throw error;
  }
};

export const getBillById = async (id: string): Promise<Bill> => {
  const response = await api.get(`/bills/${id}`);
  return response.data;
};

export const getBillsByClientId = async (clientId: string): Promise<Bill[]> => {
  const response = await api.get(`/bills/client/${clientId}`);
  return response.data;
};

export const uploadBillPdf = async (file: File, clientId?: string): Promise<any> => {
  const formData = new FormData();
  formData.append('file', file);
  
  // If clientId is provided, add it to the request
  if (clientId) {
    formData.append('clientId', clientId);
  }
  
  const response = await api.post('/bills/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data;
};

export const processBillsFolder = async (): Promise<any> => {
  const response = await api.post('/bills/folder/process');
  return response.data;
};

export const listPdfFiles = async (): Promise<any[]> => {
  try {
    const response = await api.get('/bills/folder/list');
    
    // Check if the response has an installations property which is an array
    if (response.data && response.data.installations && Array.isArray(response.data.installations)) {
      // Return the installations data which contains installation ID and files
      return response.data.installations;
    } 
    // Handle case where response is already an array
    else if (Array.isArray(response.data)) {
      return response.data;
    } 
    else {
      console.error('Unexpected data format:', response.data);
      return []; // Return empty array as fallback
    }
  } catch (error) {
    console.error('Error listing PDF files:', error);
    throw error;
  }
};

export const createBill = async (billData: CreateBillDto): Promise<Bill> => {
  const response = await api.post('/bills', billData);
  return response.data;
};

// The API doesn't have a summary endpoint, so we'll calculate it on the frontend
export const getSummaryData = async (filters: FilterParams = {}): Promise<{
  totalConsumption: number;
  totalCompensatedEnergy: number;
  totalValueWithoutGd: number;
  totalGdEconomy: number;
}> => {
  // Use the appropriate bills fetching method based on date filters
  const bills = filters.startDate || filters.endDate
    ? await getBillsByDateRange(filters.startDate, filters.endDate)
    : await getBills(filters);

  console.log('Summary calculation using bills:', bills);
  
  const summary = bills.reduce(
    (acc, bill) => {
      return {
        totalConsumption: acc.totalConsumption + bill.totalEnergyConsumption,
        totalCompensatedEnergy: acc.totalCompensatedEnergy + bill.energyCompensatedKwh,
        totalValueWithoutGd: acc.totalValueWithoutGd + bill.totalValueWithoutGD,
        totalGdEconomy: acc.totalGdEconomy + bill.gdSavings,
      };
    },
    {
      totalConsumption: 0,
      totalCompensatedEnergy: 0,
      totalValueWithoutGd: 0,
      totalGdEconomy: 0,
    }
  );
  
  console.log('Calculated summary:', summary);
  return summary;
};

// For downloading PDFs - we'll add this function even though it's not in the swagger
// It could be implemented on the backend by adding a /bills/{id}/download endpoint
export const downloadBillPdf = async (billId: string): Promise<Blob> => {
  // This is a mock implementation - your actual API might have a different endpoint
  try {
    // Get the bill details (but don't use it to prevent unused variable warning)
    await getBillById(billId);
    
    // Make a request to download the PDF - this is a hypothetical endpoint
    // You would need to implement this endpoint on the backend
    const response = await api.get(`/bills/${billId}/download`, {
      responseType: 'blob',
    });
    
    return response.data;
  } catch (error) {
    console.error('Error downloading bill PDF:', error);
    throw new Error('Failed to download bill PDF');
  }
};

export const getPdfViewUrl = (fileName: string): string => {
  // Prefix variable name with underscore to indicate intentionally unused
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  
  // Return the URL to the PDF file for viewing in browser
  return `${API_URL}bills/pdf/${fileName}`;
};

export const resetAllBills = async (): Promise<{ message: string; deletedCount: number }> => {
  const response = await api.delete('/bills/reset');
  return response.data;
};

export default api;
