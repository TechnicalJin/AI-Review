// Global variables
let combinedChartInstance = null;
let donutChartInstance = null;
let clientLogs = [];

// Theme toggle
document.getElementById('theme-toggle').addEventListener('click', function() {
    document.body.classList.toggle('dark');
    localStorage.setItem('theme', document.body.classList.contains('dark') ? 'dark' : 'light');
});

// Load saved theme
if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark');
}

// Mobile menu
const sidebar = document.getElementById('sidebar');
const mobileMenuButton = document.getElementById('mobileMenuButton');

mobileMenuButton?.addEventListener('click', () => {
    sidebar.classList.toggle('open');
    sidebar.classList.toggle('hidden');
});

// Close sidebar when clicking outside on mobile
document.addEventListener('click', (e) => {
    if (window.innerWidth < 768 && !sidebar.contains(e.target) && !mobileMenuButton.contains(e.target)) {
        sidebar.classList.add('hidden');
        sidebar.classList.remove('open');
    }
});

// Profile Modal Functions
function openProfileModal() {
    const modal = document.getElementById('profileModal');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    fetchClientData(); // Fetch latest client data when opening modal
}

function closeProfileModal() {
    const modal = document.getElementById('profileModal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
}

// Close modal when clicking outside
document.getElementById('profileModal')?.addEventListener('click', function(e) {
    if (e.target === this) {
        closeProfileModal();
    }
});

// Fetch client data
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
        // Fallback to mock data if API fails
        const mockClient = {
            name: 'Demo Client',
            email: 'demo@example.com',
            mobile: '+1234567890'
        };
        document.getElementById('clientUsername').textContent = mockClient.name;
        document.getElementById('clientCompanyName').textContent = mockClient.name;
        document.getElementById('clientEmail').textContent = mockClient.email;
        document.getElementById('clientMobile').textContent = mockClient.mobile;
        return mockClient;
    }
}

// Fetch log data
async function fetchLogData() {
    try {
        const response = await fetch('/client/logs');
        if (!response.ok) throw new Error('Failed to fetch logs');
        const logs = await response.json();
        clientLogs = logs;
        return logs;
    } catch (error) {
        console.error('Error fetching logs:', error);
        // Return mock data if API fails
        return generateMockLogs();
    }
}

// Generate mock logs for demonstration
function generateMockLogs() {
    const mockLogs = [];
    const now = new Date();
    const reviewLengths = ['short', 'medium', 'large'];
    const regeneratedOptions = ['yes', 'no'];

    for (let i = 0; i < 50; i++) {
        const daysAgo = Math.floor(Math.random() * 30);
        const timestamp = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);

        mockLogs.push({
            id: i + 1,
            timestamp: timestamp.toISOString(),
            reviewLength: reviewLengths[Math.floor(Math.random() * reviewLengths.length)],
            regenerated: regeneratedOptions[Math.floor(Math.random() * regeneratedOptions.length)],
            reviewText: `Sample review text ${i + 1}`,
            rating: Math.floor(Math.random() * 5) + 1
        });
    }

    return mockLogs.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
}

// Calculate statistics from logs
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
            dailyData: [],
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
        const logDate = new Date(log.timestamp);
        const logDateOnly = new Date(logDate.getFullYear(), logDate.getMonth(), logDate.getDate());

        // Today's reviews
        if (logDateOnly.getTime() === today.getTime()) {
            todayReviews++;
        }

        // Yesterday's reviews
        if (logDateOnly.getTime() === yesterday.getTime()) {
            yesterdayReviews++;
        }

        // This month's reviews
        if (logDate >= thisMonth) {
            thisMonthReviews++;
        }

        // Last month's reviews
        if (logDate >= lastMonth && logDate <= lastMonthEnd) {
            lastMonthReviews++;
        }

        // Length distribution
        if (lengthDistribution.hasOwnProperty(log.reviewLength)) {
            lengthDistribution[log.reviewLength]++;
        }

        // Regenerated count
        if (log.regenerated === 'yes') {
            regeneratedCount++;
        }

        // Daily data for chart (last 30 days)
        const dateKey = logDateOnly.toISOString().split('T')[0];
        dailyData[dateKey] = (dailyData[dateKey] || 0) + 1;
    });

    // Most common length
    let avgLength = 'Medium';
    let maxCount = Math.max(lengthDistribution.short, lengthDistribution.medium, lengthDistribution.large);
    if (lengthDistribution.short === maxCount) avgLength = 'Short';
    else if (lengthDistribution.large === maxCount) avgLength = 'Large';

    // Recent activity (last 5 logs)
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

// Update change indicator
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

