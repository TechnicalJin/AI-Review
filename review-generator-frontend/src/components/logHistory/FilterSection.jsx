import React from 'react';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/themes/material_blue.css';
import { FiFilter, FiChevronDown, FiCheck, FiRefreshCw } from 'react-icons/fi';

const inputClass =
  'w-full rounded-lg border-2 border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 transition-all duration-200 focus:border-indigo-400 focus:outline-none focus:ring-4 focus:ring-indigo-100';

const FilterSection = ({
  showFilters,
  onToggle,
  filters,
  distinctCompanies,
  onFilterChange,
  onDateRangeChange,
  onApply,
  onReset,
}) => {
  const dateValue =
    filters.startDate && filters.endDate
      ? [filters.startDate, filters.endDate]
      : filters.startDate
      ? [filters.startDate]
      : [];

  return (
    <section className="mb-8 overflow-hidden rounded-xl border border-slate-100 bg-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between border-b border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100 px-8 py-6"
      >
        <h2 className="flex items-center gap-3 text-xl font-bold text-slate-800">
          <FiFilter className="text-indigo-500" />
          Filters
        </h2>
        <FiChevronDown
          className={`text-xl text-indigo-500 transition-transform duration-300 ${showFilters ? 'rotate-180' : ''}`}
        />
      </button>

      {showFilters && (
        <div className="animate-[fadeIn_0.3s_ease-out] p-8">
          <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-5">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Company:</label>
              <select name="company" value={filters.company} onChange={onFilterChange} className={inputClass}>
                <option value="">All Companies</option>
                {distinctCompanies.map((company) => (
                  <option key={company} value={company}>
                    {company}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Review Length:</label>
              <select
                name="reviewLength"
                value={filters.reviewLength}
                onChange={onFilterChange}
                className={inputClass}
              >
                <option value="">All Lengths</option>
                <option value="short">Short</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Regenerated:</label>
              <select
                name="regenerated"
                value={filters.regenerated}
                onChange={onFilterChange}
                className={inputClass}
              >
                <option value="">All</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Key Points:</label>
              <input
                type="text"
                name="keyPoints"
                value={filters.keyPoints}
                onChange={onFilterChange}
                placeholder="Search key points"
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Date Range:</label>
              <Flatpickr
                value={dateValue}
                options={{
                  mode: 'range',
                  dateFormat: 'Y-m-d',
                }}
                onChange={onDateRangeChange}
                className={inputClass}
                placeholder="Select date range"
              />
            </div>
          </div>

          <div className="flex flex-wrap justify-end gap-4">
            <button
              type="button"
              onClick={onApply}
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-400 to-cyan-400 px-6 py-3 font-semibold text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
            >
              <FiCheck />
              Apply Filters
            </button>
            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center gap-2 rounded-lg border-2 border-rose-400 bg-white px-6 py-3 font-semibold text-rose-500 transition-all duration-200 hover:-translate-y-0.5 hover:bg-gradient-to-r hover:from-rose-400 hover:to-amber-300 hover:text-white"
            >
              <FiRefreshCw />
              Reset Filters
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

export default FilterSection;
