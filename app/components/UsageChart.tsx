'use client';

import { Box } from '@chakra-ui/react';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend,
  BarElement
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { Customer } from '../models/Customer';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface UsageChartProps {
  customer: Customer;
}

const UsageChart: React.FC<UsageChartProps> = ({ customer }) => {
  // Extract data from customer
  const dataHistory = customer.usage.dataUsage.history;
  const callHistory = customer.usage.callUsage.history;
  const textHistory = customer.usage.textUsage.history;
  
  // Reverse the arrays to show oldest to newest (left to right)
  const months = [...dataHistory].reverse().map(item => item.month);
  
  // Prepare data for the chart
  const chartData = {
    labels: months,
    datasets: [
      {
        label: 'Veri Kullanımı (GB)',
        data: [...dataHistory].reverse().map(item => item.usage),
        borderColor: 'rgba(53, 162, 235, 1)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
        tension: 0.3,
      },
      {
        label: 'Arama Dakikaları (% limit)',
        data: [...callHistory].reverse().map(item => (item.usage / customer.usage.callUsage.limit) * 100),
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        tension: 0.3,
      },
      {
        label: 'Mesajlar (% limit)',
        data: [...textHistory].reverse().map(item => (item.usage / customer.usage.textUsage.limit) * 100),
        borderColor: 'rgba(255, 99, 132, 1)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        tension: 0.3,
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
        display: true,
        text: 'Kullanım Geçmişi',
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              if (context.datasetIndex === 0) {
                label += context.parsed.y.toFixed(2) + ' GB';
              } else {
                label += context.parsed.y.toFixed(2) + '%';
              }
            }
            return label;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Kullanım',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Ay',
        },
      },
    },
  };
  
  return (
    <Box height="400px">
      <Line data={chartData} options={options} />
    </Box>
  );
};

export default UsageChart; 