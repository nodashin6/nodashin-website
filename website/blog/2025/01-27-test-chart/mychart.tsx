import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, LinearScale, CategoryScale, LineElement, PointElement, ChartData, ChartOptions } from 'chart.js';

ChartJS.register(LinearScale, CategoryScale, LineElement, PointElement);

const data: ChartData<'line'> = {
  labels: ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul'],
  datasets: [
    {
      label: 'normal',
      data: [0, 40, 70, 80, 90, 95, 100],
      borderColor: 'rgba(75,192,192,1)',
      fill: false,
    },
    {
      label: 'ideal',
      data: [0, 10, 70, 90, 100, 105, 107],
      borderColor: 'rgba(153,102,255,1)',
      fill: false,
    },
  ],
};

const options: ChartOptions<'line'> = {
  scales: {
    y: {
      beginAtZero: true,
      max: 110,
      title: {
        display: true,
        text: 'output (%)',
      },
    },
    x: {
      title: {
        display: true,
        text: 'month',
      },
    },
  },
  plugins: {
    legend: {
      display: true,
      position: 'top',
      labels: {
        color: 'black', // Ensure the legend text color is visible
      },
    },
  },
};

export default function MyChart(): JSX.Element {
  return <Line data={data} options={options} />;
}
