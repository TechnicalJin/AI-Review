// Global variables
let combinedChartInstance = null;
let donutChartInstance = null;
let clientLogs = [];
let currentView = 'weekly'; // Track current view

// Theme toggle (unchanged)
document.getElementById('theme-toggle').addEventListener('click', function() {
    document.body.classList.toggle('dark');
    localStorage.setItem('theme', document.body.classList.contains('dark') ? 'dark' : 'light');
});

// Load saved theme (unchanged)
if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark');
}

// Mobile menu (unchanged)
const sidebar = document.getElementById('sidebar');
const mobileMenuButton = document.getElementById('mobileMenuButton');

mobileMenuButton?.addEventListener('click', () => {
    sidebar.classList.toggle('open');
    sidebar.classList.toggle('hidden');
});

// Close sidebar when clicking outside on mobile (unchanged)
document.addEventListener('click', (e) => {
    if (window.innerWidth < 768 && !sidebar.contains(e.target) && !mobileMenuButton.contains(e.target)) {
        sidebar.classList.remove('open');
        sidebar.classList.add('hidden');
    }
});

// Profile Modal Functions (unchanged)
function openProfileModal() {
    const modal = document.getElementById('profileModal');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    fetchClientData();
}

function closeProfileModal() {
    const modal = document.getElementById('profileModal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
}

document.getElementById('profileModal')?.addEventListener('click', function(e) {
    if (e.target === this) {
        closeProfileModal();
    }
});

// Fetch client data (unchanged)
async function fetchClientData() {
    try {
        const response = await fetch('/client/profile');
        if (!response.ok) throw new Error('Failed to fetch client data');
        const client = await response.json();

        document.getElementById('clientUsername').textContent = client.name || '-';
        document.getElementById('clientCompanyName').textContent = client.name || '-';
        document.getElementById('clientEmail').textContent = client.email || '-';
        document.getElementById('clientMobile').textContent = client.mobile || '-';

        return client;
    } catch (error) {
        console.error('Error fetching client data:', error);
        document.getElementById('clientUsername').textContent = 'Error loading data';
        document.getElementById('clientCompanyName').textContent = 'Error loading data';
        document.getElementById('clientEmail').textContent = 'Error loading data';
        document.getElementById('clientMobile').textContent = 'Error loading data';
        return null;
    }
}

// Fetch log data (unchanged)
async function fetchLogData() {
    try {
        const response = await fetch('/client/logs');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const logs = await response.json();
        console.log('Fetched logs from API:', logs);

        const transformedLogs = logs.map(log => {
            let timestamp;
            try {
                if (typeof log.timestamp === 'string') {
                    if (log.timestamp.includes('[')) {
                        const dateArray = JSON.parse(log.timestamp.replace(/\[|\]/g, '').split(',').map(n => parseInt(n.trim())));
                        timestamp = new Date(dateArray[0], dateArray[1] - 1, dateArray[2], dateArray[3] || 0, dateArray[4] || 0, dateArray[5] || 0);
                    } else {
                        timestamp = new Date(log.timestamp);
                    }
                } else if (Array.isArray(log.timestamp)) {
                    timestamp = new Date(log.timestamp[0], log.timestamp[1] - 1, log.timestamp[2], log.timestamp[3] || 0, log.timestamp[4] || 0, log.timestamp[5] || 0);
                } else {
                    timestamp = new Date(log.timestamp);
                }
                if (isNaN(timestamp.getTime())) {
                    console.warn('Invalid timestamp for log:', log);
                    timestamp = new Date();
                }
            } catch (e) {
                console.warn('Error parsing timestamp:', log.timestamp, e);
                timestamp = new Date();
            }

            return {
                id: log.id,
                timestamp: timestamp.toISOString(),
                reviewLength: log.reviewLength || 'medium',
                regenerated: log.regenerated || false,
                reviewText: log.keyPoints || 'Review generated',
                keyPoints: log.keyPoints,
                companyName: log.companyName
            };
        });

        clientLogs = transformedLogs;
        return transformedLogs;
    } catch (error) {
        console.error('Error fetching logs:', error);
        clientLogs = [];
        return [];
    }
}

// Get start of current week (Monday) (unchanged)
function getStartOfWeek(date = new Date()) {
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    const startOfWeek = new Date(date.setDate(diff));
    startOfWeek.setHours(0, 0, 0, 0);
    return startOfWeek;
}

// Get start of current month (unchanged)
function getStartOfMonth(date = new Date()) {
    return new Date(date.getFullYear(), date.getMonth(), 1);
}

// Calculate weekly statistics (unchanged)
function calculateWeeklyStats(logs) {
    const weeklyData = {};
    const startOfWeek = getStartOfWeek();

    const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    for (let i = 0; i < 7; i++) {
        const date = new Date(startOfWeek);
        date.setDate(startOfWeek.getDate() + i);
        const dateKey = date.toISOString().split('T')[0];
        weeklyData[dateKey] = {
            count: 0,
            dayName: daysOfWeek[i]
        };
    }

    logs.forEach(log => {
        let logDate;
        if (typeof log.timestamp === 'string') {
            if (log.timestamp.includes('[')) {
                const dateArray = JSON.parse(log.timestamp.replace(/\[|\]/g, '').split(',').map(n => parseInt(n.trim())));
                logDate = new Date(dateArray[0], dateArray[1] - 1, dateArray[2], dateArray[3] || 0, dateArray[4] || 0, dateArray[5] || 0);
            } else {
                logDate = new Date(log.timestamp);
            }
        } else if (Array.isArray(log.timestamp)) {
            logDate = new Date(log.timestamp[0], log.timestamp[1] - 1, log.timestamp[2], log.timestamp[3] || 0, log.timestamp[4] || 0, log.timestamp[5] || 0);
        } else {
            logDate = new Date(log.timestamp);
        }

        if (!isNaN(logDate.getTime())) {
            const dateKey = logDate.toISOString().split('T')[0];
            if (weeklyData[dateKey]) {
                weeklyData[dateKey].count++;
            }
        }
    });

    return weeklyData;
}

// Calculate monthly statistics (unchanged)
function calculateMonthlyStats(logs) {
    const monthlyData = {};
    const now = new Date();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(now.getFullYear(), now.getMonth(), day);
        const dateKey = date.toISOString().split('T')[0];
        monthlyData[dateKey] = {
            count: 0,
            day: day
        };
    }

    logs.forEach(log => {
        let logDate;
        if (typeof log.timestamp === 'string') {
            if (log.timestamp.includes('[')) {
                const dateArray = JSON.parse(log.timestamp.replace(/\[|\]/g, '').split(',').map(n => parseInt(n.trim())));
                logDate = new Date(dateArray[0], dateArray[1] - 1, dateArray[2], dateArray[3] || 0, dateArray[4] || 0, dateArray[5] || 0);
            } else {
                logDate = new Date(log.timestamp);
            }
        } else if (Array.isArray(log.timestamp)) {
            logDate = new Date(log.timestamp[0], log.timestamp[1] - 1, log.timestamp[2], log.timestamp[3] || 0, log.timestamp[4] || 0, log.timestamp[5] || 0);
        } else {
            logDate = new Date(log.timestamp);
        }

        if (!isNaN(logDate.getTime()) &&
            logDate.getFullYear() === now.getFullYear() &&
            logDate.getMonth() === now.getMonth()) {
            const dateKey = logDate.toISOString().split('T')[0];
            if (monthlyData[dateKey]) {
                monthlyData[dateKey].count++;
            }
        }
    });

    return monthlyData;
}

