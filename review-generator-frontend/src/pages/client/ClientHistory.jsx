import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import APIService from '../../services/APIService';
import FilterSection from '../../components/logHistory/FilterSection';
import Table from '../../components/logHistory/Table';
import Pagination from '../../components/logHistory/Pagination';

const ClientHistory = () => {
  const [searchParams] = useSearchParams();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [showFilters, setShowFilters] = useState(false);

  // Initialize filters from URL params
  const [filters, setFilters] = useState({
    reviewLength: searchParams.get('reviewLength') || '',
    regenerated: searchParams.get('regenerated') || '',
    keyPoints: searchParams.get('keyPoints') || '',
    search: searchParams.get('search') || '',
    startDate: searchParams.get('startDate') || '',
    endDate: searchParams.get('endDate') || '',
  });

  // Fetch logs when page, pageSize, or filters change
  useEffect(() => {
    fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, pageSize]);

  // Sync filters to URL
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.reviewLength) params.set('reviewLength', filters.reviewLength);
    if (filters.regenerated) params.set('regenerated', filters.regenerated);
    if (filters.keyPoints) params.set('keyPoints', filters.keyPoints);
    if (filters.search) params.set('search', filters.search);
    if (filters.startDate) params.set('startDate', filters.startDate);
    if (filters.endDate) params.set('endDate', filters.endDate);

    const newUrl = params.toString() ? `?${params.toString()}` : window.location.pathname;
    window.history.replaceState({}, '', newUrl);
  }, [filters]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        size: pageSize,
      };

      // Add active filters to request
      if (filters.search) params.search = filters.search;
      if (filters.reviewLength) params.reviewLength = filters.reviewLength;
      if (filters.regenerated) params.regenerated = filters.regenerated;
      if (filters.keyPoints) params.keyPoints = filters.keyPoints;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;

      const data = await APIService.getClientHistory(params);
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

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleApplyFilters = () => {
    setCurrentPage(0);
    // Auto-open filter section when filters are applied
    if (Object.values(filters).some((v) => v !== '')) {
      setShowFilters(true);
    }
    fetchLogs();
  };

  const handleResetFilters = () => {
    setFilters({
      reviewLength: '',
      regenerated: '',
      keyPoints: '',
      search: '',
      startDate: '',
      endDate: '',
    });
    setCurrentPage(0);
    setShowFilters(false);
    setTimeout(() => fetchLogs(), 0);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Background Pattern */}
      <div className="absolute inset-0 gradient-mesh opacity-50 pointer-events-none"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/client/home"
            className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 motion-fast group mb-6"
          >
            <i className="fas fa-arrow-left group-hover:-translate-x-1 motion-fast"></i>
            <span className="font-medium">Back to Dashboard</span>
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
              <i className="fas fa-history text-white text-xl"></i>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Review History</h1>
              <p className="text-slate-500 dark:text-slate-400">Track all your review generation logs</p>
            </div>
          </div>
        </div>

        {/* Filter Section Component */}
        <div className="mb-6">
          <FilterSection
            filters={filters}
            onFilterChange={handleFilterChange}
            onApplyFilters={handleApplyFilters}
            onResetFilters={handleResetFilters}
            isOpen={showFilters}
            onToggle={() => setShowFilters(!showFilters)}
          />
        </div>

        {/* Page Size Controls */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-5 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <label className="text-slate-600 dark:text-slate-400 font-medium text-sm">Show</label>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(0);
                }}
                className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 w-20"
              >
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
              </select>
              <span className="text-slate-600 dark:text-slate-400 font-medium text-sm">entries</span>
            </div>

            {totalElements > 0 && (
              <p className="text-slate-600 dark:text-slate-400">
                Showing <span className="font-semibold text-slate-900 dark:text-white">{logs.length}</span> of{' '}
                <span className="font-semibold text-slate-900 dark:text-white">{totalElements}</span> logs
              </p>
            )}
          </div>
        </div>

        {/* Table Component */}
        <div className="mb-6">
          <Table
            logs={logs}
            loading={loading}
            totalElements={totalElements}
            emptyTitle="No logs for this client"
            emptyDescription="No logs were found for your account with the current filters."
          />
        </div>

        {/* Pagination Component */}
        {totalPages > 1 && (
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        )}
      </div>
    </div>
  );
};

export default ClientHistory;
