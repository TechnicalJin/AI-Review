import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiHome, FiSearch } from 'react-icons/fi';
import APIService from '../../services/APIService';
import FilterSection from '../../components/logHistory/FilterSection';
import Table from '../../components/logHistory/Table';
import Pagination from '../../components/logHistory/Pagination';
import Sidebar from '../../components/userDashboard/Sidebar';
import Header from '../../components/userDashboard/Header';
import { useAuth } from '../../context/AuthContext';

const LogHistory = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [logs, setLogs] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(true);
  const [distinctCompanies, setDistinctCompanies] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    search: '',
    company: '',
    reviewLength: '',
    regenerated: '',
    keyPoints: '',
    startDate: '',
    endDate: '',
  });

  const [appliedFilters, setAppliedFilters] = useState(filters);

  useEffect(() => {
    const loadCompanies = async () => {
      try {
        const data = await APIService.getDistinctCompanies();
        setDistinctCompanies(data || []);
      } catch {
        setDistinctCompanies([]);
      }
    };

    loadCompanies();
  }, []);

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      try {
        const params = {
          page: currentPage,
          size: pageSize,
          ...Object.fromEntries(
            Object.entries(appliedFilters).filter(([, value]) => value !== ''),
          ),
        };

        const response = await APIService.getLogs(params);
        setLogs(response?.content || []);
        setTotalElements(response?.totalElements || 0);
        setTotalPages(response?.totalPages || 0);
      } catch {
        setLogs([]);
        setTotalElements(0);
        setTotalPages(0);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [currentPage, pageSize, appliedFilters]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateRangeChange = (dates) => {
    const [start, end] = dates;
    setFilters((prev) => ({
      ...prev,
      startDate: start ? start.toISOString().slice(0, 10) : '',
      endDate: end ? end.toISOString().slice(0, 10) : '',
    }));
  };

  const applyFilters = () => {
    setAppliedFilters(filters);
    setCurrentPage(0);
  };

  const resetFilters = () => {
    const reset = {
      search: '',
      company: '',
      reviewLength: '',
      regenerated: '',
      keyPoints: '',
      startDate: '',
      endDate: '',
    };
    setFilters(reset);
    setAppliedFilters(reset);
    setCurrentPage(0);
  };

  const activeCount = useMemo(
    () => Object.values(appliedFilters).filter((value) => value !== '').length,
    [appliedFilters],
  );

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Sidebar
        isMobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
        onLogout={handleLogout}
        user={user}
      />

      <main className="transition-all duration-300 md:ml-64">
        <Header onMenuClick={() => setMobileSidebarOpen(true)} />

        <section className="p-6">
          <div className="mx-auto w-full max-w-[1400px] animate-[fadeIn_0.8s_ease-out] px-4 py-8 lg:px-8">
            <section className="relative mb-8 overflow-hidden rounded-2xl border border-slate-100 bg-white px-8 py-8 shadow-lg">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-indigo-500 to-violet-500" />
              <div className="flex flex-wrap items-center justify-between gap-6">
                <div>
                  <h1 className="bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-4xl font-extrabold text-transparent">
                    Review Generation History
                  </h1>
                  <p className="mt-2 text-lg text-slate-600">Manage and track your review generation logs</p>
                </div>
                <Link
                  to="/user/home"
                  className="inline-flex items-center gap-2 rounded-lg border-2 border-slate-200 bg-white px-5 py-3 font-semibold text-slate-700 transition-all duration-200 hover:text-white"
                  style={{ backgroundImage: 'linear-gradient(90deg, transparent, transparent)', backgroundSize: '0% 100%' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundImage = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundImage = 'linear-gradient(90deg, transparent, transparent)';
                  }}
                >
                  <FiHome />
                  Back to Home
                </Link>
              </div>
            </section>

            <FilterSection
              showFilters={showFilters}
              onToggle={() => setShowFilters((prev) => !prev)}
              filters={filters}
              distinctCompanies={distinctCompanies}
              onFilterChange={handleFilterChange}
              onDateRangeChange={handleDateRangeChange}
              onApply={applyFilters}
              onReset={resetFilters}
            />

            <section className="mb-8 rounded-2xl border border-slate-100 bg-white px-8 py-6 shadow-md">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <label htmlFor="entries" className="text-sm font-semibold text-slate-700">
                    Entries per page:
                  </label>
                  <select
                    id="entries"
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setCurrentPage(0);
                    }}
                    className="rounded-lg border-2 border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 focus:border-indigo-400 focus:outline-none focus:ring-4 focus:ring-indigo-100"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    name="search"
                    value={filters.search}
                    onChange={handleFilterChange}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        applyFilters();
                      }
                    }}
                    placeholder="Search logs..."
                    className="w-[280px] rounded-lg border-2 border-slate-200 px-4 py-2 text-sm text-slate-700 focus:border-indigo-400 focus:outline-none focus:ring-4 focus:ring-indigo-100"
                  />
                  <button
                    type="button"
                    onClick={applyFilters}
                    className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-500 to-violet-500 px-4 py-2 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:scale-105 hover:shadow-lg"
                  >
                    <FiSearch />
                    <span className="sr-only">Search</span>
                  </button>
                </div>
              </div>
              {activeCount > 0 && (
                <p className="mt-3 text-sm text-slate-500">{activeCount} filter(s) currently applied.</p>
              )}
            </section>

            <Table logs={logs} loading={loading} totalElements={totalElements} />

            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          </div>
        </section>
      </main>
    </div>
  );
};

export default LogHistory;