// Calculate statistics from logs (unchanged)
function calculateStats(logs) {
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

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    let todayReviews = 0;
    let yesterdayReviews = 0;
    let thisMonthReviews = 0;
    let lastMonthReviews = 0;
    let lengthDistribution = { short: 0, medium: 0, large: 0 };
    let regeneratedCount = 0;
    let dailyData = {};

    logs.forEach(log => {
        let logDate;
        if (typeof log.timestamp === 'string') {
            if (log.timestamp.includes('[')) {
                const dateArray = JSON.parse(log.timestamp.replace(/\[|\]/g, '').split(',').map(n => parseInt(n.trim())));
                logDate = new Date(dateArray[0], dateArray[1] - 1, dateArray[2], dateArray[3] || 0, dateArray[4] || 0, dateArray[5] || 0);
            } else {
                logDate = new Date(log.timestamp);
            }
        } else if (Array.isArray(log.timestamp)) {
            logDate = new Date(log.timestamp[0], log.timestamp[1] - 1, log.timestamp[2], log.timestamp[3] || 0, log.timestamp[4] || 0, log.timestamp[5] || 0);
        } else {
            logDate = new Date(log.timestamp);
        }

        if (isNaN(logDate.getTime())) {
            console.warn('Invalid date for log:', log);
            return;
        }

        const logDateOnly = new Date(logDate.getFullYear(), logDate.getMonth(), logDate.getDate());

        if (logDateOnly.getTime() === today.getTime()) {
            todayReviews++;
        }

        if (logDateOnly.getTime() === yesterday.getTime()) {
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

        const dateKey = logDateOnly.toISOString().split('T')[0];
        dailyData[dateKey] = (dailyData[dateKey] || 0) + 1;
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
        dailyData,
        recentActivity
    };
}

// Simplified helper function to calculate dynamic stepSize
function calculateStepSize(maxValue) {
    if (maxValue <= 0) return { stepSize: 1, suggestedMax: 5 };

    // Aim for 4-6 ticks
    const rawStep = maxValue / 5;
    const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)));
    let stepSize = Math.ceil(rawStep / magnitude) * magnitude;

    // Adjust stepSize for small values
    if (maxValue < 10) {
        stepSize = 1;
    } else if (maxValue < 50) {
        stepSize = Math.ceil(rawStep / 2) * 2; // Round to nearest even number
    } else if (maxValue < 100) {
        stepSize = 10;
    } else if (maxValue < 500) {
        stepSize = 50;
    } else {
        stepSize = 100;
    }

    const suggestedMax = Math.ceil(maxValue / stepSize) * stepSize + stepSize;

    return { stepSize, suggestedMax };
}

