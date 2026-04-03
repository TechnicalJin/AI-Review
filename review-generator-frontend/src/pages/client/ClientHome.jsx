import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DateTime } from 'luxon';
import APIService from '../../services/APIService';
import Sidebar from '../../components/layout/Sidebar';
import Header from '../../components/layout/Header';
import StatCard from '../../components/dashboard/StatCard';
import ChartSection from '../../components/dashboard/ChartSection';
import DonutChart from '../../components/dashboard/DonutChart';
import RecentActivity from '../../components/dashboard/RecentActivity';
import ProfileModal from '../../components/dashboard/ProfileModal';

// Helper functions
const getStartOfWeek = (date = DateTime.now().setZone('Asia/Kolkata')) => {
  const day = date.weekday;
  const diff = (day === 7 ? -6 : 1 - day);
  const startOfWeek = date.plus({ days: diff }).startOf('day');
  return startOfWeek;
};

const getStartOfMonth = (date = DateTime.now().setZone('Asia/Kolkata')) => {
  return date.startOf('month');
};

const calculateWeeklyStats = (logs) => {
  const weeklyData = {};
  const startOfWeek = getStartOfWeek();

  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  for (let i = 0; i < 7; i++) {
    const date = startOfWeek.plus({ days: i });
    const dateKey = date.toISODate();
    weeklyData[dateKey] = {
      count: 0,
      dayName: daysOfWeek[i]
    };
  }

  logs.forEach(log => {
    const logDate = DateTime.fromISO(log.timestamp, { zone: 'Asia/Kolkata' });
    if (!logDate.isValid) {
      console.warn('Invalid date for log:', log);
      return;
    }

    const dateKey = logDate.toISODate();
    if (weeklyData[dateKey]) {
      weeklyData[dateKey].count++;
    }
  });

  return weeklyData;
};

const calculateMonthlyStats = (logs) => {
  const monthlyData = {};
  const now = DateTime.now().setZone('Asia/Kolkata');
  const daysInMonth = now.daysInMonth;

  for (let day = 1; day <= daysInMonth; day++) {
    const date = now.set({ day });
    const dateKey = date.toISODate();
    monthlyData[dateKey] = {
      count: 0,
      day: day
    };
  }

  logs.forEach(log => {
    const logDate = DateTime.fromISO(log.timestamp, { zone: 'Asia/Kolkata' });
    if (!logDate.isValid ||
        logDate.year !== now.year ||
        logDate.month !== now.month) {
      return;
    }

    const dateKey = logDate.toISODate();
    if (monthlyData[dateKey]) {
      monthlyData[dateKey].count++;
    }
  });

  return monthlyData;
};

const calculateStats = (logs) => {
  if (!logs || logs.length === 0) {
    return {
      totalReviews: 0,
      todayReviews: 0,
      thisMonthReviews: 0,
      lastMonthReviews: 0,
      yesterdayReviews: 0,
      avgLength: 'N/A',
      lengthDistribution: { short: 0, medium: 0, large: 0 },
      regeneratedCount: 0,
      dailyData: {},
      recentActivity: []
    };
  }

  const now = DateTime.now().setZone('Asia/Kolkata');
  const today = now.startOf('day');
  const yesterday = today.minus({ days: 1 });
  const thisMonth = now.startOf('month');
  const lastMonth = thisMonth.minus({ months: 1 });
  const lastMonthEnd = thisMonth.minus({ days: 1 });

  let todayReviews = 0;
  let yesterdayReviews = 0;
  let thisMonthReviews = 0;
  let lastMonthReviews = 0;
  let lengthDistribution = { short: 0, medium: 0, large: 0 };
  let regeneratedCount = 0;

  logs.forEach(log => {
    const logDate = DateTime.fromISO(log.timestamp, { zone: 'Asia/Kolkata' });
    if (!logDate.isValid) {
      console.warn('Invalid date for log:', log);
      return;
    }

    const logDateOnly = logDate.startOf('day');

    if (logDateOnly.toISODate() === today.toISODate()) {
      todayReviews++;
    }

    if (logDateOnly.toISODate() === yesterday.toISODate()) {
      yesterdayReviews++;
    }

    if (logDate >= thisMonth) {
      thisMonthReviews++;
    }

    if (logDate >= lastMonth && logDate <= lastMonthEnd) {
      lastMonthReviews++;
    }

    const length = log.reviewLength ? log.reviewLength.toLowerCase() : 'medium';
    if (lengthDistribution.hasOwnProperty(length)) {
      lengthDistribution[length]++;
    } else {
      lengthDistribution.medium++;
    }

    const regenerated = log.regenerated ? log.regenerated.toLowerCase() : 'no';
    if (regenerated === 'yes' || regenerated === 'true' || regenerated === true) {
      regeneratedCount++;
    }
  });

  let avgLength = 'Medium';
  const maxCount = Math.max(...Object.values(lengthDistribution));
  if (lengthDistribution.short === maxCount && maxCount > 0) {
    avgLength = 'Short';
  } else if (lengthDistribution.large === maxCount && maxCount > 0) {
    avgLength = 'Large';
  }

  const recentActivity = logs.slice(-5).reverse();

  return {
    totalReviews: logs.length,
    todayReviews,
    yesterdayReviews,
    thisMonthReviews,
    lastMonthReviews,
    avgLength,
    lengthDistribution,
    regeneratedCount,
    recentActivity
  };
};

