import React from 'react';
import { Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

const DNARadarChart = ({ scores }) => {
  // scores = { strength, balance, mobility, endurance, coordination, consistency, recovery }
  
  const data = {
    labels: ['Strength', 'Balance', 'Mobility', 'Endurance', 'Coordination', 'Consistency', 'Recovery'],
    datasets: [
      {
        label: 'Your Fitness DNA',
        data: [
          scores.strength || 0,
          scores.balance || 0,
          scores.mobility || 0,
          scores.endurance || 0,
          scores.coordination || 0,
          scores.consistency || 0,
          scores.recovery || 0,
        ],
        backgroundColor: 'rgba(241, 83, 119, 0.4)', // #f15377 with opacity
        borderColor: '#f15377',
        pointBackgroundColor: '#ffffff',
        pointBorderColor: '#f15377',
        pointHoverBackgroundColor: '#f15377',
        pointHoverBorderColor: '#ffffff',
        borderWidth: 2,
      },
    ],
  };

  const options = {
    scales: {
      r: {
        angleLines: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        pointLabels: {
          color: 'rgba(255, 255, 255, 0.7)',
          font: {
            size: 14,
            family: 'Inter, sans-serif'
          }
        },
        ticks: {
          display: false, // hide the numbers (0, 20, 40) on the axes
          min: 0,
          max: 100,
          stepSize: 20
        },
      },
    },
    plugins: {
      legend: {
        display: false, // Custom legend below if needed
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#f15377',
        bodyFont: {
          size: 14,
        },
        padding: 12,
        cornerRadius: 8,
        displayColors: false,
      }
    },
    maintainAspectRatio: false,
  };

  return (
    <div className="w-full h-full min-h-[300px]">
      <Radar data={data} options={options} />
    </div>
  );
};

export default DNARadarChart;
