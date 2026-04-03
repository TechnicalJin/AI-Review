import React, { useRef } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Chart } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const DonutChart = ({ stats, isDark }) => {
  const chartRef = useRef(null);

  const data = [
    stats.lengthDistribution.short,
    stats.lengthDistribution.medium,
    stats.lengthDistribution.large
  ];

  const textColor = isDark ? '#f9fafb' : '#1f2937';

  const chartData = {
    labels: ['Short', 'Medium', 'Large'],
    datasets: [{
      data: data,
      backgroundColor: [
        '#f59e0b',
        '#6366f1',
        '#10b981'
      ],
      borderWidth: 0,
      hoverOffset: 4
    }]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 500,
      easing: 'easeOutQuad'
    },
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: textColor,
          padding: 20,
          usePointStyle: true
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = total > 0 ? Math.round((context.parsed / total) * 100) : 0;
            return `${context.label}: ${context.parsed} (${percentage}%)`;
          }
        }
      }
    }
  };

  const totalLengthReviews = stats.lengthDistribution.short + stats.lengthDistribution.medium + stats.lengthDistribution.large;
  const shortPercent = stats.totalReviews > 0 ? Math.round((stats.lengthDistribution.short / stats.totalReviews) * 100) : 0;
  const longPercent = stats.totalReviews > 0 ? Math.round((stats.lengthDistribution.large / stats.totalReviews) * 100) : 0;
  const mostCommonPercent = totalLengthReviews > 0 ? Math.round((Math.max(...Object.values(stats.lengthDistribution)) / totalLengthReviews) * 100) : 0;

  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-2xl p-5 animate-slide-up">
      <h3 className="text-lg font-semibold mb-5 dark:text-white">Review Length Distribution</h3>
      <div className="flex flex-col md:flex-row items-center">
        <div className="w-full md:w-1/2 h-64">
          <Chart
            ref={chartRef}
            type="doughnut"
            data={chartData}
            options={options}
          />
        </div>
        
        <div className="w-full md:w-1/2 mt-4 md:mt-0">
          <div className="grid grid-cols-1 gap-4">
            {/* Most Common */}
            <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
              <p className="text-gray-500 dark:text-gray-400 text-sm">Most Common</p>
              <p className="font-semibold mt-1 dark:text-white">{stats.avgLength}</p>
              <p className="text-indigo-500 flex items-center mt-1 text-sm">
                <i className="fas fa-percentage mr-1 text-xs"></i>
                <span>{mostCommonPercent}% of reviews</span>
              </p>
            </div>

            {/* Short Reviews */}
            <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
              <p className="text-gray-500 dark:text-gray-400 text-sm">Short Reviews</p>
              <p className="font-semibold mt-1 dark:text-white">{stats.lengthDistribution.short}</p>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                {shortPercent}% of total
              </p>
            </div>

            {/* Long Reviews */}
            <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
              <p className="text-gray-500 dark:text-gray-400 text-sm">Long Reviews</p>
              <p className="font-semibold mt-1 dark:text-white">{stats.lengthDistribution.large}</p>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                {longPercent}% of total
              </p>
            </div>

            {/* Regenerated */}
            <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
              <p className="text-gray-500 dark:text-gray-400 text-sm">Regenerated</p>
              <div className="flex items-center mt-1">
                <div className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center">
                  <i className="fas fa-redo text-white text-xs"></i>
                </div>
                <span className="ml-2 text-sm dark:text-white">{stats.regeneratedCount} reviews</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonutChart;
