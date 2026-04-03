import React, { useState } from 'react';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/flatpickr.min.css';

const FilterSection = ({
  filters,
  onFilterChange,
  onApplyFilters,
  onResetFilters,
  isOpen,
  onToggle,
}) => {
  const [tempDateRange, setTempDateRange] = useState([
    filters.startDate ? new Date(filters.startDate) : null,
    filters.endDate ? new Date(filters.endDate) : null,
  ]);
  const handleDateChange = (dates) => {
    setTempDateRange(dates);
  };

  const handleApply = () => {
    // Format dates to YYYY-MM-DDT00:00:00 and YYYY-MM-DDT23:59:59
    const startDate = tempDateRange[0]
      ? `${tempDateRange[0].toISOString().split('T')[0]}T00:00:00`
      : null;
    const endDate = tempDateRange[1]
      ? `${tempDateRange[1].toISOString().split('T')[0]}T23:59:59`
      : null;

    onFilterChange('startDate', startDate);
    onFilterChange('endDate', endDate);
    onApplyFilters();
  };

  const handleReset = () => {
    setTempDateRange([null, null]);
    onResetFilters();
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full p-5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 motion-fast border-b border-slate-200 dark:border-slate-700"
      >
        <div className="flex items-center gap-3">
          <i className="fas fa-filter text-purple-600 dark:text-purple-400"></i>
          Filters
          {(filters.reviewLength || filters.regenerated || filters.keyPoints || filters.search || filters.startDate || filters.endDate) && (
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-purple-600 text-white text-xs font-bold">
              {[filters.reviewLength, filters.regenerated, filters.keyPoints, filters.search, filters.startDate, filters.endDate].filter(Boolean).length}
            </span>
          )}
        </div>
        <i
          className={`fas fa-chevron-down text-slate-500 dark:text-slate-400 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        ></i>
      </button>

      {isOpen && (
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Review Length Filter */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Review Length
              </label>
              <select
                value={filters.reviewLength || ''}
                onChange={(e) => onFilterChange('reviewLength', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
              >
                <option value="">All Lengths</option>
                <option value="short">Short</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>
            </div>

            {/* Regenerated Filter */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Regenerated
              </label>
              <select
                value={filters.regenerated || ''}
                onChange={(e) => onFilterChange('regenerated', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
              >
                <option value="">All Lengths</option>
                <option value="short">Short</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>
            </div>

            {/* Key Points Filter */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Key Points Status
              </label>
              <select
                value={filters.keyPoints || ''}
                onChange={(e) => onFilterChange('keyPoints', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
              >
                <option value="">All</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>

            {/* Date Range Filter */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Date Range
              </label>
              <Flatpickr
                data-enable-time={false}
                value={tempDateRange}
                onChange={handleDateChange}
                options={{
                  mode: 'range',
                  dateFormat: 'Y-m-d',
                  maxDate: 'today',
                }}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
                placeholder="Select date range"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={handleApply}
              className="flex-1 px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-purple-500/25 transition-all active:scale-95"
            >
              <i className="fas fa-search mr-2"></i>
              Apply Filters
            </button>
            <button
              onClick={handleReset}
              className="px-6 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-all"
            >
              <i className="fas fa-rotate-left mr-2"></i>
              Reset
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterSection;
