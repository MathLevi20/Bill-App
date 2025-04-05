import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FilterParams } from '../types';

interface FilterPanelProps {
  onFilter: (filters: FilterParams) => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({ onFilter }) => {
  const [filters, setFilters] = useState<FilterParams>({
    clientNumber: '',
    startDate: '',
    endDate: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilter(filters);
  };

  const handleReset = () => {
    setFilters({
      clientNumber: '',
      startDate: '',
      endDate: '',
    });
    onFilter({});
  };

  return (
    <motion.div 
      className="bg-white rounded-lg shadow-md p-4 md:p-6 mb-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h3 className="text-lg font-medium text-primary-dark mb-4">Filters</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label htmlFor="clientNumber" className="block text-sm font-medium text-primary-dark">
              Client Number
            </label>
            <input
              type="text"
              id="clientNumber"
              name="clientNumber"
              value={filters.clientNumber}
              onChange={handleChange}
              placeholder="Enter client number"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="startDate" className="block text-sm font-medium text-primary-dark">
              From
            </label>
            <input
              type="month"
              id="startDate"
              name="startDate"
              value={filters.startDate}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="endDate" className="block text-sm font-medium text-primary-dark">
              To
            </label>
            <input
              type="month"
              id="endDate"
              name="endDate"
              value={filters.endDate}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>
        </div>
        
        <div className="flex justify-end space-x-3">
          <motion.button
            type="button"
            onClick={handleReset}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium hover:text-primary-dark  text-primary-white hover:bg-secondary hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
          >
            Reset
          </motion.button>
          
          <motion.button
            type="submit"
            className="px-4 py-2 bg-primary border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
          >
            Apply Filters
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
};

export default FilterPanel;
