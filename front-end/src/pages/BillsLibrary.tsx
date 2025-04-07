import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bill, FilterParams } from '../types/index';
import { getBills, downloadBillPdf, getPdfViewUrl, getBillsByDateRange } from '../services/api';
import FilterPanel from '../components/FilterPanel';
import PdfViewerModal from '../components/PdfViewerModal';
import { FaDownload, FaSpinner, FaEye, FaTimes, FaSearch } from 'react-icons/fa';
import { useLanguage } from '../contexts/LanguageContext';

const BillsLibrary: React.FC = () => {
  const { translate } = useLanguage();
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [_currentFilters, setCurrentFilters] = useState<FilterParams>({});
  const [viewingPdf, setViewingPdf] = useState<{ url: string, fileName: string } | null>(null);
  const [showWarning, setShowWarning] = useState(false);

  // Add useEffect to handle auto-hiding warning
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    if (showWarning) {
      timeoutId = setTimeout(() => {
        setShowWarning(false);
      }, 5000); // 5 seconds
    }
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [showWarning]);

  const validateDateRange = (filters: FilterParams): boolean => {
    if (filters.startDate && filters.endDate) {
      const startYear = filters.startDate.substring(0, 4);
      const endYear = filters.endDate.substring(0, 4);
      setShowWarning(startYear !== endYear);
    }
    return true; // Always return true to allow filtering
  };

  const fetchBills = async (filters: FilterParams = {}) => {
    try {
      validateDateRange(filters);
      setLoading(true);
      setError(null);
      setCurrentFilters(filters);
      console.log('Current filters:', filters);
      // Check if we're using date-based filtering in YYYY-MM format
      if (filters.startDate || filters.endDate) {
        const data = await getBillsByDateRange(
          filters.startDate, 
          filters.endDate
        );
        console.log(data)
        setBills(data);
      } else {
        // Use the regular getBills function for other filter types

        const data = await getBills(filters);
        console.log(data);

        setBills(data);
      }
    } catch (err) {
      console.error('Error fetching bills:', err);
      setError(translate('error_loading_bills'));
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
      link.download = `fatura_${bill.client.clientNumber}_${bill.referenceMonth}_${bill.referenceYear}.pdf`;
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

  const handleViewPdf = (bill: Bill) => {
    const pdfUrl = getPdfViewUrl(bill.filename);
    setViewingPdf({ 
      url: pdfUrl, 
      fileName: `Fatura ${bill.client.name} - ${bill.referenceMonth}/${bill.referenceYear}` 
    });
  };

  // Map of Portuguese month names to their abbreviated form
  const portugueseMonths = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 
    'Maio', 'Junho', 'Julho', 'Agosto', 
    'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  
  const monthsAbbr = [
    'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 
    'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
  ];

  // Group bills by client for the new table layout
  const billsByClient = bills.reduce((acc: Record<string, Bill[]>, bill: Bill) => {
    const clientNumber = bill.client.clientNumber;
    
    if (!acc[clientNumber]) {
      acc[clientNumber] = [];
    }
    
    acc[clientNumber].push(bill);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-primary-dark dark:text-gray-200">{translate('bills_library')}</h1>
      <FilterPanel onFilter={handleFilter} />
      
      {/* Warning Alert with animation */}
      <AnimatePresence>
        {showWarning && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-yellow-50 border border-yellow-400 text-yellow-800 px-4 py-3 rounded relative mb-4"
          >
            <span className="block sm:inline">{translate('date_range_warning')}</span>
            <button
              onClick={() => setShowWarning(false)}
              className="absolute top-0 bottom-0 right-0 px-4 py-3"
            >
              <FaTimes />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <span className="ml-3">{translate('loading_bills')}</span>
        </div>
      ) : error ? (
        <div className="bg-red-50 border-error-red">
          {error}
        </div>
      ) : bills.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="bg-gray-100 dark:bg-gray-700 rounded-full p-4 mb-4">
              <FaSearch className="h-8 w-8 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              {translate('no_bills_found')}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
              {translate('try_adjusting_filters')}
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-primary">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    {translate('client_name')}
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    {translate('client_number')}
                  </th>
                  <th scope="col" className="hidden md:table-cell px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    {translate('distributor')}
                  </th>
                  {monthsAbbr.map((month) => (
                    <th key={month} scope="col" className="px-1 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">
                      {month}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Object.entries(billsByClient).map(([clientNumber, clientBills]) => {
                  // Get the first bill to access client info
                  const firstBill = clientBills[0];
                  
                  return (
                    <tr key={clientNumber} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {firstBill.client.name}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {firstBill.client.clientNumber}
                      </td>
                      <td className="hidden md:table-cell px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        CEMIG
                      </td>
                      
                      {/* Month cells */}
                      {monthsAbbr.map((monthAbbr, index) => {
                        const fullMonth = portugueseMonths[index];
                        const bill = clientBills.find(b => b.referenceMonth === fullMonth);
                        
                        return (
                          <td key={`${clientNumber}-${monthAbbr}`} className="px-1 py-3 whitespace-nowrap text-center">
                            {bill ? (
                              <div className="flex flex-col space-y-1">
                      
                                
                                <motion.button
                                  className="px-2 py-1 rounded flex items-center justify-center bg-accent text-white shadow-sm hover:shadow-md text-xs"
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => handleViewPdf(bill)}
                                  title="Visualizar fatura"
                                >
                                  <FaEye className="h-3 w-3 mr-1" />
                                  <span>{translate('view')}</span>
                                </motion.button>
                              </div>
                            ) : (
                              <div className="w-full h-8 rounded bg-gray-200 text-gray-400 flex items-center justify-center mx-auto text-xs">
                                {translate('unavailable')}
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* PDF Viewer Modal */}
      <AnimatePresence>
        {viewingPdf && (
          <PdfViewerModal
            pdfUrl={viewingPdf.url}
            fileName={viewingPdf.fileName}
            onClose={() => setViewingPdf(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default BillsLibrary;
