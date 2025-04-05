import React from 'react';
import { motion } from 'framer-motion';
import { SummaryCard as SummaryCardType } from '../types/index';
import { FaBolt, FaSolarPanel, FaMoneyBillWave, FaLeaf} from 'react-icons/fa';

interface ExtendedSummaryCardProps extends SummaryCardType {
  icon?: React.ReactNode;
}

const SummaryCard: React.FC<ExtendedSummaryCardProps> = ({ title, value, unit, icon }) => {
  const formattedValue = value.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  // Choose default icon based on title if none provided
  let cardIcon = icon;
  if (!cardIcon) {
    if (title.includes('Consumption')) cardIcon = <FaBolt className="text-primary" />;
    else if (title.includes('Compensated')) cardIcon = <FaSolarPanel className="text-accent" />;
    else if (title.includes('Value')) cardIcon = <FaMoneyBillWave className="text-warning-yellow" />;
    else if (title.includes('Economy')) cardIcon = <FaLeaf className="text-primary-light" />;
  }

  return (
    <motion.div 
      className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.02 }}
    >
      <div className="flex items-center mb-3">
        <span className="text-2xl mr-3">{cardIcon}</span>
        <h3 className="text-sm font-medium text-primary-dark">{title}</h3>
      </div>
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