// Update dashboard statistics
function updateDashboardStats(logs) {
    const stats = calculateStats(logs);

    // Update cards
    document.getElementById('totalReviewsCount').textContent = stats.totalReviews;
    document.getElementById('avgLength').textContent = stats.avgLength;
    document.getElementById('todayReviewsCount').textContent = stats.todayReviews;
    document.getElementById('thisMonthCount').textContent = stats.thisMonthReviews;

    // Calculate percentage changes
    const totalReviewsChange = stats.lastMonthReviews > 0 ?
        (((stats.thisMonthReviews - stats.lastMonthReviews) / stats.lastMonthReviews) * 100).toFixed(1) : 0;
    const todayReviewsChange = stats.yesterdayReviews > 0 ?
        (((stats.todayReviews - stats.yesterdayReviews) / stats.yesterdayReviews) * 100).toFixed(1) : 0;

    // Update change indicators
    updateChangeIndicator('totalReviewsChange', 'totalReviewsPercent', totalReviewsChange);
    updateChangeIndicator('todayReviewsChange', 'todayReviewsPercent', todayReviewsChange);
    updateChangeIndicator('thisMonthChange', 'thisMonthPercent', totalReviewsChange);

    // Update average length bar
    const totalLengthReviews = stats.lengthDistribution.short + stats.lengthDistribution.medium + stats.lengthDistribution.large;
    let avgLengthPercent = 50; // Default

    if (totalLengthReviews > 0) {
        if (stats.avgLength === 'Short') avgLengthPercent = 25;
        else if (stats.avgLength === 'Medium') avgLengthPercent = 65;
        else if (stats.avgLength === 'Large') avgLengthPercent = 90;
    }

    document.getElementById('avgLengthBar').style.width = avgLengthPercent + '%';
    document.getElementById('avgLengthPercent').textContent = avgLengthPercent + '%';

    // Update length distribution details
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

    // Update recent activity
    updateRecentActivity(stats.recentActivity);

    return stats;
}

// Update recent activity section
function updateRecentActivity(recentActivity) {
    const container = document.getElementById('recentActivity');
    if (!container) return;

    if (recentActivity.length === 0) {
        container.innerHTML = '<p class="text-gray-500 dark:text-gray-400 text-center py-4">No recent activity</p>';
        return;
    }

    container.innerHTML = recentActivity.map(activity => {
        const date = new Date(activity.timestamp);
        const timeAgo = getTimeAgo(date);
        const icon = activity.regenerated === 'yes' ? 'fa-redo text-amber-500' : 'fa-plus text-green-500';

        return `
            <div class="flex items-center space-x-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors">
                <div class="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                    <i class="fas ${icon} text-sm"></i>
                </div>
                <div class="flex-1">
                    <p class="text-sm font-medium">
                        ${activity.regenerated === 'yes' ? 'Regenerated' : 'Generated'} ${activity.reviewLength} review
                    </p>
                    <p class="text-xs text-gray-500 dark:text-gray-400">${timeAgo}</p>
                </div>
                <div class="text-xs text-gray-400 dark:text-gray-500">
                    ${activity.rating ? `★ ${activity.rating}` : ''}
                </div>
            </div>
        `;
    }).join('');
}

// Get time ago string
function getTimeAgo(date) {
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return Math.floor(diffInSeconds / 60) + ' min ago';
    if (diffInSeconds < 86400) return Math.floor(diffInSeconds / 3600) + ' hour ago';
    if (diffInSeconds < 2592000) return Math.floor(diffInSeconds / 86400) + ' day ago';
    return Math.floor(diffInSeconds / 2592000) + ' month ago';
}

// Create combined chart (line chart for daily reviews)
function createCombinedChart(stats) {
    const ctx = document.getElementById('combinedChart');
    if (!ctx) return;

    if (combinedChartInstance) {
        combinedChartInstance.destroy();
    }

    // Generate last 7 days data
    const last7Days = [];
    const dailyData = [];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const dateKey = date.toISOString().split('T')[0];
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });

        last7Days.push(dayName);
        dailyData.push(stats.dailyData[dateKey] || 0);
    }

    const isDark = document.body.classList.contains('dark');
    const textColor = isDark ? '#f9fafb' : '#1f2937';
    const gridColor = isDark ? '#374151' : '#e5e7eb';

    combinedChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: last7Days,
            datasets: [{
                label: 'Daily Reviews',
                data: dailyData,
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
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: textColor,
                        stepSize: 1
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
            },
            elements: {
                point: {
                    hoverBackgroundColor: '#6366f1'
                }
            }
        }
    });
}

// Create donut chart for review length distribution
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
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: document.body.classList.contains('dark') ? '#f9fafb' : '#1f2937',
                        padding: 20,
                        usePointStyle: true
                    }
                }
            }
        }
    });
}

// Load monthly chart (placeholder function)
function loadMonthlyChart() {
    // This would load monthly data instead of daily
    // For now, we'll just update the button states
    const buttons = document.querySelectorAll('.px-3.py-1.text-sm');
    buttons.forEach(btn => {
        btn.className = 'px-3 py-1 text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors';
    });
    event.target.className = 'px-3 py-1 text-sm bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-lg';

    // Here you would typically load monthly data and update the chart
    console.log('Loading monthly chart data...');
}

// Initialize dashboard
async function initializeDashboard() {
    try {
        // Show loading state
        document.body.style.opacity = '0.7';

        // Fetch data
        const logs = await fetchLogData();
        clientLogs = logs;

        // Update all dashboard components
        const stats = updateDashboardStats(logs);
        createCombinedChart(stats);
        createDonutChart(stats);

        // Fetch client data for profile
        await fetchClientData();

        // Hide loading state
        document.body.style.opacity = '1';

        console.log('Dashboard initialized successfully');
    } catch (error) {
        console.error('Error initializing dashboard:', error);
        document.body.style.opacity = '1';
    }
}

// Theme change listener for charts
const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
            // Recreate charts with new theme colors
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

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeDashboard);

// Refresh dashboard every 5 minutes
setInterval(() => {
    initializeDashboard();
}, 5 * 60 * 1000);