// Create weekly chart
function createWeeklyChart(weeklyData) {
    const ctx = document.getElementById('combinedChart');
    if (!ctx) return;

    if (combinedChartInstance) {
        combinedChartInstance.destroy();
    }

    const labels = [];
    const data = [];

    Object.keys(weeklyData).sort().forEach(dateKey => {
        labels.push(weeklyData[dateKey].dayName);
        data.push(weeklyData[dateKey].count);
    });

    const maxValue = Math.max(...data, 1);
    const { stepSize, suggestedMax } = calculateStepSize(maxValue);

    const isDark = document.body.classList.contains('dark');
    const textColor = isDark ? '#f9fafb' : '#1f2937';
    const gridColor = isDark ? '#374151' : '#e5e7eb';

    combinedChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Daily Reviews',
                data: data,
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
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 500, // Reduced animation duration
                easing: 'easeOutQuad',
                scale: false // Disable scale animation to prevent size jumps
            },
            plugins: {
                legend: {
                    display: false
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
        }
    });
}

// Create monthly chart
function createMonthlyChart(monthlyData) {
    const ctx = document.getElementById('combinedChart');
    if (!ctx) return;

    if (combinedChartInstance) {
        combinedChartInstance.destroy();
    }

    const labels = [];
    const data = [];

    const weeklyGrouped = {};
    let currentWeek = 1;
    let weekStart = 1;

    Object.keys(monthlyData).sort().forEach((dateKey, index) => {
        const day = monthlyData[dateKey].day;
        const date = new Date(dateKey);
        const weekDay = date.getDay();

        if (weekDay === 0 || index === 0) {
            if (index > 0) currentWeek++;
            weekStart = day;
        }

        const weekLabel = `Week ${currentWeek}`;
        if (!weeklyGrouped[weekLabel]) {
            weeklyGrouped[weekLabel] = 0;
        }
        weeklyGrouped[weekLabel] += monthlyData[dateKey].count;
    });

    const useDailyView = Object.keys(monthlyData).length <= 31;

    if (useDailyView && Object.keys(monthlyData).length <= 15) {
        const sortedDates = Object.keys(monthlyData).sort().slice(-15);
        sortedDates.forEach(dateKey => {
            labels.push(`${monthlyData[dateKey].day}`);
            data.push(monthlyData[dateKey].count);
        });
    } else {
        Object.keys(weeklyGrouped).forEach(weekLabel => {
            labels.push(weekLabel);
            data.push(weeklyGrouped[weekLabel]);
        });
    }

    const maxValue = Math.max(...data, 1);
    const { stepSize, suggestedMax } = calculateStepSize(maxValue);

    const isDark = document.body.classList.contains('dark');
    const textColor = isDark ? '#f9fafb' : '#1f2937';
    const gridColor = isDark ? '#374151' : '#e5e7eb';

    combinedChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: useDailyView ? 'Daily Reviews' : 'Weekly Reviews',
                data: data,
                backgroundColor: 'rgba(99, 102, 241, 0.6)',
                borderColor: '#6366f1',
                borderWidth: 2,
                borderRadius: 8,
                borderSkipped: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 500, // Reduced animation duration
                easing: 'easeOutQuad',
                scale: false // Disable scale animation
            },
            plugins: {
                legend: {
                    display: false
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
        }
    });
}

