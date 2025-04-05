import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { FaHome, FaBook, FaUserShield, FaBars, FaTimes } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import logo from '../assets/logo.svg';

const Navigation: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <motion.nav 
      className="bg-gradient-to-r from-primary-dark via-primary to-primary-light text-white shadow-lg"
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

        {/* Mobile Menu Button */}
        <div className="md:hidden">
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
        <ul className="hidden md:flex space-x-6 transition-colors duration-200">
          <NavItem to="/" icon={<FaHome />} label="Dashboard" />
          <NavItem to="/bills" icon={<FaBook />} label="Bills Library" />
          <NavItem to="/admin" icon={<FaUserShield />} label="Admin" />
        </ul>
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
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-primary-light ">
              <MobileNavItem to="/" icon={<FaHome />} label="Dashboard" onClick={toggleMenu} />
              <MobileNavItem to="/bills" icon={<FaBook />} label="Bills Library" onClick={toggleMenu} />
              <MobileNavItem to="/admin" icon={<FaUserShield />} label="Admin" onClick={toggleMenu} />
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
