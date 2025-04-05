import React from 'react';
import { motion } from 'framer-motion';
import { SummaryCard as SummaryCardType } from '../types';

const SummaryCard: React.FC<SummaryCardType> = ({ title, value, unit }) => {
  const formattedValue = value.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <motion.div 
      className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.02 }}
    >
      <h3 className="text-sm font-medium text-primary-dark mb-2">{title}</h3>
      <motion.div 
        className="text-2xl font-bold text-primary"
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring" }}
      >
        {formattedValue}
      </motion.div>
      <div className="text-sm text-primary-dark">{unit}</div>
    </motion.div>
  );
};

export default SummaryCard;
