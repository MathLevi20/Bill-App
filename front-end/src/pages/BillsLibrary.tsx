import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bill, FilterParams } from '../types/index';
import { getBills, downloadBillPdf, getPdfViewUrl } from '../services/api';
import FilterPanel from '../components/FilterPanel';
import PdfViewerModal from '../components/PdfViewerModal';
import { FaDownload, FaSpinner, FaEye } from 'react-icons/fa';

const BillsLibrary: React.FC = () => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [_currentFilters, setCurrentFilters] = useState<FilterParams>({});
  const [viewingPdf, setViewingPdf] = useState<{ url: string, fileName: string } | null>(null);

  const fetchBills = async (filters: FilterParams = {}) => {
    try {
      setLoading(true);
      setError(null);
      setCurrentFilters(filters);
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
      <h1 className="text-2xl font-bold text-primary-dark">Biblioteca de Faturas</h1>
      <FilterPanel onFilter={handleFilter} />
      
      {loading ? (
        <div className="flex items-center justify-center h-64 bg-white rounded-lg shadow-md">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
          <span className="ml-3 text-primary-dark">Carregando faturas...</span>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-error-red text-error-red px-6 py-4 rounded-lg">
          {error}
        </div>
      ) : bills.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 bg-white rounded-lg shadow-md">
          <p className="text-lg text-gray-500">Nenhuma fatura encontrada com os filtros atuais.</p>
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
                              <div className="flex justify-center space-x-1">
                                <motion.button
                                  className="w-7 h-7 rounded-full flex items-center justify-center bg-primary text-white"
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => handleDownload(bill)}
                                  disabled={downloading === bill.id}
                                  title="Download fatura"
                                >
                                  {downloading === bill.id ? (
                                    <FaSpinner className="animate-spin h-4 w-4" />
                                  ) : (
                                    <FaDownload className="h-3.5 w-3.5" />
                                  )}
                                </motion.button>
                                
                                <motion.button
                                  className="w-7 h-7 rounded-full flex items-center justify-center bg-accent text-white"
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => handleViewPdf(bill)}
                                  title="Visualizar fatura"
                                >
                                  <FaEye className="h-3.5 w-3.5 " />
                                </motion.button>
                              </div>
                            ) : (
                              <div className="w-7 h-7 rounded-full bg-gray-200 text-gray-400 flex items-center justify-center mx-auto">
                                -
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