// Update button states (unchanged)
function updateButtonStates(activeButton) {
    const weeklyBtn = document.getElementById('weeklyBtn');
    const monthlyBtn = document.getElementById('monthlyBtn');

    if (!weeklyBtn || !monthlyBtn) return;

    weeklyBtn.className = 'px-3 py-1 text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors';
    monthlyBtn.className = 'px-3 py-1 text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors';

    if (activeButton === 'weekly') {
        weeklyBtn.className = 'px-3 py-1 text-sm bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-lg transition-colors';
        const chartTitle = document.getElementById('chartTitle');
        if (chartTitle) chartTitle.textContent = "This Week's Review Generation";
    } else {
        monthlyBtn.className = 'px-3 py-1 text-sm bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-lg transition-colors';
        const chartTitle = document.getElementById('chartTitle');
        if (chartTitle) chartTitle.textContent = "This Month's Review Generation";
    }
}

// Load weekly chart
function loadWeeklyChart() {
    currentView = 'weekly';
    updateButtonStates('weekly');

    if (clientLogs.length > 0) {
        const weeklyStats = calculateWeeklyStats(clientLogs);
        createWeeklyChart(weeklyStats);
    } else {
        const emptyWeeklyData = {};
        const startOfWeek = getStartOfWeek();
        const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

        for (let i = 0; i < 7; i++) {
            const date = new Date(startOfWeek);
            date.setDate(startOfWeek.getDate() + i);
            const dateKey = date.toISOString().split('T')[0];
            emptyWeeklyData[dateKey] = {
                count: 0,
                dayName: daysOfWeek[i]
            };
        }
        createWeeklyChart(emptyWeeklyData);
    }
}

// Load monthly chart
function loadMonthlyChart() {
    currentView = 'monthly';
    updateButtonStates('monthly');

    if (clientLogs.length > 0) {
        const monthlyStats = calculateMonthlyStats(clientLogs);
        createMonthlyChart(monthlyStats);
    } else {
        const emptyMonthlyData = {};
        const now = new Date();
        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(now.getFullYear(), now.getMonth(), day);
            const dateKey = date.toISOString().split('T')[0];
            emptyMonthlyData[dateKey] = {
                count: 0,
                day: day
            };
        }
        createMonthlyChart(emptyMonthlyData);
    }
}

// Create combined chart
function createCombinedChart(stats) {
    if (currentView === 'weekly') {
        const weeklyStats = calculateWeeklyStats(clientLogs);
        createWeeklyChart(weeklyStats);
    } else {
        const monthlyStats = calculateMonthlyStats(clientLogs);
        createMonthlyChart(monthlyStats);
    }
}

