import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Bill, FilterParams, SummaryCard as SummaryCardType } from '../types/index';
import { getBills, getBillsByDateRange, getSummaryData } from '../services/api';
import FilterPanel from '../components/FilterPanel';
import SummaryCard from '../components/SummaryCard';
import EnergyChart from '../components/EnergyChart';
import FinancialChart from '../components/FinancialChart';
import LineChart from '../components/LineChart'; // Importing new LineChart component
import { useLanguage } from '../contexts/LanguageContext';

const Dashboard: React.FC = () => {
  const { translate } = useLanguage();
  const [bills, setBills] = useState<Bill[]>([]);
  const [summaryData, setSummaryData] = useState({
    totalConsumption: 0,
    totalCompensatedEnergy: 0,
    totalValueWithoutGd: 0,
    totalGdEconomy: 0,
  });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterParams>({});
  const [error, setError] = useState<string | null>(null);

  const fetchData = async (filters: FilterParams = {}) => {
    try {
      setLoading(true);
      setError(null);
      setFilters(filters);
      
      console.log('Fetching data with filters:', filters);
      console.log('Date filters:', {
        startDate: filters.startDate,
        endDate: filters.endDate
      });

      // Use date-based filtering if dates are provided
      const [billsData, summary] = await Promise.all([
        // Get bills using appropriate method based on filters
        filters.startDate || filters.endDate
          ? (async () => {
              console.log('Using getBillsByDateRange with:', {
                startDate: filters.startDate,
                endDate: filters.endDate
              });
              const data = await getBillsByDateRange(filters.startDate, filters.endDate);
              console.log('getBillsByDateRange response:', data);
              return data;
            })()
          : (async () => {
              console.log('Using getBills with filters:', filters);
              const data = await getBills(filters);
              console.log('getBills response:', data);
              return data;
            })(),
        // Always get summary data with current filters
        (async () => {
          console.log('Fetching summary with filters:', filters);
          const summaryData = await getSummaryData(filters);
          console.log('Summary response:', summaryData);
          return summaryData;
        })()
      ]);

      console.log('Final data:', {
        billsData,
        summary,
        billsCount: billsData.length
      });

      setBills(billsData);
      setSummaryData({
        totalConsumption: summary.totalConsumption,
        totalCompensatedEnergy: summary.totalCompensatedEnergy,
        totalValueWithoutGd: summary.totalValueWithoutGd,
        totalGdEconomy: summary.totalGdEconomy,
      });
    } catch (err) {
      console.error('Error in fetchData:', err);
      setError('Failed to load dashboard data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleFilter = (newFilters: FilterParams) => {
    setFilters(newFilters);
    fetchData(newFilters);
  };

  const summaryCards: SummaryCardType[] = [
    {
      title: translate('total_energy_consumption'),
      value: summaryData.totalConsumption,
      unit: 'kWh',
    },
    {
      title: translate('total_energy_compensated'),
      value: summaryData.totalCompensatedEnergy,
      unit: 'kWh',
    },
    {
      title: translate('total_value_without_gd'),
      value: summaryData.totalValueWithoutGd,
      unit: 'R$',
    },
    {
      title: translate('total_gd_economy'),
      value: summaryData.totalGdEconomy,
      unit: 'R$',
    },
  ];
  
  // Animation variants for container
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="space-y-6">
      <motion.h1 
        className="text-2xl font-bold text-primary-dark dark:text-gray-200"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {translate('dashboard')}
      </motion.h1>
      
      <FilterPanel onFilter={handleFilter} />

      {loading ? (
        <div className="flex items-center justify-center h-64 bg-white rounded-lg shadow-md">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
          <span className="ml-3 text-primary-dark">{translate('loading')}...</span>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-error-red text-error-red px-6 py-4 rounded-lg">
          {error}
        </div>
      ) : (
        <>
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {summaryCards.map((card, index) => (
              <SummaryCard
                key={index}
                title={card.title}
                value={card.value}
                unit={card.unit}
              />
            ))}
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <EnergyChart bills={bills} title={translate('energy_results')} />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <FinancialChart bills={bills} title={translate('financial_results')} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <LineChart 
                bills={bills} 
                title={translate('consumption_vs_compensation')}
                series={[
                  { key: 'consumption', label: translate('energy_consumption') },
                  { key: 'compensation', label: translate('energy_compensation') }
                ]} 
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <LineChart 
                bills={bills} 
                title={translate('financial_comparison')}
                series={[
                  { key: 'withoutGD', label: translate('cost_without_gd') },
                  { key: 'savings', label: translate('gd_savings') }
                ]} 
              />
            </motion.div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
