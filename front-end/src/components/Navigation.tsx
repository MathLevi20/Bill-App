import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { FaHome, FaBook, FaUserShield, FaBars, FaTimes, FaMoon, FaSun, FaGlobe } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import logo from '../assets/logo.svg';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';

const Navigation: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { language, setLanguage, translate } = useLanguage();
  const { toggleTheme, isDark } = useTheme();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleLanguage = () => {
    setLanguage(language === 'pt-BR' ? 'en' : 'pt-BR');
  };

  return (
    <motion.nav 
      className="bg-gradient-to-r from-primary-dark via-primary to-primary-light dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 text-white shadow-lg"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-17">
        {/* Logo and Title */}
        <motion.div 
          className="flex items-center space-x-4"
          initial={{ x: -20 }}
          animate={{ x: 0 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
        >
          <img src={logo} alt="Lumi Logo" className="h-16 w-16" />
        </motion.div>

        {/* Mobile Menu Buttons */}
        <div className="md:hidden flex items-center">
          <button 
            onClick={toggleTheme}
            className="p-2 mr-2 rounded-md focus:outline-none focus:ring-2 focus:ring-white text-white"
            aria-label="Toggle Theme"
          >
            <div className="flex items-center">
              {isDark ? <FaSun className="h-5 w-5" /> : <FaMoon className="h-5 w-5" />}
            </div>
          </button>

          <button 
            onClick={toggleLanguage}
            className="p-2 mr-2 rounded-md focus:outline-none focus:ring-2 focus:ring-white text-white"
            aria-label="Toggle Language"
          >
            <div className="flex items-center">
              <FaGlobe className="h-5 w-5 mr-1" />
              <span className="text-sm font-medium">{language === 'pt-BR' ? 'PT' : 'EN'}</span>
            </div>
          </button>
          
          <button 
            onClick={toggleMenu}
            className="p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-white"
          >
            {isMenuOpen ? (
              <FaTimes className="h-6 w-6" />
            ) : (
              <FaBars className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center">
          <ul className="flex space-x-6 transition-colors duration-200 mr-4">
            <NavItem to="/" icon={<FaHome />} label={translate('dashboard')} />
            <NavItem to="/bills" icon={<FaBook />} label={translate('bills_library')} />
            <NavItem to="/admin" icon={<FaUserShield />} label={translate('admin')} />
          </ul>

          {/* Theme Toggle Button */}
          <motion.button
            onClick={toggleTheme}
            className="flex items-center space-x-1 px-3 py-2 mr-3 bg-white bg-opacity-20 rounded-md hover:bg-opacity-30 transition-colors duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDark ? (
              <>
                <FaSun className="h-4 w-4" />
                <span className="text-sm font-medium">{translate('light_mode')}</span>
              </>
            ) : (
              <>
                <FaMoon className="h-4 w-4" />
                <span className="text-sm font-medium">{translate('dark_mode')}</span>
              </>
            )}
          </motion.button>

          {/* Language Toggle Button */}
          <motion.button
            onClick={toggleLanguage}
            className="flex items-center space-x-1 px-3 py-2 bg-white bg-opacity-20 rounded-md hover:bg-opacity-30 transition-colors duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaGlobe className="h-4 w-4" />
            <span className="text-sm font-medium">{language === 'pt-BR' ? 'PT-BR' : 'EN'}</span>
          </motion.button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden"
          >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-primary-light dark:border-gray-600">
              <MobileNavItem to="/" icon={<FaHome />} label={translate('dashboard')} onClick={toggleMenu} />
              <MobileNavItem to="/bills" icon={<FaBook />} label={translate('bills_library')} onClick={toggleMenu} />
              <MobileNavItem to="/admin" icon={<FaUserShield />} label={translate('admin')} onClick={toggleMenu} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

// Desktop Navigation Item
const NavItem = ({ to, icon, label }: { to: string, icon: React.ReactNode, label: string }) => (
  <motion.li whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center space-x-2 px-4 py-2 rounded transition-colors duration-200 ${
          isActive 
            ? 'bg-accent text-white font-bold shadow-md' 
            : 'hover:bg-primary-hover text-white hover:text-white'
        }`
      }
    >
      <span className="text-lg">{icon}</span>
      <span>{label}</span>
    </NavLink>
  </motion.li>
);

// Mobile Navigation Item
const MobileNavItem = ({ to, icon, label, onClick }: { to: string, icon: React.ReactNode, label: string, onClick: () => void }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `block flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
        isActive 
          ? 'bg-accent text-white' 
          : 'text-white hover:bg-primary-hover'
      }`
    }
    onClick={onClick}
  >
    <span className="text-lg">{icon}</span>
    <span>{label}</span>
  </NavLink>
);

export default Navigation;