// Update change indicator (unchanged)
function updateChangeIndicator(changeElementId, percentElementId, changeValue) {
    const changeElement = document.getElementById(changeElementId);
    const percentElement = document.getElementById(percentElementId);

    if (!changeElement || !percentElement) return;

    const isPositive = changeValue >= 0;
    const icon = changeElement.querySelector('i');

    if (icon) {
        icon.className = isPositive ? 'fas fa-arrow-up mr-1' : 'fas fa-arrow-down mr-1';
    }

    changeElement.className = isPositive ?
        'text-green-500 flex items-center text-sm' :
        'text-red-500 flex items-center text-sm';

    percentElement.textContent = Math.abs(changeValue) + '%';
}

// Update dashboard statistics (unchanged)
function updateDashboardStats(logs) {
    const stats = calculateStats(logs);

    document.getElementById('totalReviewsCount').textContent = stats.totalReviews;
    document.getElementById('avgLength').textContent = stats.avgLength;
    document.getElementById('todayReviewsCount').textContent = stats.todayReviews;
    document.getElementById('thisMonthCount').textContent = stats.thisMonthReviews;

    const totalReviewsChange = stats.lastMonthReviews > 0 ?
        (((stats.thisMonthReviews - stats.lastMonthReviews) / stats.lastMonthReviews) * 100).toFixed(1) : 0;
    const todayReviewsChange = stats.yesterdayReviews > 0 ?
        (((stats.todayReviews - stats.yesterdayReviews) / stats.yesterdayReviews) * 100).toFixed(1) : 0;

    updateChangeIndicator('totalReviewsChange', 'totalReviewsPercent', totalReviewsChange);
    updateChangeIndicator('todayReviewsChange', 'todayReviewsPercent', todayReviewsChange);
    updateChangeIndicator('thisMonthChange', 'thisMonthPercent', totalReviewsChange);

    const totalLengthReviews = stats.lengthDistribution.short + stats.lengthDistribution.medium + stats.lengthDistribution.large;
    let avgLengthPercent = 50;

    if (totalLengthReviews > 0) {
        if (stats.avgLength === 'Short') avgLengthPercent = 25;
        else if (stats.avgLength === 'Medium') avgLengthPercent = 65;
        else if (stats.avgLength === 'Large') avgLengthPercent = 90;
    }

    document.getElementById('avgLengthBar').style.width = avgLengthPercent + '%';
    document.getElementById('avgLengthPercent').textContent = avgLengthPercent + '%';

    document.getElementById('mostCommonLength').textContent = stats.avgLength;
    document.getElementById('mostCommonPercent').textContent =
        totalLengthReviews > 0 ? Math.round((Math.max(...Object.values(stats.lengthDistribution)) / totalLengthReviews) * 100) : 0;

    document.getElementById('shortReviewsCount').textContent = stats.lengthDistribution.short;
    document.getElementById('shortReviewsPercent').textContent =
        stats.totalReviews > 0 ? Math.round((stats.lengthDistribution.short / stats.totalReviews) * 100) + '% of total' : '0% of total';

    document.getElementById('longReviewsCount').textContent = stats.lengthDistribution.large;
    document.getElementById('longReviewsPercent').textContent =
        stats.totalReviews > 0 ? Math.round((stats.lengthDistribution.large / stats.totalReviews) * 100) + '% of total' : '0% of total';

    document.getElementById('regeneratedCount').textContent = stats.regeneratedCount + ' reviews';

    updateRecentActivity(stats.recentActivity);

    return stats;
}

