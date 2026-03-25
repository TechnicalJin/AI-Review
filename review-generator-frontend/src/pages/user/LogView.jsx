import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import APIService from '../../services/APIService';
import { Input, Select } from '../../components/form';
import { FormGrid, FormField } from '../../components/layout';

const LogView = () => {
  // Logs data and pagination
  const [logs, setLogs] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filters, setFilters] = useState({
    search: '',
    company: '',
    reviewLength: '',
    regenerated: '',
    keyPoints: '',
    startDate: '',
    endDate: '',
  });
  const [showFilters, setShowFilters] = useState(false);

  // Distinct companies for filter dropdown
  const [distinctCompanies, setDistinctCompanies] = useState([]);

  useEffect(() => {
    fetchDistinctCompanies();
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [currentPage, pageSize]);

  const fetchDistinctCompanies = async () => {
    try {
      const companies = await APIService.getDistinctCompanies();
      setDistinctCompanies(companies || []);
    } catch (error) {
      console.error('Error fetching companies:', error);
    }
  };

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        size: pageSize,
      };

      // Add filters
      if (filters.search) params.search = filters.search;
      if (filters.company) params.company = filters.company;
      if (filters.reviewLength) params.reviewLength = filters.reviewLength;
      if (filters.regenerated) params.regenerated = filters.regenerated;
      if (filters.keyPoints) params.keyPoints = filters.keyPoints;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;

      const data = await APIService.getLogs(params);

      setLogs(data.content || []);
      setTotalElements(data.totalElements || 0);
      setTotalPages(data.totalPages || 0);
    } catch (error) {
      console.error('Error fetching logs:', error);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const applyFilters = () => {
    setCurrentPage(0);
    fetchLogs();
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      company: '',
      reviewLength: '',
      regenerated: '',
      keyPoints: '',
      startDate: '',
      endDate: '',
    });
    setCurrentPage(0);
    setTimeout(() => fetchLogs(), 0);
  };

  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      applyFilters();
    }
  };

  const updatePageSize = (newSize) => {
    setPageSize(newSize);
    setCurrentPage(0);
  };

  // Pagination helpers
  const generatePageNumbers = useCallback(() => {
    const pages = [];
    const maxPagesToShow = 7;

    let startPage = Math.max(0, currentPage - 3);
    let endPage = Math.min(totalPages - 1, currentPage + 3);

    if (endPage - startPage < maxPagesToShow - 1) {
      if (startPage === 0) {
        endPage = Math.min(totalPages - 1, maxPagesToShow - 1);
      } else if (endPage === totalPages - 1) {
        startPage = Math.max(0, totalPages - maxPagesToShow);
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return { pages, startPage, endPage };
  }, [currentPage, totalPages]);

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    try {
      const date = new Date(timestamp);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return timestamp;
    }
  };

  const { pages, startPage, endPage } = generatePageNumbers();

  const activeFiltersCount = Object.values(filters).filter(v => v !== '').length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Background Pattern */}
      <div className="absolute inset-0 gradient-mesh opacity-50 pointer-events-none"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <i className="fas fa-clock-rotate-left text-white text-xl"></i>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                  Review History
                </h1>
                <p className="text-slate-500 dark:text-slate-400">
                  Track and manage all review generation logs
                </p>
              </div>
            </div>
            <Link
              to="/user/home"
              className="btn btn-md btn-secondary self-start lg:self-center"
            >
              <i className="fas fa-arrow-left"></i>
              Back to Dashboard
            </Link>
          </div>
        </div>

        {/* Filter Section */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 mb-6 overflow-hidden">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="w-full p-5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 motion-fast"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                <i className="fas fa-filter text-indigo-600 dark:text-indigo-400"></i>
              </div>
              <div className="text-left">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Filters</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {activeFiltersCount > 0 ? `${activeFiltersCount} filter${activeFiltersCount > 1 ? 's' : ''} active` : 'No filters applied'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {activeFiltersCount > 0 && (
                <span className="badge badge-primary">{activeFiltersCount}</span>
              )}
              <i className={`fas fa-chevron-${showFilters ? 'up' : 'down'} text-slate-400 motion-fast`}></i>
            </div>
          </button>

          {showFilters && (
            <div className="p-6 border-t border-slate-200 dark:border-slate-700 space-y-6 fade-in">
              <FormGrid className="lg:grid-cols-3">
                {/* Company Filter */}
                <Select
                  name="company"
                  value={filters.company}
                  onChange={handleFilterChange}
                  options={[
                    { value: '', label: 'All Companies' },
                    ...distinctCompanies.map(company => ({ value: company, label: company }))
                  ]}
                  label="Company"
                />

                {/* Review Length */}
                <Select
                  name="reviewLength"
                  value={filters.reviewLength}
                  onChange={handleFilterChange}
                  options={[
                    { value: '', label: 'All Lengths' },
                    { value: 'short', label: 'Short' },
                    { value: 'medium', label: 'Medium' },
                    { value: 'large', label: 'Large' }
                  ]}
                  label="Review Length"
                />

                {/* Regenerated */}
                <Select
                  name="regenerated"
                  value={filters.regenerated}
                  onChange={handleFilterChange}
                  options={[
                    { value: '', label: 'All' },
                    { value: 'yes', label: 'Yes' },
                    { value: 'no', label: 'No' }
                  ]}
                  label="Regenerated"
                />

                {/* Key Points */}
                <Input
                  type="text"
                  name="keyPoints"
                  value={filters.keyPoints}
                  onChange={handleFilterChange}
                  placeholder="Search key points..."
                  label="Key Points"
                  icon="fas fa-search"
                />

                {/* Date Range */}
                <FormField fullWidth>
                  <div className="form-group">
                    <label className="form-label">Date Range</label>
                    <div className="flex gap-3 items-center">
                      <Input
                        type="date"
                        value={filters.startDate}
                        onChange={(e) => handleDateChange('startDate', e.target.value)}
                        className="flex-1"
                      />
                      <span className="text-slate-400 font-medium">to</span>
                      <Input
                        type="date"
                        value={filters.endDate}
                        onChange={(e) => handleDateChange('endDate', e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>
                </FormField>
              </FormGrid>

              {/* Filter Actions */}
              <div className="btn-group pt-2">
                <button onClick={applyFilters} className="btn btn-md btn-primary">
                  <i className="fas fa-check"></i>
                  Apply Filters
                </button>
                <button onClick={resetFilters} className="btn btn-md btn-secondary">
                  <i className="fas fa-rotate-left"></i>
                  Reset
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Controls Section */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-5 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <label className="text-slate-600 dark:text-slate-400 font-medium text-sm">
                Show
              </label>
              <Select
                value={pageSize.toString()}
                onChange={(e) => updatePageSize(Number(e.target.value))}
                options={[
                  { value: '10', label: '10' },
                  { value: '25', label: '25' },
                  { value: '50', label: '50' }
                ]}
                className="w-20"
              />
              <span className="text-slate-600 dark:text-slate-400 font-medium text-sm">
                entries
              </span>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Input
                type="text"
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                onKeyPress={handleSearch}
                placeholder="Search logs..."
                icon="fas fa-search"
                className="flex-1 sm:w-72"
              />
              <button onClick={applyFilters} className="btn btn-md btn-primary">
                <i className="fas fa-search"></i>
              </button>
            </div>
          </div>
        </div>

        {/* Results Info */}
        {totalElements > 0 && (
          <div className="mb-4 flex items-center justify-between">
            <p className="text-slate-600 dark:text-slate-400">
              Showing <span className="font-semibold text-slate-900 dark:text-white">{logs.length}</span> of{' '}
              <span className="font-semibold text-slate-900 dark:text-white">{totalElements}</span> logs
            </p>
          </div>
        )}

        {/* Table */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          {loading ? (
            <div className="p-12">
              <div className="flex flex-col items-center justify-center">
                <div className="w-12 h-12 border-4 border-indigo-200 dark:border-indigo-900 border-t-indigo-600 rounded-full spin mb-4"></div>
                <p className="text-slate-500 dark:text-slate-400">Loading logs...</p>
              </div>
            </div>
          ) : logs.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="px-5 py-4 text-left text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-5 py-4 text-left text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                      Company
                    </th>
                    <th className="px-5 py-4 text-left text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                      Timestamp
                    </th>
                    <th className="px-5 py-4 text-left text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                      Length
                    </th>
                    <th className="px-5 py-4 text-left text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                      Key Points
                    </th>
                    <th className="px-5 py-4 text-left text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                      Regenerated
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {logs.map((log, index) => (
                    <tr
                      key={log.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-700/50 motion-fast fade-in"
                      style={{ animationDelay: `${index * 30}ms` }}
                    >
                      <td className="px-5 py-4 text-sm font-semibold text-slate-900 dark:text-white">
                        #{log.id}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                            {log.companyName?.[0]?.toUpperCase() || 'C'}
                          </div>
                          <span className="text-sm font-medium text-slate-900 dark:text-white">
                            {log.companyName}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-400">
                        {formatTimestamp(log.timestamp)}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`badge ${
                            log.reviewLength === 'short'
                              ? 'badge-primary'
                              : log.reviewLength === 'medium'
                              ? 'badge-success'
                              : 'badge-warning'
                          }`}
                        >
                          {log.reviewLength}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-400 max-w-xs">
                        <div className="truncate" title={log.keyPoints}>
                          {log.keyPoints || '-'}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        {log.regenerated === 'yes' ? (
                          <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold text-sm">
                            <i className="fas fa-check-circle"></i>
                            Yes
                          </span>
                        ) : (
                          <span className="text-slate-400 text-sm">No</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12">
              <div className="empty-state">
                <div className="empty-state-icon">
                  <i className="fas fa-search"></i>
                </div>
                <h3 className="empty-state-title">No Logs Found</h3>
                <p className="empty-state-description">
                  No logs match your current filters. Try adjusting your search criteria.
                </p>
                <button onClick={resetFilters} className="btn btn-md btn-secondary">
                  <i className="fas fa-rotate-left"></i>
                  Clear Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2 flex-wrap justify-center">
              {/* First & Previous */}
              {currentPage > 0 && (
                <>
                  <button
                    onClick={() => setCurrentPage(0)}
                    className="w-10 h-10 flex items-center justify-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 motion-fast"
                    title="First Page"
                  >
                    <i className="fas fa-angles-left text-sm"></i>
                  </button>
                  <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    className="w-10 h-10 flex items-center justify-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 motion-fast"
                    title="Previous Page"
                  >
                    <i className="fas fa-angle-left text-sm"></i>
                  </button>
                </>
              )}

              {/* First page if not in range */}
              {startPage > 0 && (
                <>
                  <button
                    onClick={() => setCurrentPage(0)}
                    className="w-10 h-10 flex items-center justify-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 motion-fast font-semibold"
                  >
                    1
                  </button>
                  {startPage > 1 && (
                    <span className="px-2 text-slate-400">...</span>
                  )}
                </>
              )}

              {/* Page numbers */}
              {pages.map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-10 h-10 flex items-center justify-center rounded-xl font-semibold motion-normal ${
                    page === currentPage
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25'
                      : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  {page + 1}
                </button>
              ))}

              {/* Last page if not in range */}
              {endPage < totalPages - 1 && (
                <>
                  {endPage < totalPages - 2 && (
                    <span className="px-2 text-slate-400">...</span>
                  )}
                  <button
                    onClick={() => setCurrentPage(totalPages - 1)}
                    className="w-10 h-10 flex items-center justify-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 motion-fast font-semibold"
                  >
                    {totalPages}
                  </button>
                </>
              )}

              {/* Next & Last */}
              {currentPage < totalPages - 1 && (
                <>
                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    className="w-10 h-10 flex items-center justify-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 motion-fast"
                    title="Next Page"
                  >
                    <i className="fas fa-angle-right text-sm"></i>
                  </button>
                  <button
                    onClick={() => setCurrentPage(totalPages - 1)}
                    className="w-10 h-10 flex items-center justify-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 motion-fast"
                    title="Last Page"
                  >
                    <i className="fas fa-angles-right text-sm"></i>
                  </button>
                </>
              )}
            </div>

            <div className="text-slate-600 dark:text-slate-400 text-sm font-medium">
              Page <span className="text-slate-900 dark:text-white">{currentPage + 1}</span> of{' '}
              <span className="text-slate-900 dark:text-white">{totalPages}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LogView;