const ClientHome = () => {
  // State variables
  const [isDark, setIsDark] = useState(() => localStorage.getItem('theme') === 'dark');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [currentView, setCurrentView] = useState('weekly');
  
  const [clientLogs, setClientLogs] = useState([]);
  const [stats, setStats] = useState({
    totalReviews: 0,
    todayReviews: 0,
    thisMonthReviews: 0,
    lastMonthReviews: 0,
    yesterdayReviews: 0,
    avgLength: 'N/A',
    lengthDistribution: { short: 0, medium: 0, large: 0 },
    regeneratedCount: 0,
    recentActivity: []
  });
  
  const [weeklyData, setWeeklyData] = useState({});
  const [monthlyData, setMonthlyData] = useState({});
  const [client, setClient] = useState({});
  
  const navigate = useNavigate();

  // Theme toggle
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);

  // Fetch logs data
  const fetchLogData = async () => {
    try {
      const logs = await APIService.getClientLogs();
      console.log('Fetched logs from API:', logs);

      const transformedLogs = logs.map(log => {
        let timestamp;
        try {
          if (typeof log.timestamp === 'string') {
            if (log.timestamp.includes('[')) {
              const dateArray = JSON.parse(log.timestamp.replace(/\[|\]/g, '').split(',').map(n => parseInt(n.trim())));
              timestamp = DateTime.fromObject({
                year: dateArray[0],
                month: dateArray[1],
                day: dateArray[2],
                hour: dateArray[3] || 0,
                minute: dateArray[4] || 0,
                second: dateArray[5] || 0
              }, { zone: 'Asia/Kolkata' });
            } else {
              timestamp = DateTime.fromISO(log.timestamp, { zone: 'Asia/Kolkata' });
            }
          } else if (Array.isArray(log.timestamp)) {
            timestamp = DateTime.fromObject({
              year: log.timestamp[0],
              month: log.timestamp[1],
              day: log.timestamp[2],
              hour: log.timestamp[3] || 0,
              minute: log.timestamp[4] || 0,
              second: log.timestamp[5] || 0
            }, { zone: 'Asia/Kolkata' });
          } else {
            timestamp = DateTime.now().setZone('Asia/Kolkata');
          }
          if (!timestamp.isValid) {
            console.warn('Invalid timestamp for log:', log);
            timestamp = DateTime.now().setZone('Asia/Kolkata');
          }
        } catch (e) {
          console.warn('Error parsing timestamp:', log.timestamp, e);
          timestamp = DateTime.now().setZone('Asia/Kolkata');
        }

        return {
          id: log.id,
          timestamp: timestamp.toISO(),
          reviewLength: log.reviewLength || 'medium',
          regenerated: log.regenerated || false,
          reviewText: log.keyPoints || 'Review generated',
          keyPoints: log.keyPoints,
          companyName: log.companyName
        };
      });

      setClientLogs(transformedLogs);
      return transformedLogs;
    } catch (error) {
      console.error('Error fetching logs:', error);
      setClientLogs([]);
      return [];
    }
  };

  // Fetch client data
  const fetchClientData = async () => {
    try {
      const clientData = await APIService.getClientProfile();
      setClient(clientData);
      return clientData;
    } catch (error) {
      console.error('Error fetching client data:', error);
      return null;
    }
  };

  // Initialize dashboard
  useEffect(() => {
    const initializeDashboard = async () => {
      const logs = await fetchLogData();
      const calculatedStats = calculateStats(logs);
      setStats(calculatedStats);

      const weekly = calculateWeeklyStats(logs);
      const monthly = calculateMonthlyStats(logs);
      setWeeklyData(weekly);
      setMonthlyData(monthly);

      await fetchClientData();
    };

    initializeDashboard();

    // Refresh every 5 minutes
    const interval = setInterval(initializeDashboard, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Calculate change percentages
  const totalReviewsChange = stats.lastMonthReviews > 0 
    ? (((stats.thisMonthReviews - stats.lastMonthReviews) / stats.lastMonthReviews) * 100).toFixed(1) 
    : 0;
  const todayReviewsChange = stats.yesterdayReviews > 0 
    ? (((stats.todayReviews - stats.yesterdayReviews) / stats.yesterdayReviews) * 100).toFixed(1) 
    : 0;

  const avgLengthPercent = stats.avgLength === 'Short' ? 25 : stats.avgLength === 'Large' ? 90 : 65;

  const handleLogout = () => {
    fetch('/logout', { method: 'POST' }).then(() => {
      navigate('/login');
    });
  };

  const handleProfileClick = () => {
    setShowProfileModal(true);
    setSidebarOpen(false);
  };

  return (
    <div className={`flex h-screen ${isDark ? 'dark' : ''}`}>
      <div className="flex h-screen w-full bg-gray-50 dark:bg-gray-900 overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          client={client}
          onLogout={handleLogout}
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <Header
            client={client}
            isDark={isDark}
            toggleTheme={toggleTheme}
            onProfileClick={handleProfileClick}
            onMenuClick={() => setSidebarOpen(true)}
          />

          {/* Main Content Area */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50 dark:bg-gray-900">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {/* Total Reviews Card */}
              <StatCard
                title="Total Reviews"
                value={stats.totalReviews}
                changePercent={totalReviewsChange}
                isPrimary={true}
                icon={{
                  class: 'fas fa-comment-alt',
                  color: 'text-indigo-500 dark:text-indigo-400',
                  bg: 'bg-indigo-100 dark:bg-indigo-900/30'
                }}
              >
                last month
              </StatCard>

              {/* Average Review Length Card */}
              <StatCard
                title="Avg. Length"
                value={stats.avgLength}
                showProgressBar={true}
                progressPercent={avgLengthPercent}
                icon={{
                  class: 'fas fa-ruler',
                  color: 'text-amber-500 dark:text-amber-400',
                  bg: 'bg-amber-100 dark:bg-amber-900/30'
                }}
              />

              {/* Today's Reviews Card */}
              <StatCard
                title="Today's Reviews"
                value={stats.todayReviews}
                changePercent={todayReviewsChange}
                icon={{
                  class: 'fas fa-calendar-day',
                  color: 'text-green-500 dark:text-green-400',
                  bg: 'bg-green-100 dark:bg-green-900/30'
                }}
              >
                yesterday
              </StatCard>

              {/* This Month's Reviews Card */}
              <StatCard
                title="This Month"
                value={stats.thisMonthReviews}
                changePercent={totalReviewsChange}
                icon={{
                  class: 'fas fa-calendar-alt',
                  color: 'text-purple-500 dark:text-purple-400',
                  bg: 'bg-purple-100 dark:bg-purple-900/30'
                }}
              >
                last month
              </StatCard>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 gap-6 mb-6">
              <ChartSection
                weeklyData={weeklyData}
                monthlyData={monthlyData}
                isDark={isDark}
                currentView={currentView}
                onViewChange={setCurrentView}
              />
            </div>

            {/* Bottom Section: Donut Chart and Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <DonutChart stats={stats} isDark={isDark} />
              <RecentActivity
                activities={stats.recentActivity}
                emptyText="No logs for this client"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Profile Modal */}
      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        client={client}
      />
    </div>
  );
};
export default ClientHome;