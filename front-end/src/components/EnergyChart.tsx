import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import styled from 'styled-components';
import { Bill } from '../types/index';
import { FaBolt } from 'react-icons/fa';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const ChartContainer = styled.div`
  background-color: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 1.5rem;
`;

const ChartTitle = styled.h3`
  margin-top: 0;
  color: #333;
  margin-bottom: 1rem;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: #666;
  font-style: italic;
`;

interface EnergyChartProps {
  bills: Bill[];
  title: string;
}

const EnergyChart: React.FC<EnergyChartProps> = ({ bills, title }) => {
  // Sort bills by reference date
  const sortedBills = [...bills].sort((a, b) => {
    const dateA = new Date(a.referenceYear, getMonthIndex(a.referenceMonth));
    const dateB = new Date(b.referenceYear, getMonthIndex(b.referenceMonth));
    return dateA.getTime() - dateB.getTime();
  });
  
  // Process data for the chart
  const labels = sortedBills.map(bill => 
    `${bill.referenceMonth.substring(0, 3)}/${bill.referenceYear}`
  );
  
  const data = {
    labels,
    datasets: [
      {
        label: 'Energy Consumption (kWh)',
        data: sortedBills.map(bill => bill.totalEnergyConsumption),
        backgroundColor: 'rgba(26, 115, 232, 0.7)',
        borderColor: 'rgba(26, 115, 232, 1)',
        borderWidth: 1,
      },
      {
        label: 'Energy Compensated (kWh)',
        data: sortedBills.map(bill => bill.energyCompensatedKwh),
        backgroundColor: 'rgba(52, 168, 83, 0.7)',
        borderColor: 'rgba(52, 168, 83, 1)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'kWh',
        },
      },
    },
  };

  return (
    <ChartContainer>
      <ChartTitle>
        <FaBolt className="inline-block mr-2 text-primary" /> {title}
      </ChartTitle>
      {bills.length === 0 ? (
        <EmptyState>No data available</EmptyState>
      ) : (
        <Bar data={data} options={options} />
      )}
    </ChartContainer>
  );
};

// Helper function to convert month name to index
const getMonthIndex = (monthName: string): number => {
  const months: Record<string, number> = {
    'Janeiro': 0,
    'Fevereiro': 1,
    'Março': 2,
    'Abril': 3,
    'Maio': 4,
    'Junho': 5,
    'Julho': 6,
    'Agosto': 7,
    'Setembro': 8,
    'Outubro': 9,
    'Novembro': 10,
    'Dezembro': 11,
    // English month names for fallback
    'January': 0,
    'February': 1,
    'March': 2,
    'April': 3,
    'May': 4,
    'June': 5,
    'July': 6,
    'August': 7,
    'September': 8,
    'October': 9,
    'November': 10,
    'December': 11,
  };
  
  return months[monthName] || 0;
};

export default EnergyChart;
