import React, { useState, useEffect } from 'react';
import { FilterParams } from '../types';
import { getClients } from '../services/api';
import DatePicker from "react-datepicker";
import type { ReactDatePickerProps } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from 'date-fns';
import { registerLocale } from "react-datepicker";
import { FaFilter, FaSearch, FaTimes } from 'react-icons/fa';
import { useLanguage } from '../contexts/LanguageContext';
import { ptBR } from 'date-fns/locale/pt-BR';
import { enUS } from 'date-fns/locale/en-US';

// Register locales for DatePicker
registerLocale('pt-BR', ptBR);
registerLocale('en-US', enUS);

interface FilterPanelProps {
  onFilter: (filters: FilterParams) => void;
}

interface CustomDatePickerProps extends ReactDatePickerProps {
  showMonthYearPicker?: boolean;
}

const FilterPanel: React.FC<FilterPanelProps> = ({ onFilter }) => {
  const { language, translate } = useLanguage();
  const [clientNumber, setClientNumber] = useState<string>('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [clientOptions, setClientOptions] = useState<{ value: string; label: string }[]>([]);
  const [isExpanded, setIsExpanded] = useState(true);
  const [quickDateRange, setQuickDateRange] = useState<string>('');

  // Set locale based on application language
  const dateLocale = language === 'pt-BR' ? 'pt-BR' : 'en-US';

  useEffect(() => {
    // Fetch clients for the dropdown
    const loadData = async () => {
      try {
        // Load clients
        const clients = await getClients();
        const options = clients.map(client => ({
          value: client.clientNumber,
          label: `${client.name} (${client.clientNumber})`
        }));
        setClientOptions(options);
      } catch (error) {
        console.error('Error loading data:', error);
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
      filters.startDate = format(startDate, 'yyyy-MM');
    }
    
    if (endDate) {
      filters.endDate = format(endDate, 'yyyy-MM');
    }
    
    onFilter(filters);
  };

  const handleReset = () => {
    setClientNumber('');
    setStartDate(null);
    setEndDate(null);
    setQuickDateRange('');
    onFilter({});
  };

  // Quick date range options
  const applyQuickDateRange = (range: string) => {
    const today = new Date();
    let start: Date | null = null;
    let end: Date | null = today;
    
    switch(range) {
      case 'last3months':
        start = new Date(today.getFullYear(), today.getMonth() - 2, 1);
        end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        break;
      case 'last6months':
        start = new Date(today.getFullYear(), today.getMonth() - 5, 1);
        end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        break;
      case 'thisYear':
        start = new Date(today.getFullYear(), 0, 1);
        end = new Date(today.getFullYear(), 11, 31);
        break;
      case 'lastYear':
        start = new Date(today.getFullYear() - 1, 0, 1);
        end = new Date(today.getFullYear() - 1, 11, 31);
        break;
      default:
        break;
    }
    
    setStartDate(start);
    setEndDate(end);
    setQuickDateRange(range);
  };

  // When a date is changed manually, update to custom range
  const handleDateChange = (date: Date | null, isStart: boolean) => {
    if (isStart) {
      setStartDate(date);
    } else {
      setEndDate(date);
    }
    
    if (quickDateRange !== 'custom') {
      setQuickDateRange('custom');
    }
  };

  const clearDates = () => {
    setStartDate(null);
    setEndDate(null);
    setQuickDateRange('');
  };

  // Custom DatePicker component with proper typing
  const CustomDatePicker: React.FC<CustomDatePickerProps> = (props) => (
    <DatePicker {...props} />
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border-t-4 border-primary p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-primary-dark dark:text-gray-200 flex items-center">
          <FaFilter className="mr-2" /> {translate('filters')}
        </h2>
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-white  dark:text-white hover:text-primary-dark dark:hover:text-white focus:outline-none"
        >
          {isExpanded ? translate('hide_filters') : translate('show_filters')}
        </button>
      </div>
      
      {isExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {translate('consumer_unit')}
            </label>
            <select
              className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-primary-light"
              value={clientNumber}
              onChange={(e) => setClientNumber(e.target.value)}
            >
              <option value="">{translate('all_units')}</option>
              {clientOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          {/* Date range section */}
          <div className="md:col-span-2">
            <div className="flex flex-col space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {translate('date_range')}
              </label>
              
              {/* Quick Date Range Selector */}
              <div className="flex flex-wrap gap-2 mb-3">
                <button
                  onClick={() => applyQuickDateRange('last3months')}
                  className={`px-3 py-1 text-xs rounded-full transition-colors ${
                    quickDateRange === 'last3months'
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {translate('last_3_months')}
                </button>
                <button
                  onClick={() => applyQuickDateRange('last6months')}
                  className={`px-3 py-1 text-xs rounded-full transition-colors ${
                    quickDateRange === 'last6months'
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {translate('last_6_months')}
                </button>
                <button
                  onClick={() => applyQuickDateRange('thisYear')}
                  className={`px-3 py-1 text-xs rounded-full transition-colors ${
                    quickDateRange === 'thisYear'
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {translate('this_year')}
                </button>
                <button
                  onClick={() => applyQuickDateRange('lastYear')}
                  className={`px-3 py-1 text-xs rounded-full transition-colors ${
                    quickDateRange === 'lastYear'
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {translate('last_year')}
                </button>
              </div>
              
              {/* Material UI Date Pickers */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {translate('start_date')}
                  </label>
                  <CustomDatePicker
                    selected={startDate}
                    onChange={(date: Date | null) => handleDateChange(date, true)}
                    dateFormat="MM/yyyy"
                    showMonthYearPicker={true}
                    locale={dateLocale}
                    className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholderText={translate('select_start_month')}
                  />
                </div>
                
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {translate('end_date')}
                  </label>
                  <CustomDatePicker
                    selected={endDate}
                    onChange={(date: Date | null) => handleDateChange(date, false)}
                    dateFormat="MM/yyyy"
                    showMonthYearPicker={true}
                    locale={dateLocale}
                    minDate={startDate || undefined}
                    className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholderText={translate('select_end_month')}
                  />
                </div>
                
                {(startDate || endDate) && (
                  <button
                    onClick={clearDates}
                    className="self-end mb-1 px-2 py-2 text-gray-100 hover:text-error-red dark:text-gray-400 dark:hover:text-error-red"
                    title={translate('clear_dates')}
                  >
                    <FaTimes />
                  </button>
                )}
              </div>
            </div>
          </div>
          
          <div className="col-span-1 md:col-span-2 flex justify-end space-x-3 mt-4">
            <button
              onClick={handleReset}
              className="px-4 py-2 border border-gray-100 dark:border-gray-600 rounded-md text-gray-100 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              {translate('clear')}
            </button>
            <button
              onClick={handleFilter}
              className="px-4 py-2 bg-primary dark:bg-primary-dark text-white rounded-md hover:bg-primary-hover dark:hover:bg-primary flex items-center"
            ><FaSearch className="mr-2" /> {translate('filter')}</button>
              
            </div>
        </div>
      )}
    </div>
  );
};

export default FilterPanel;
