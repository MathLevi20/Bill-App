import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Bill, FilterParams, SummaryCard as SummaryCardType } from '../types';
import { getBills, getSummaryData } from '../services/api';
import FilterPanel from '../components/FilterPanel';
import SummaryCard from '../components/SummaryCard';
import EnergyChart from '../components/EnergyChart';
import FinancialChart from '../components/FinancialChart';

const Dashboard: React.FC = () => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [summaryData, setSummaryData] = useState({
    totalConsumption: 0,
    totalCompensatedEnergy: 0,
    totalValueWithoutGd: 0,
    totalGdEconomy: 0,
  });
  const [loading, setLoading] = useState(true);
  const [_filters, setFilters] = useState<FilterParams>({});
  const [error, setError] = useState<string | null>(null);

  const fetchData = async (filters: FilterParams = {}) => {
    try {
      setLoading(true);
      setError(null);

      const [billsData, summary] = await Promise.all([
        getBills(filters),
        getSummaryData(filters),
      ]);

      setBills(billsData);
      setSummaryData({
        totalConsumption: summary.totalConsumption,
        totalCompensatedEnergy: summary.totalCompensatedEnergy,
        totalValueWithoutGd: summary.totalValueWithoutGd,
        totalGdEconomy: summary.totalGdEconomy,
      });
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
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
      title: 'Total Energy Consumption',
      value: summaryData.totalConsumption,
      unit: 'kWh',
    },
    {
      title: 'Total Energy Compensated',
      value: summaryData.totalCompensatedEnergy,
      unit: 'kWh',
    },
    {
      title: 'Total Value without GD',
      value: summaryData.totalValueWithoutGd,
      unit: 'R$',
    },
    {
      title: 'Total GD Economy',
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
        className="text-2xl font-bold text-primary-dark"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Dashboard
      </motion.h1>
      
      <FilterPanel onFilter={handleFilter} />

      {loading ? (
        <div className="flex items-center justify-center h-64 bg-white rounded-lg shadow-md">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
          <span className="ml-3 text-primary-dark">Loading dashboard data...</span>
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
              <EnergyChart bills={bills} title="Energy Results (kWh)" />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <FinancialChart bills={bills} title="Financial Results (R$)" />
            </motion.div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
