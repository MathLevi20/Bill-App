import React from 'react';
import { motion } from 'framer-motion';
import { SummaryCard as SummaryCardType } from '../types/index';
import { FaBolt, FaSolarPanel, FaMoneyBillWave, FaLeaf} from 'react-icons/fa';
import { useLanguage } from '../contexts/LanguageContext';

interface ExtendedSummaryCardProps extends SummaryCardType {
  icon?: React.ReactNode;
}

const SummaryCard: React.FC<ExtendedSummaryCardProps> = ({ title, value, unit, icon }) => {
  const { language } = useLanguage();
  
  const formattedValue = value.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  // Choose default icon based on title if none provided
  let cardIcon = icon;
  if (!cardIcon) {
    const lowerTitle = title.toLowerCase();
    
    if (language === 'pt-BR') {
      // Portuguese title checks
      if (lowerTitle.includes('consumo')) cardIcon = <FaBolt className="text-amber-500" />;
      else if (lowerTitle.includes('compensada')) cardIcon = <FaSolarPanel className="text-accent" />;
      else if (lowerTitle.includes('valor')) cardIcon = <FaMoneyBillWave className="text-warning-yellow" />;
      else if (lowerTitle.includes('economia')) cardIcon = <FaLeaf className="text-primary-light" />;
    } else {
      // English title checks
      if (lowerTitle.includes('consumption')) cardIcon = <FaBolt className="text-amber-500" />;
      else if (lowerTitle.includes('compensated')) cardIcon = <FaSolarPanel className="text-accent" />;
      else if (lowerTitle.includes('value')) cardIcon = <FaMoneyBillWave className="text-warning-yellow" />;
      else if (lowerTitle.includes('economy')) cardIcon = <FaLeaf className="text-primary-light" />;
    }
  }

  return (
    <motion.div 
      className="bg-white dark:bg-gray-800 rounded-lg shadow border-l-4 border-primary p-6 hover:shadow-lg transition-shadow"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.02 }}
    >
      <div className="flex items-center mb-3">
        <span className="text-2xl mr-3">{cardIcon}</span>
        <h3 className="text-sm font-medium text-primary-dark dark:text-gray-300">{title}</h3>
      </div>
      <motion.div 
        className="text-2xl font-bold text-primary dark:text-primary-light"
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring" }}
      >
        {formattedValue}
      </motion.div>
      <div className="text-sm text-primary-dark dark:text-gray-400">{unit}</div>
    </motion.div>
  );
};

export default SummaryCard;
