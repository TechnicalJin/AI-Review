import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import APIService from '../../services/APIService';

// Inline Bar Chart Component (replaces Chart.js)
const BarChart = ({ data, labels, height = 300 }) => {
  const max = Math.max(...data, 1);
  return (
    <div className="flex items-end justify-between gap-2" style={{ height }}>
      {data.map((value, index) => (
        <div key={index} className="flex-1 flex flex-col items-center gap-2">
          <span className="text-xs font-semibold text-indigo-500">{value > 0 ? value : ''}</span>
          <div
            className="w-full rounded-t-lg bg-indigo-500 hover:bg-indigo-600 transition-all duration-300"
            style={{ height: `${Math.max(8, (value / max) * (height - 50))}px` }}
          ></div>
          <span className="text-xs text-gray-500 dark:text-gray-400">{labels[index]}</span>
        </div>
      ))}
    </div>
  );
};

// Inline Donut Chart Component (replaces Chart.js)
const DonutChart = ({ segments, size = 200 }) => {
  const total = segments.reduce((sum, seg) => sum + seg.value, 0);
  let cumulativePercent = 0;
  const r = 70;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {segments.map((segment, index) => {
        const percent = segment.value / total;
        const strokeDasharray = `${percent * circumference} ${circumference}`;
        const rotation = cumulativePercent * 360 - 90;
        cumulativePercent += percent;

        return (
          <circle
            key={index}
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={segment.color}
            strokeWidth="25"
            strokeDasharray={strokeDasharray}
            transform={`rotate(${rotation} ${cx} ${cy})`}
            style={{ transition: 'stroke-dasharray 0.6s ease' }}
          />
        );
      })}
      <text x={cx} y={cy - 8} textAnchor="middle" className="fill-gray-900 dark:fill-white text-xl font-bold">{total}</text>
      <text x={cx} y={cy + 12} textAnchor="middle" className="fill-gray-400 text-xs">total</text>
    </svg>
  );
};