// Update recent activity (unchanged)
function updateRecentActivity(recentActivity) {
    const container = document.getElementById('recentActivity');
    if (!container) return;

    if (recentActivity.length === 0) {
        container.innerHTML = '<p class="text-gray-500 dark:text-gray-400 text-center py-4">No recent activity</p>';
        return;
    }

    container.innerHTML = recentActivity.map(activity => {
        let date;
        if (typeof activity.timestamp === 'string') {
            if (activity.timestamp.includes('[')) {
                const dateArray = JSON.parse(activity.timestamp.replace(/\[|\]/g, '').split(',').map(n => parseInt(n.trim())));
                date = new Date(dateArray[0], dateArray[1] - 1, dateArray[2], dateArray[3] || 0, dateArray[4] || 0, dateArray[5] || 0);
            } else {
                date = new Date(activity.timestamp);
            }
        } else if (Array.isArray(activity.timestamp)) {
            date = new Date(activity.timestamp[0], activity.timestamp[1] - 1, activity.timestamp[2], activity.timestamp[3] || 0, activity.timestamp[4] || 0, activity.timestamp[5] || 0);
        } else {
            date = new Date(activity.timestamp);
        }

        const timeAgo = getTimeAgo(date);
        const regenerated = activity.regenerated ? activity.regenerated.toLowerCase() : 'no';
        const isRegenerated = regenerated === 'yes' || regenerated === 'true' || regenerated === true;
        const icon = isRegenerated ? 'fa-redo text-amber-500' : 'fa-plus text-green-500';

        return `
            <div class="flex items-center space-x-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors">
                <div class="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                    <i class="fas ${icon} text-sm"></i>
                </div>
                <div class="flex-1">
                    <p class="text-sm font-medium">
                        ${isRegenerated ? 'Regenerated' : 'Generated'} ${activity.reviewLength || 'medium'} review
                    </p>
                    <p class="text-xs text-gray-500 dark:text-gray-400">${timeAgo}</p>
                </div>
                <div class="text-xs text-gray-400 dark:text-gray-500">
                    ${activity.companyName ? activity.companyName.substring(0, 10) + (activity.companyName.length > 10 ? '...' : '') : ''}
                </div>
            </div>
        `;
    }).join('');
}

// Get time ago string (unchanged)
function getTimeAgo(date) {
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return Math.floor(diffInSeconds / 60) + ' min ago';
    if (diffInSeconds < 86400) return Math.floor(diffInSeconds / 3600) + ' hours ago';
    if (diffInSeconds < 2592000) return Math.floor(diffInSeconds / 86400) + ' days ago';
    return Math.floor(diffInSeconds / 2592000) + ' months ago';
}

// Create donut chart
function createDonutChart(stats) {
    const ctx = document.getElementById('donutChart');
    if (!ctx) return;

    if (donutChartInstance) {
        donutChartInstance.destroy();
    }

    const data = [
        stats.lengthDistribution.short,
        stats.lengthDistribution.medium,
        stats.lengthDistribution.large
    ];

    donutChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
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
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 500, // Reduced animation duration
                easing: 'easeOutQuad'
            },
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: document.body.classList.contains('dark') ? '#f9fafb' : '#1f2937',
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
        }
    });
}

// Initialize dashboard
async function initializeDashboard() {
    try {
        console.log('Initializing dashboard...');
        document.body.style.opacity = '0.7';

        const logs = await fetchLogData();
        const stats = updateDashboardStats(logs);
        createCombinedChart(stats);
        createDonutChart(stats);

        await fetchClientData();
        document.body.style.opacity = '1';
    } catch (error) {
        console.error('Error initializing dashboard:', error);
        document.body.style.opacity = '1';

        const errorMessage = document.createElement('div');
        errorMessage.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
        errorMessage.textContent = 'Failed to load dashboard data. Please refresh the page.';
        document.body.appendChild(errorMessage);

        setTimeout(() => {
            errorMessage.remove();
        }, 5000);
    }
}

// Theme change listener
const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
            if (clientLogs.length > 0) {
                const stats = calculateStats(clientLogs);
                createCombinedChart(stats);
                createDonutChart(stats);
            }
        }
    });
});

observer.observe(document.body, {
    attributes: true,
    attributeFilter: ['class']
});

// Resize handler to maintain chart size
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        if (combinedChartInstance) {
            combinedChartInstance.resize();
        }
        if (donutChartInstance) {
            donutChartInstance.resize();
        }
    }, 200);
});

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeDashboard);

// Refresh dashboard every 5 minutes
setInterval(() => {
    console.log('Auto-refreshing dashboard...');
    initializeDashboard();
}, 5 * 60 * 1000);