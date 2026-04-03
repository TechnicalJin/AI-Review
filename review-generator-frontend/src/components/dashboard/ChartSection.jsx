import React, { useEffect, useRef, useState } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Chart } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

const calculateStepSize = (maxValue) => {
  if (maxValue <= 0) return { stepSize: 1, suggestedMax: 5 };

  const rawStep = maxValue / 5;
  const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)));
  let stepSize = Math.ceil(rawStep / magnitude) * magnitude;

  if (maxValue < 10) {
    stepSize = 1;
  } else if (maxValue < 50) {
    stepSize = Math.ceil(rawStep / 2) * 2;
  } else if (maxValue < 100) {
    stepSize = 10;
  } else if (maxValue < 500) {
    stepSize = 50;
  } else {
    stepSize = 100;
  }

  const suggestedMax = Math.ceil(maxValue / stepSize) * stepSize + stepSize;
  return { stepSize, suggestedMax };
};

const ChartSection = ({ weeklyData, monthlyData, isDark, currentView, onViewChange }) => {
  const chartRef = useRef(null);

  const weeklyLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  // Extract values from weeklyData object
  const weeklyValues = Object.values(weeklyData).map(d => d.count);
  
  // Extract values from monthlyData for current month (last 15 days or weekly view)
  const monthlyDates = Object.keys(monthlyData).sort();
  let monthlyValues = [];
  let monthlyLabels = [];

  if (monthlyDates.length > 0) {
    // Group by week if more than 15 days
    if (monthlyDates.length > 15) {
      const weeklyGrouped = {};
      let currentWeek = 1;
      
      monthlyDates.forEach((dateKey, index) => {
        const date = new Date(dateKey);
        const weekDay = date.getDay();
        if (weekDay === 0 || index === 0) {
          if (index > 0) currentWeek++;
        }
        
        const weekLabel = `Week ${currentWeek}`;
        weeklyGrouped[weekLabel] = (weeklyGrouped[weekLabel] || 0) + monthlyData[dateKey].count;
      });
      
      Object.entries(weeklyGrouped).forEach(([label, value]) => {
        monthlyLabels.push(label);
        monthlyValues.push(value);
      });
    } else {
      // Show daily view for last 15 days
      const recentDates = monthlyDates.slice(-15);
      recentDates.forEach(dateKey => {
        monthlyLabels.push(`${monthlyData[dateKey].day}`);
        monthlyValues.push(monthlyData[dateKey].count);
      });
    }
  }

  const isWeeklyView = currentView === 'weekly';
  const dataToUse = isWeeklyView ? weeklyValues : monthlyValues;
  const labelsToUse = isWeeklyView ? weeklyLabels : monthlyLabels;
  const maxValue = Math.max(...dataToUse, 1);
  const { stepSize, suggestedMax } = calculateStepSize(maxValue);

  const textColor = isDark ? '#f9fafb' : '#1f2937';
  const gridColor = isDark ? '#374151' : '#e5e7eb';

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 500,
      easing: 'easeOutQuad',
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          title: function(context) {
            return context[0].label;
          },
          label: function(context) {
            return `Reviews: ${context.parsed.y}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        suggestedMax: suggestedMax,
        ticks: {
          color: textColor,
          stepSize: stepSize,
          callback: function(value) {
            return Number.isInteger(value) ? value : '';
          }
        },
        grid: {
          color: gridColor
        }
      },
      x: {
        ticks: {
          color: textColor
        },
        grid: {
          color: gridColor
        }
      }
    }
  };

  const weeklyChartData = {
    labels: labelsToUse,
    datasets: [{
      label: 'Daily Reviews',
      data: dataToUse,
      borderColor: '#6366f1',
      backgroundColor: 'rgba(99, 102, 241, 0.1)',
      borderWidth: 3,
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#6366f1',
      pointBorderColor: '#ffffff',
      pointBorderWidth: 2,
      pointRadius: 6,
      pointHoverRadius: 8
    }]
  };

  const monthlyChartData = {
    labels: labelsToUse,
    datasets: [{
      label: 'Daily Reviews',
      data: dataToUse,
      backgroundColor: 'rgba(99, 102, 241, 0.6)',
      borderColor: '#6366f1',
      borderWidth: 2,
      borderRadius: 8,
      borderSkipped: false
    }]
  };

  const chartData = isWeeklyView ? weeklyChartData : monthlyChartData;
  const chartType = isWeeklyView ? 'line' : 'bar';

  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-2xl p-5">
      <div className="flex justify-between items-center mb-5">
        <h3 className="text-lg font-semibold dark:text-white">
          {isWeeklyView ? "This Week's Review Generation" : "This Month's Review Generation"}
        </h3>
        <div className="flex space-x-2">
          <button
            onClick={() => onViewChange('weekly')}
            className={`px-3 py-1 text-sm rounded-lg transition-colors ${
              isWeeklyView
                ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400'
                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            This Week
          </button>
          <button
            onClick={() => onViewChange('monthly')}
            className={`px-3 py-1 text-sm rounded-lg transition-colors ${
              !isWeeklyView
                ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400'
                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            This Month
          </button>
        </div>
      </div>
      <div className="chart-container" style={{ height: '300px', width: '100%' }}>
        <Chart
          ref={chartRef}
          type={chartType}
          data={chartData}
          options={commonOptions}
        />
      </div>
    </div>
  );
};

export default ChartSection;