const ClientHome = () => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [stats, setStats] = useState({ totalReviews: 0, thisWeek: 0, thisMonth: 0, regenerated: 0, avgReviewLength: 'Medium' });
  const [loading, setLoading] = useState(true);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [chartTab, setChartTab] = useState('week');
  const [recentActivity, setRecentActivity] = useState([]);

  // Distribution data
  const [distribution, setDistribution] = useState({
    short: 15,
    medium: 35,
    long: 50,
    mostCommon: 'Long',
    mostCommonPercent: 50,
    regenerated: 0
  });

  useEffect(() => {
    fetchStats();
    fetchRecentActivity();
    
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setMobileSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Chart data state
  const [weeklyData] = useState([4, 7, 3, 9, 6, 12, 8]);
  const [monthlyData] = useState([18, 24, 15, 30, 22, 28, 19, 35, 25, 32, 28, 40]);
  const weekLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await APIService.getStats(user?.email);
      setStats({
        totalReviews: data.totalReviews || 0,
        thisWeek: data.thisWeek || 0,
        thisMonth: data.thisMonth || 0,
        regenerated: data.regenerated || 0,
        avgReviewLength: data.avgReviewLength || 'Medium',
      });
      setDistribution({
        short: data.shortReviews || 15,
        medium: data.mediumReviews || 35,
        long: data.longReviews || 50,
        mostCommon: data.mostCommonLength || 'Long',
        mostCommonPercent: data.mostCommonPercent || 50,
        regenerated: data.regenerated || 0
      });
    } catch { /* silent */ } finally { setLoading(false); }
  };

  const fetchRecentActivity = async () => {
    try {
      const data = await APIService.getClientHistory({ page: 0, size: 5 });
      if (data?.content) {
        setRecentActivity(data.content.map(item => ({
          action: `Generated ${item.reviewLength || 'large'} review`,
          time: formatTimeAgo(item.createdAt),
          type: item.reviewLength || 'large',
          client: item.companyName || user?.username || 'Client'
        })));
      }
    } catch { /* silent */ }
  };

  const formatTimeAgo = (dateString) => {
    if (!dateString) return 'Recently';
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    return `${Math.floor(diff / 86400)} days ago`;
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  const navItems = [
    { icon: 'fas fa-chart-pie', label: 'Dashboard', href: '/client/home', active: true },
    { icon: 'fas fa-user', label: 'Profile', onClick: () => setShowProfileModal(true) },
    { icon: 'fas fa-history', label: 'Log History', href: '/client/history' },
    { icon: 'fas fa-comment-alt', label: 'Chat Tag', href: '/client/chattext' },
    { icon: 'fas fa-external-link-alt', label: 'View Page', href: user?.generateLink || '#', external: true },
  ];

  const totalDistribution = distribution.short + distribution.medium + distribution.long;
  const shortPercent = totalDistribution ? Math.round((distribution.short / totalDistribution) * 100) : 0;
  const longPercent = totalDistribution ? Math.round((distribution.long / totalDistribution) * 100) : 0;
  const avgLengthPercent = distribution.mostCommonPercent || 50;

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
      {/* Mobile Overlay */}
      {mobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" 
          onClick={() => setMobileSidebarOpen(false)} 
        />
      )}

      {/* Sidebar */}
      <aside className={`
        bg-gray-900 text-white w-64 flex-shrink-0
        fixed md:relative h-full z-50
        transform transition-transform duration-300 ease-in-out
        ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Sidebar Header */}
        <div className="flex items-center gap-3 p-4 border-b border-gray-800">
          {user?.logo ? (
            <img 
              src={`/uploads/${user.logo}`} 
              alt="Logo" 
              className="w-10 h-10 rounded-full object-cover"
              onError={(e) => {
                e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiByeD0iMjAiIGZpbGw9IiM2MzY2ZjEiLz4KPHBhdGggZD0iTTIwIDEwQzIyLjc2MTQgMTAgMjUgMTIuMjM4NiAyNSAxNUMyNSAxNy43NjE0IDIyLjc2MTQgMjAgMjAgMjBDMTcuMjM4NiAyMCAxNSAxNy43NjE0IDE1IDE1QzE1IDEyLjIzODYgMTcuMjM4NiAxMCAyMCAxMFpNMjAgMzBDMjUgMzAgMzAgMjcgMzAgMjRIMTBDMTAgMjcgMTUgMzAgMjAgMzBaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K';
              }}
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold">
              {user?.username?.[0]?.toUpperCase() || 'C'}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold truncate">{user?.username || 'Client'}</h2>
            <p className="text-gray-400 text-sm">Analytics Dashboard</p>
          </div>
          <button 
            className="md:hidden text-gray-400 hover:text-white"
            onClick={() => setMobileSidebarOpen(false)}
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4">
          <ul>
            {navItems.map((item, index) => (
              <li key={index} className="mb-2">
                {item.onClick ? (
                  <button
                    onClick={item.onClick}
                    className="w-full flex items-center p-3 text-gray-400 hover:bg-gray-800 rounded-lg hover:text-white transition-colors"
                  >
                    <i className={`${item.icon} mr-3`}></i>
                    {item.label}
                  </button>
                ) : item.external ? (
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center p-3 text-gray-400 hover:bg-gray-800 rounded-lg hover:text-white transition-colors"
                  >
                    <i className={`${item.icon} mr-3`}></i>
                    {item.label}
                  </a>
                ) : (
                  <Link
                    to={item.href}
                    className={`flex items-center p-3 rounded-lg transition-colors ${
                      item.active 
                        ? 'bg-gray-800 text-white' 
                        : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    <i className={`${item.icon} mr-3`}></i>
                    {item.label}
                  </Link>
                )}
              </li>
            ))}
            <li className="mb-2">
              <button
                onClick={handleLogout}
                className="w-full flex items-center p-3 text-gray-400 hover:bg-red-600 rounded-lg hover:text-white transition-colors"
              >
                <i className="fas fa-sign-out-alt mr-3"></i>
                Logout
              </button>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Top Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 h-16 flex items-center px-4 lg:px-6 flex-shrink-0">
          <div className="flex justify-between items-center w-full">
            {/* Left side */}
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setMobileSidebarOpen(true)} 
                className="md:hidden w-9 h-9 rounded-lg flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <i className="fas fa-bars text-gray-500 dark:text-gray-400"></i>
              </button>
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Analytics Dashboard</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
                  Welcome back, <span className="text-indigo-500 font-semibold">{user?.username}</span>
                </p>
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="w-9 h-9 rounded-lg flex items-center justify-center border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <i className={`fas fa-${isDark ? 'sun text-yellow-400' : 'moon text-gray-500'}`}></i>
              </button>

              {/* Profile Button */}
              <button 
                onClick={() => setShowProfileModal(true)}
                className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg px-2 py-1.5 transition-colors"
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-sm">
                  {user?.username?.[0]?.toUpperCase() || 'C'}
                </div>
                <span className="hidden md:block text-sm font-semibold text-gray-900 dark:text-white">{user?.username}</span>
                <i className="fas fa-chevron-down text-xs text-gray-400 hidden md:block"></i>
              </button>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full gap-3">
              <div className="w-12 h-12 border-4 border-indigo-200 dark:border-indigo-900 border-t-indigo-600 rounded-full animate-spin"></div>
              <p className="text-sm text-gray-400">Loading analytics...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Stats Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {/* Total Reviews */}
                <div className="stat-card bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-5 animate-fade-in">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-1">Total Reviews</p>
                      <p id="totalReviewsCount" className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalReviews}</p>
                      <div className="flex items-center gap-1 mt-2">
                        <i className="fas fa-arrow-up text-green-500 text-xs"></i>
                        <span id="totalReviewsPercent" className="text-sm text-green-500 font-semibold">+175%</span>
                        <span id="totalReviewsChange" className="text-xs text-gray-400">vs last month</span>
                      </div>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
                      <i className="fas fa-comment-alt text-indigo-600 dark:text-indigo-400"></i>
                    </div>
                  </div>
                </div>

                {/* Avg. Length */}
                <div className="stat-card bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-5 animate-fade-in">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-1">Avg. Length</p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.avgReviewLength}</p>
                      <div className="mt-3">
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            id="avgLengthBar"
                            className="bg-amber-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${avgLengthPercent}%` }}
                          ></div>
                        </div>
                        <p id="avgLengthPercent" className="text-xs text-gray-400 mt-1">{avgLengthPercent}% of reviews</p>
                      </div>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center">
                      <i className="fas fa-ruler text-amber-600 dark:text-amber-400"></i>
                    </div>
                  </div>
                </div>

                {/* Today's Reviews */}
                <div className="stat-card bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-5 animate-fade-in">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-1">Today's Reviews</p>
                      <p id="todayReviewsCount" className="text-3xl font-bold text-gray-900 dark:text-white">{stats.thisWeek}</p>
                      <div className="flex items-center gap-1 mt-2">
                        <i className="fas fa-arrow-down text-red-500 text-xs"></i>
                        <span className="text-sm text-red-500 font-semibold">-12%</span>
                        <span className="text-xs text-gray-400">vs yesterday</span>
                      </div>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
                      <i className="fas fa-calendar-day text-green-600 dark:text-green-400"></i>
                    </div>
                  </div>
                </div>

                {/* This Month */}
                <div className="stat-card bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-5 animate-fade-in">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-1">This Month</p>
                      <p id="thisMonthCount" className="text-3xl font-bold text-gray-900 dark:text-white">{stats.thisMonth}</p>
                      <div className="flex items-center gap-1 mt-2">
                        <i className="fas fa-arrow-up text-green-500 text-xs"></i>
                        <span className="text-sm text-green-500 font-semibold">+175%</span>
                        <span className="text-xs text-gray-400">vs last month</span>
                      </div>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center">
                      <i className="fas fa-calendar-alt text-purple-600 dark:text-purple-400"></i>
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Chart Section */}
              <div className="bg-white dark:bg-gray-800 shadow-md rounded-2xl p-5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
                  <h3 id="chartTitle" className="text-lg font-bold text-gray-900 dark:text-white">Review Generation</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setChartTab('week')}
                      className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                        chartTab === 'week'
                          ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400'
                          : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      This Week
                    </button>
                    <button
                      onClick={() => setChartTab('month')}
                      className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                        chartTab === 'month'
                          ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400'
                          : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      This Month
                    </button>
                  </div>
                </div>
                <div style={{ height: '300px', width: '100%' }}>
                  <BarChart 
                    data={chartTab === 'week' ? weeklyData : monthlyData} 
                    labels={chartTab === 'week' ? weekLabels : monthLabels} 
                    height={300} 
                  />
                </div>
              </div>

              {/* Bottom Row - Two Column Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-slide-up">
                {/* Review Length Distribution */}
                <div className="bg-white dark:bg-gray-800 shadow-md rounded-2xl p-5">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Review Length Distribution</h3>
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Donut Chart */}
                    <div className="flex-shrink-0 flex justify-center">
                      <DonutChart 
                        segments={[
                          { value: distribution.short, color: '#f59e0b' },
                          { value: distribution.medium, color: '#6366f1' },
                          { value: distribution.long, color: '#10b981' }
                        ]}
                        size={200}
                      />
                    </div>
                    
                    {/* Info Boxes */}
                    <div className="flex-1 grid grid-cols-1 gap-4">
                      <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                        <p className="text-xs text-gray-400 mb-1">Most Common</p>
                        <p id="mostCommonLength" className="text-lg font-bold text-gray-900 dark:text-white">{distribution.mostCommon}</p>
                        <p id="mostCommonPercent" className="text-sm text-indigo-500 font-semibold">{distribution.mostCommonPercent}% of total</p>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                        <p className="text-xs text-gray-400 mb-1">Short Reviews</p>
                        <p id="shortReviewsCount" className="text-lg font-bold text-gray-900 dark:text-white">{distribution.short}</p>
                        <p id="shortReviewsPercent" className="text-sm text-amber-500 font-semibold">{shortPercent}% of total</p>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                        <p className="text-xs text-gray-400 mb-1">Long Reviews</p>
                        <p id="longReviewsCount" className="text-lg font-bold text-gray-900 dark:text-white">{distribution.long}</p>
                        <p id="longReviewsPercent" className="text-sm text-green-500 font-semibold">{longPercent}% of total</p>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center">
                          <i className="fas fa-redo text-amber-600 dark:text-amber-400 text-sm"></i>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Regenerated</p>
                          <p id="regeneratedCount" className="text-lg font-bold text-gray-900 dark:text-white">{distribution.regenerated}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white dark:bg-gray-800 shadow-md rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Recent Activity</h3>
                    <Link 
                      to="/client/history" 
                      className="text-sm text-indigo-500 hover:text-indigo-600 font-semibold"
                    >
                      View All History →
                    </Link>
                  </div>
                  <div id="recentActivity" className="space-y-4 max-h-80 overflow-y-auto">
                    {recentActivity.length > 0 ? (
                      recentActivity.map((item, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors">
                          <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center flex-shrink-0">
                            <i className="fas fa-plus text-green-600 dark:text-green-400 text-xs"></i>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{item.action}</p>
                            <p className="text-xs text-gray-400">{item.time}</p>
                          </div>
                          <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">{item.client}</span>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-400">
                        <i className="fas fa-inbox text-2xl mb-2"></i>
                        <p className="text-sm">No recent activity</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 w-full max-w-md shadow-lg relative animate-scale-in">
            {/* Close Button */}
            <button 
              onClick={() => setShowProfileModal(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center transition-colors"
            >
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>

            {/* Modal Content */}
            <div className="text-center mb-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-3xl mx-auto mb-4">
                {user?.username?.[0]?.toUpperCase() || 'C'}
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Client Profile</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <i className="fas fa-user text-gray-400 w-5 text-center"></i>
                <div>
                  <p className="text-xs text-gray-400">Username</p>
                  <p id="clientUsername" className="text-sm font-semibold text-gray-900 dark:text-white">{user?.username || '—'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <i className="fas fa-building text-gray-400 w-5 text-center"></i>
                <div>
                  <p className="text-xs text-gray-400">Company</p>
                  <p id="clientCompanyName" className="text-sm font-semibold text-gray-900 dark:text-white">{user?.companyName || user?.username || '—'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <i className="fas fa-envelope text-gray-400 w-5 text-center"></i>
                <div>
                  <p className="text-xs text-gray-400">Email</p>
                  <p id="clientEmail" className="text-sm font-semibold text-gray-900 dark:text-white">{user?.email || '—'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <i className="fas fa-phone text-gray-400 w-5 text-center"></i>
                <div>
                  <p className="text-xs text-gray-400">Mobile</p>
                  <p id="clientMobile" className="text-sm font-semibold text-gray-900 dark:text-white">{user?.mobile || '—'}</p>
                </div>
              </div>
            </div>

            <button 
              onClick={() => setShowProfileModal(false)}
              className="w-full mt-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Custom Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes scaleIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out;
        }
        
        .animate-scale-in {
          animation: scaleIn 0.3s ease-out;
        }
        
        .animate-slide-up {
          animation: slideUp 0.6s ease-out;
        }
        
        .stat-card {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        
        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 40px -10px rgba(0,0,0,0.2);
        }
      `}</style>
    </div>
  );
};

export default ClientHome;