import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import APIService from '../../services/APIService';

const ClientHome = () => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 1024);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [stats, setStats] = useState({
    totalReviews: 0,
    thisWeek: 0,
    thisMonth: 0,
    regenerated: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showProfileModal, setShowProfileModal] = useState(false);

  useEffect(() => {
    fetchStats();

    const handleResize = () => {
      if (window.innerWidth > 1024) {
        setMobileSidebarOpen(false);
        setSidebarOpen(true);
      } else if (window.innerWidth <= 768) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await APIService.getStats(user?.email);
      setStats({
        totalReviews: data.totalReviews || 0,
        thisWeek: data.thisWeek || 0,
        thisMonth: data.thisMonth || 0,
        regenerated: data.regenerated || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden fade-in"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          ${sidebarOpen ? 'w-72' : 'w-20'}
          ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          bg-gradient-to-b from-indigo-900 via-purple-900 to-indigo-900 text-white
          flex flex-col motion-slow ease-out
          fixed h-full z-50 lg:relative
          border-r border-indigo-700/50 shadow-2xl
        `}
      >
        {/* Logo Section */}
        <div className="p-5 border-b border-indigo-700/50 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            {sidebarOpen && (
              <div className="flex items-center gap-3 fade-in">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-500/50 ring-2 ring-white/20">
                  <i className="fas fa-chart-line text-white text-lg"></i>
                </div>
                <div>
                  <h1 className="text-lg font-bold text-white">Analytics</h1>
                  <span className="text-xs text-indigo-200">Client Portal</span>
                </div>
              </div>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2.5 hover:bg-white/10 rounded-xl motion-fast hidden lg:flex items-center justify-center backdrop-blur-sm"
            >
              <i className={`fas fa-${sidebarOpen ? 'chevron-left' : 'chevron-right'} text-indigo-200 text-sm`}></i>
            </button>
            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="p-2.5 hover:bg-white/10 rounded-xl motion-fast lg:hidden"
            >
              <i className="fas fa-times text-indigo-200"></i>
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <NavLink icon="fas fa-chart-pie" label="Dashboard" href="/client/home" active sidebarOpen={sidebarOpen} />
          <NavLink icon="fas fa-history" label="Log History" href="/client/history" sidebarOpen={sidebarOpen} />
          <NavLink icon="fas fa-tags" label="Manage Tags" href="/client/chattext" sidebarOpen={sidebarOpen} />
          <button
            onClick={() => setShowProfileModal(true)}
            className={`w-full flex items-center gap-3 px-4 py-3 text-indigo-200 hover:bg-white/10 rounded-xl motion-normal hover:text-white ${!sidebarOpen ? 'justify-center' : ''}`}
          >
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center backdrop-blur-sm">
              <i className="fas fa-user text-sm"></i>
            </div>
            {sidebarOpen && <span className="text-sm font-medium">Profile</span>}
          </button>
        </nav>

        {/* Footer Actions */}
        <div className="p-4 border-t border-indigo-700/50 space-y-2 backdrop-blur-sm">
          <button
            onClick={toggleTheme}
            className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-white/10 rounded-xl motion-normal text-indigo-200 hover:text-white group ${!sidebarOpen ? 'justify-center' : ''}`}
          >
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center group-hover:bg-white/20 motion-fast backdrop-blur-sm">
              <i className={`fas fa-${isDark ? 'sun' : 'moon'} text-sm ${isDark ? 'text-amber-300' : 'text-indigo-200'}`}></i>
            </div>
            {sidebarOpen && <span className="text-sm font-medium">{isDark ? 'Light Mode' : 'Dark Mode'}</span>}
          </button>
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-red-500/20 rounded-xl motion-normal text-indigo-200 hover:text-red-300 group ${!sidebarOpen ? 'justify-center' : ''}`}
          >
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center group-hover:bg-red-500/30 motion-fast backdrop-blur-sm">
              <i className="fas fa-sign-out-alt text-sm"></i>
            </div>
            {sidebarOpen && <span className="text-sm font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50 sticky top-0 z-30 shadow-sm">
          <div className="flex justify-between items-center px-4 lg:px-8 py-5">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setMobileSidebarOpen(true)}
                className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl motion-fast lg:hidden"
              >
                <i className="fas fa-bars text-slate-600 dark:text-slate-300"></i>
              </button>
              <div>
                <h2 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                  Analytics Dashboard
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                  Welcome back, <span className="font-semibold text-indigo-600 dark:text-indigo-400">{user?.username || 'Client'}</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={toggleTheme}
                className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl motion-fast"
              >
                <i className={`fas fa-${isDark ? 'sun text-amber-500' : 'moon text-slate-600'}`}></i>
              </button>
              <button
                onClick={() => setShowProfileModal(true)}
                className="flex items-center gap-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl px-3 py-2 motion-fast"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-purple-500/30 ring-2 ring-white dark:ring-slate-800">
                  {user?.username?.[0]?.toUpperCase() || 'C'}
                </div>
                <div className="hidden md:block">
                  <p className="font-semibold text-slate-900 dark:text-white text-sm">{user?.username || 'Client'}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Client Account</p>
                </div>
              </button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8 gradient-mesh">
          {loading ? (
            <div className="flex flex-col justify-center items-center h-full">
              <div className="w-16 h-16 border-4 border-indigo-200 dark:border-indigo-900 border-t-indigo-600 rounded-full spin mb-4"></div>
              <p className="text-slate-500 dark:text-slate-400 text-sm">Loading your analytics...</p>
            </div>
          ) : (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
                <StatCard
                  title="Total Reviews"
                  value={stats.totalReviews}
                  icon="fas fa-file-alt"
                  gradient="from-indigo-500 to-blue-500"
                  iconBg="bg-indigo-100 dark:bg-indigo-900/30"
                  iconColor="text-indigo-600 dark:text-indigo-400"
                  trend="+12%"
                  index={0}
                />
                <StatCard
                  title="This Week"
                  value={stats.thisWeek}
                  icon="fas fa-calendar-week"
                  gradient="from-emerald-500 to-teal-500"
                  iconBg="bg-emerald-100 dark:bg-emerald-900/30"
                  iconColor="text-emerald-600 dark:text-emerald-400"
                  trend="+8%"
                  index={1}
                />
                <StatCard
                  title="This Month"
                  value={stats.thisMonth}
                  icon="fas fa-calendar-alt"
                  gradient="from-amber-500 to-orange-500"
                  iconBg="bg-amber-100 dark:bg-amber-900/30"
                  iconColor="text-amber-600 dark:text-amber-400"
                  trend="+15%"
                  index={2}
                />
                <StatCard
                  title="Regenerated"
                  value={stats.regenerated}
                  icon="fas fa-rotate"
                  gradient="from-purple-500 to-pink-500"
                  iconBg="bg-purple-100 dark:bg-purple-900/30"
                  iconColor="text-purple-600 dark:text-purple-400"
                  index={3}
                />
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Review Analytics */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-6 lg:p-8 fade-in">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <i className="fas fa-chart-pie text-indigo-500"></i>
                        Review Distribution
                      </h3>
                      <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">By length category</p>
                    </div>
                    <span className="badge badge-primary">Live</span>
                  </div>
                  <div className="h-64 flex items-center justify-center bg-gradient-to-br from-slate-50 to-indigo-50 dark:from-slate-700/50 dark:to-indigo-900/20 rounded-xl">
                    <div className="text-center">
                      <i className="fas fa-chart-bar text-5xl text-slate-300 dark:text-slate-600 mb-4"></i>
                      <p className="text-slate-500 dark:text-slate-400 font-medium">
                        Chart placeholder
                      </p>
                      <p className="text-slate-400 dark:text-slate-500 text-xs mt-2">
                        Integrate with Chart.js or Recharts
                      </p>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-6 lg:p-8 slide-up">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <i className="fas fa-clock-rotate-left text-purple-500"></i>
                        Recent Activity
                      </h3>
                      <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Latest review actions</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {stats.totalReviews > 0 ? (
                      <>
                        <ActivityItem
                          action="Review generated"
                          timestamp="2 hours ago"
                          length="Medium"
                          icon="fas fa-file-alt"
                          color="emerald"
                        />
                        <ActivityItem
                          action="Review regenerated"
                          timestamp="5 hours ago"
                          length="Long"
                          icon="fas fa-rotate"
                          color="amber"
                        />
                        <ActivityItem
                          action="Review generated"
                          timestamp="1 day ago"
                          length="Short"
                          icon="fas fa-file-alt"
                          color="indigo"
                        />
                      </>
                    ) : (
                      <div className="empty-state py-8">
                        <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center mx-auto mb-4">
                          <i className="fas fa-inbox text-2xl text-slate-400 dark:text-slate-500"></i>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">No recent activity</p>
                      </div>
                    )}
                  </div>
                  <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <Link
                      to="/client/history"
                      className="btn btn-md btn-ghost w-full justify-center"
                    >
                      View Full History
                      <i className="fas fa-arrow-right text-sm"></i>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl shadow-2xl p-8 text-white scale-in">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                  <div className="text-center lg:text-left">
                    <h3 className="text-2xl font-bold mb-2 flex items-center justify-center lg:justify-start gap-3">
                      <i className="fas fa-rocket text-3xl"></i>
                      Quick Actions
                    </h3>
                    <p className="text-indigo-100 text-sm">
                      Manage your review tags and view detailed history
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3 justify-center">
                    <Link
                      to="/client/chattext"
                      className="btn btn-lg bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm border-0 shadow-lg hover:scale-105"
                    >
                      <i className="fas fa-tags"></i>
                      Manage Tags
                    </Link>
                    <Link
                      to="/client/history"
                      className="btn btn-lg bg-white text-indigo-600 hover:bg-indigo-50 border-0 shadow-lg hover:scale-105"
                    >
                      <i className="fas fa-history"></i>
                      View History
                    </Link>
                  </div>
                </div>
              </div>
            </>
          )}
        </main>
      </div>

      {/* Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"
            onClick={() => setShowProfileModal(false)}
          ></div>
          <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md scale-in">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">Client Profile</h2>
                <button
                  onClick={() => setShowProfileModal(false)}
                  className="p-2 hover:bg-white/20 rounded-lg motion-fast"
                >
                  <i className="fas fa-times text-white"></i>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              <div className="flex justify-center mb-6">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-3xl shadow-2xl shadow-purple-500/50 ring-4 ring-white dark:ring-slate-800">
                  {user?.username?.[0]?.toUpperCase() || 'C'}
                </div>
              </div>

              <ProfileItem icon="fas fa-user" label="Username" value={user?.username} />
              <ProfileItem icon="fas fa-envelope" label="Email" value={user?.email} />
              <ProfileItem icon="fas fa-phone" label="Mobile" value={user?.mobile} />
              <ProfileItem icon="fas fa-shield-halved" label="Role" value="Client" />

              <button
                onClick={() => setShowProfileModal(false)}
                className="w-full btn btn-lg btn-primary mt-6"
              >
                <i className="fas fa-check"></i>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Stat Card Component
const StatCard = ({ title, value, icon, gradient, iconBg, iconColor, trend, index }) => (
  <div
    className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6 hover:shadow-xl motion-slow hover:-translate-y-1 fade-in"
    style={{ animationDelay: `${index * 100}ms` }}
  >
    <div className="flex items-start justify-between mb-4">
      <div className={`w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center`}>
        <i className={`${icon} text-xl ${iconColor}`}></i>
      </div>
      {trend && (
        <span className="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full text-xs font-bold">
          {trend}
        </span>
      )}
    </div>
    <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
      {value}
    </h3>
    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{title}</p>
  </div>
);

// Activity Item Component
const ActivityItem = ({ action, timestamp, length, icon, color }) => {
  const colorClasses = {
    emerald: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
    amber: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
    indigo: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300',
  };

  return (
    <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 motion-fast group">
      <div className={`w-10 h-10 rounded-lg ${colorClasses[color].split(' ')[0]} flex items-center justify-center flex-shrink-0`}>
        <i className={`${icon} text-sm ${colorClasses[color].split(' ').slice(2).join(' ')}`}></i>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-slate-900 dark:text-white font-semibold text-sm truncate">
          {action}
        </p>
        <p className="text-slate-500 dark:text-slate-400 text-xs">{timestamp}</p>
      </div>
      <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${colorClasses[color]}`}>
        {length}
      </span>
    </div>
  );
};

// Profile Item Component
const ProfileItem = ({ icon, label, value }) => (
  <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
    <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0">
      <i className={`${icon} text-indigo-600 dark:text-indigo-400`}></i>
    </div>
    <div className="flex-1 min-w-0">
      <span className="font-medium text-slate-500 dark:text-slate-400 block text-xs uppercase tracking-wide">
        {label}
      </span>
      <span className="text-slate-900 dark:text-white font-semibold truncate block">
        {value || '-'}
      </span>
    </div>
  </div>
);

// Navigation Link Component
const NavLink = ({ icon, label, href, active, sidebarOpen }) => (
  <Link
    to={href}
    className={`flex items-center gap-3 px-4 py-3 rounded-xl motion-normal group ${
      active
        ? 'bg-white/20 text-white shadow-lg backdrop-blur-sm'
        : 'text-indigo-200 hover:bg-white/10 hover:text-white'
    } ${!sidebarOpen ? 'justify-center' : ''}`}
  >
    <div className={`w-8 h-8 rounded-lg flex items-center justify-center motion-fast backdrop-blur-sm ${
      active ? 'bg-white/20' : 'bg-white/5 group-hover:bg-white/10'
    }`}>
      <i className={`${icon} text-sm`}></i>
    </div>
    {sidebarOpen && <span className="text-sm font-medium">{label}</span>}
  </Link>
);

export default ClientHome;


