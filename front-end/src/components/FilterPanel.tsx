import React, { useState, useEffect } from 'react';
import { FilterParams } from '../types';
import { getClients, getBills } from '../services/api';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FaFilter, FaCalendarAlt, FaSearch } from 'react-icons/fa';

interface FilterPanelProps {
  onFilter: (filters: FilterParams) => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({ onFilter }) => {
  const [clientNumber, setClientNumber] = useState<string>('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [year, setYear] = useState<string>('');
  const [clientOptions, setClientOptions] = useState<{ value: string; label: string }[]>([]);
  const [availableYears, setAvailableYears] = useState<string[]>([]);
  const [isExpanded, setIsExpanded] = useState(true); // Default expanded for better UX

  useEffect(() => {
    // Fetch clients for the dropdown and determine available years from bills
    const loadData = async () => {
      try {
        // Load clients
        const clients = await getClients();
        const options = clients.map(client => ({
          value: client.clientNumber,
          label: `${client.name} (${client.clientNumber})`
        }));
        setClientOptions(options);
        
        // Load bills to determine available years
        const bills = await getBills();
        const years = new Set<string>();
        bills.forEach(bill => {
          years.add(bill.referenceYear.toString());
        });
        
        const sortedYears = Array.from(years).sort((a, b) => parseInt(b) - parseInt(a));
        setAvailableYears(sortedYears);
      } catch (error) {
        console.error('Error loading filter data:', error);
      }
    };

    loadData();
  }, []);

  const handleFilter = () => {
    const filters: FilterParams = {};
    
    if (clientNumber) {
      filters.clientNumber = clientNumber;
    }
    
    if (startDate) {
      filters.startDate = startDate.toISOString().split('T')[0];
    }
    
    if (endDate) {
      filters.endDate = endDate.toISOString().split('T')[0];
    }
    
    if (year) {
      filters.year = year;
    }
    
    onFilter(filters);
  };

  const handleReset = () => {
    setClientNumber('');
    setStartDate(null);
    setEndDate(null);
    setYear('');
    onFilter({});
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-primary-dark flex items-center">
          <FaFilter className="mr-2" /> Filtros
        </h2>
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-primary hover:text-primary-dark focus:outline-none"
        >
          {isExpanded ? 'Esconder' : 'Mostrar'} filtros
        </button>
      </div>
      
      {isExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Unidade Consumidora</label>
            <select
              className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary"
              value={clientNumber}
              onChange={(e) => setClientNumber(e.target.value)}
            >
              <option value="">Todas as UCs</option>
              {clientOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ano de Referência</label>
            <select
              className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary"
              value={year}
              onChange={(e) => setYear(e.target.value)}
            >
              <option value="">Todos os anos</option>
              {availableYears.map(yearOption => (
                <option key={yearOption} value={yearOption}>
                  {yearOption}
                </option>
              ))}
            </select>
          </div>
          
          {/* Date pickers grouped together */}
          <div className="flex space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Data Inicial</label>
              <div className="relative flex items-center">
                <DatePicker
                  selected={startDate}
                  onChange={(date: Date | null) => setStartDate(date)}
                  selectsStart
                  startDate={startDate}
                  endDate={endDate}
                  placeholderText="Selecione a data"
                  className="w-full border border-gray-300 rounded-md py-2 pl-3 pr-10 focus:outline-none focus:ring-2 focus:ring-primary"
                  dateFormat="dd/MM/yyyy"
                />
                <FaCalendarAlt className="absolute right-3 text-gray-400 pointer-events-none" />
              </div>
            </div>
            
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Data Final</label>
              <div className="relative flex items-center">
                <DatePicker
                  selected={endDate}
                  onChange={(date: Date | null) => setEndDate(date)}
                  selectsEnd
                  startDate={startDate}
                  endDate={endDate}
                  minDate={startDate || undefined}
                  placeholderText="Selecione a data"
                  className="w-full border border-gray-300 rounded-md py-2 pl-3 pr-10 focus:outline-none focus:ring-2 focus:ring-primary"
                  dateFormat="dd/MM/yyyy"
                />
                <FaCalendarAlt className="absolute right-3 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>
          
          <div className="col-span-1 md:col-span-2 lg:col-span-3 flex justify-end space-x-3 mt-4">
            <button
              onClick={handleReset}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Limpar
            </button>
            <button
              onClick={handleFilter}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark flex items-center"
            >
              <FaSearch className="mr-2" /> Filtrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterPanel;
