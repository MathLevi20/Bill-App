import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Client, CreateBillDto } from '../types';
import { getClients, createBill } from '../services/api';

interface ManualBillFormProps {
  onSuccess?: () => void;
}

const ManualBillForm: React.FC<ManualBillFormProps> = ({ onSuccess }) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<CreateBillDto>({
    clientId: 0,
    referenceMonth: '',
    referenceYear: new Date().getFullYear(),
    energyElectricKwh: 0,
    energyElectricValue: 0,
    energySCEEEKwh: 0,
    energySCEEEValue: 0,
    energyCompensatedKwh: 0,
    energyCompensatedValue: 0,
    publicLightingValue: 0,
  });

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const clientsData = await getClients();
      setClients(clientsData);
      if (clientsData.length > 0 && clientsData[0].id) {
        setFormData(prev => ({ ...prev, clientId: Number(clientsData[0].id) }));
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
      setError('Failed to load clients. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Convert numeric fields to numbers
    if ([
      'clientId', 
      'referenceYear', 
      'energyElectricKwh', 
      'energyElectricValue',
      'energySCEEEKwh',
      'energySCEEEValue',
      'energyCompensatedKwh',
      'energyCompensatedValue',
      'publicLightingValue'
    ].includes(name)) {
      setFormData(prev => ({ ...prev, [name]: Number(value) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const validateForm = (): boolean => {
    if (!formData.clientId) {
      setError('Please select a client');
      return false;
    }
    
    if (!formData.referenceMonth) {
      setError('Please select a reference month');
      return false;
    }
    
    // Add other validations as needed
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setError(null);
    setSuccess(null);
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setSubmitLoading(true);
      await createBill(formData);
      setSuccess('Bill created successfully!');
      
      // Reset form data
      setFormData({
        clientId: Number(clients[0]?.id) || 0,
        referenceMonth: '',
        referenceYear: new Date().getFullYear(),
        energyElectricKwh: 0,
        energyElectricValue: 0,
        energySCEEEKwh: 0,
        energySCEEEValue: 0,
        energyCompensatedKwh: 0,
        energyCompensatedValue: 0,
        publicLightingValue: 0,
      });
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error creating bill:', error);
      setError('Failed to create bill. Please try again.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  return (
    <motion.div 
      className="bg-white rounded-lg shadow-md p-4 md:p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h3 className="text-lg font-medium text-primary-dark mb-4">Manual Bill Entry</h3>
      
      {loading ? (
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          <span className="ml-2 text-primary-dark">Loading clients...</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="clientId" className="block text-sm font-medium text-primary-dark">
              Client
            </label>
            <select
              id="clientId"
              name="clientId"
              value={formData.clientId}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            >
              <option value="">-- Select a client --</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>
                  {client.name} (#{client.clientNumber})
                </option>
              ))}
            </select>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="referenceMonth" className="block text-sm font-medium text-primary-dark">
                Reference Month
              </label>
              <select
                id="referenceMonth"
                name="referenceMonth"
                value={formData.referenceMonth}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option value="">-- Select a month --</option>
                {months.map(month => (
                  <option key={month} value={month}>
                    {month}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="referenceYear" className="block text-sm font-medium text-primary-dark">
                Reference Year
              </label>
              <input
                type="number"
                id="referenceYear"
                name="referenceYear"
                value={formData.referenceYear}
                onChange={handleChange}
                min={2000}
                max={2100}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="energyElectricKwh" className="block text-sm font-medium text-primary-dark">
                Energy Electric (kWh)
              </label>
              <input
                type="number"
                id="energyElectricKwh"
                name="energyElectricKwh"
                value={formData.energyElectricKwh}
                onChange={handleChange}
                min={0}
                step={0.01}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="energyElectricValue" className="block text-sm font-medium text-primary-dark">
                Energy Electric Value (R$)
              </label>
              <input
                type="number"
                id="energyElectricValue"
                name="energyElectricValue"
                value={formData.energyElectricValue}
                onChange={handleChange}
                min={0}
                step={0.01}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="energySCEEEKwh" className="block text-sm font-medium text-primary-dark">
                Energy SCEEE (kWh)
              </label>
              <input
                type="number"
                id="energySCEEEKwh"
                name="energySCEEEKwh"
                value={formData.energySCEEEKwh}
                onChange={handleChange}
                min={0}
                step={0.01}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="energySCEEEValue" className="block text-sm font-medium text-primary-dark">
                Energy SCEEE Value (R$)
              </label>
              <input
                type="number"
                id="energySCEEEValue"
                name="energySCEEEValue"
                value={formData.energySCEEEValue}
                onChange={handleChange}
                min={0}
                step={0.01}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="energyCompensatedKwh" className="block text-sm font-medium text-primary-dark">
                Energy Compensated (kWh)
              </label>
              <input
                type="number"
                id="energyCompensatedKwh"
                name="energyCompensatedKwh"
                value={formData.energyCompensatedKwh}
                onChange={handleChange}
                min={0}
                step={0.01}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="energyCompensatedValue" className="block text-sm font-medium text-primary-dark">
                Energy Compensated Value (R$)
              </label>
              <input
                type="number"
                id="energyCompensatedValue"
                name="energyCompensatedValue"
                value={formData.energyCompensatedValue}
                onChange={handleChange}
                min={0}
                step={0.01}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="publicLightingValue" className="block text-sm font-medium text-primary-dark">
                Public Lighting Value (R$)
              </label>
              <input
                type="number"
                id="publicLightingValue"
                name="publicLightingValue"
                value={formData.publicLightingValue}
                onChange={handleChange}
                min={0}
                step={0.01}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>
          </div>
          
          {error && (
            <div className="bg-red-50 border border-error-red text-error-red px-4 py-3 rounded relative">
              {error}
            </div>
          )}
          
          {success && (
            <div className="bg-green-50 border border-accent text-accent px-4 py-3 rounded relative">
              {success}
            </div>
          )}
          
          <div className="flex justify-end mt-4">
            <motion.button
              type="submit"
              disabled={submitLoading}
              className={`px-4 py-2 rounded-md shadow-sm font-medium text-white ${
                submitLoading ? 'bg-gray-400' : 'bg-primary hover:bg-primary-dark'
              }`}
              whileHover={submitLoading ? {} : { scale: 1.03 }}
              whileTap={submitLoading ? {} : { scale: 0.98 }}
            >
              {submitLoading ? (
                <>
                  <span>Creating...</span>
                  <span className="ml-2 inline-block h-4 w-4 rounded-full border-2 border-t-transparent border-white animate-spin"></span>
                </>
              ) : (
                'Create Bill'
              )}
            </motion.button>
          </div>
        </form>
      )}
    </motion.div>
  );
};

export default ManualBillForm;
