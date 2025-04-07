import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { Bill } from '../types';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface LineChartProps {
  bills: Bill[];
  title: string;
  series: {
    key: string;
    label: string;
  }[];
}

const LineChart: React.FC<LineChartProps> = ({ bills, title, series }) => {
  const labels = bills.map(bill => `${bill.referenceMonth}/${bill.referenceYear}`);

  const datasets = series.map((item, index) => ({
    label: item.label,
    data: bills.map(bill => {
      switch (item.key) {
        case 'consumption':
          return bill.totalEnergyConsumption;
        case 'compensation':
          return bill.energyCompensatedKwh;
        case 'withoutGD':
          return bill.totalValueWithoutGD;
        case 'savings':
          return bill.gdSavings;
        default:
          return 0;
      }
    }),
    fill: false,
    borderColor: index === 0 ? '#4F46E5' : '#10B981',
    tension: 0.1
  }));

  const data = {
    labels,
    datasets
  };

  const options = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: title
      },
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <Line data={data} options={options} />
    </div>
  );
};

export default LineChart;
