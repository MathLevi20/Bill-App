import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Bill, FilterParams } from '../types';
import { getBills, downloadBillPdf } from '../services/api';
import FilterPanel from '../components/FilterPanel';
import { FaDownload, FaSpinner } from 'react-icons/fa';

const BillsLibrary: React.FC = () => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchBills = async (filters: FilterParams = {}) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getBills(filters);
      setBills(data);
    } catch (err) {
      console.error('Error fetching bills:', err);
      setError('Failed to load bills. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBills();
  }, []);

  const handleFilter = (filters: FilterParams) => {
    fetchBills(filters);
  };

  const handleDownload = async (bill: Bill) => {
    try {
      setDownloading(bill.id);
      const pdfBlob = await downloadBillPdf(bill.id);
      
      // Create a download link
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `bill_${bill.client.clientNumber}_${bill.referenceMonth}_${bill.referenceYear}.pdf`;
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading bill:', error);
      alert('Failed to download the bill. Please try again later.');
    } finally {
      setDownloading(null);
    }
  };

  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-primary-dark">Bills Library</h1>
      <FilterPanel onFilter={handleFilter} />
      
      {loading ? (
        <div className="flex items-center justify-center h-64 bg-white rounded-lg shadow-md">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
          <span className="ml-3 text-primary-dark">Loading bills...</span>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-error-red text-error-red px-6 py-4 rounded-lg">
          {error}
        </div>
      ) : bills.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 bg-white rounded-lg shadow-md">
          <p className="text-lg text-gray-500">No bills found with the current filters.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-primary">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Nome da UC
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Número da UC
                  </th>
                  <th scope="col" className="hidden md:table-cell px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Distribuidora
                  </th>
                  <th scope="col" className="hidden md:table-cell px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Consumidor
                  </th>
                  {months.map((month) => (
                    <th key={month} scope="col" className="px-1 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">
                      {month}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {bills.map((bill) => (
                  <tr key={bill.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {bill.client.name}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {bill.client.clientNumber}
                    </td>
                    <td className="hidden md:table-cell px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      CEMIG
                    </td>
                    <td className="hidden md:table-cell px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {bill.client.name}
                    </td>
                    {months.map((month) => (
                      <td key={month} className="px-1 py-3 whitespace-nowrap text-center">
                        <motion.button
                          className={`w-7 h-7 rounded-full flex items-center justify-center ${
                            month.toLowerCase() === bill.referenceMonth.substring(0, 3).toLowerCase() 
                              ? 'bg-primary text-white' 
                              : 'bg-gray-200 text-gray-400'
                          }`}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleDownload(bill)}
                          disabled={downloading === bill.id || month.toLowerCase() !== bill.referenceMonth.substring(0, 3).toLowerCase()}
                        >
                          {downloading === bill.id ? (
                            <FaSpinner className="animate-spin h-4 w-4" />
                          ) : (
                            <FaDownload className="h-3.5 w-3.5" />
                          )}
                        </motion.button>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillsLibrary;
