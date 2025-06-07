// Sidebar active state
const navLinks = document.querySelectorAll('.nav-link');
navLinks.forEach(link => {
  link.addEventListener('click', function() {
    navLinks.forEach(l => l.classList.remove('active'));
    this.classList.add('active');
  });
});

// Profile Modal
const profileModal = document.getElementById('profileModal');
function openProfileModal() { profileModal.classList.remove('hidden'); }
function closeProfileModal() { profileModal.classList.add('hidden'); }
document.getElementById('profileModalClose').onclick = closeProfileModal;
profileModal.addEventListener('click', function(e) { if(e.target === this) closeProfileModal(); });

// History Modal
const historyModal = document.getElementById('historyModal');
function openHistoryModal() { historyModal.classList.remove('hidden'); }
function closeHistoryModal() { historyModal.classList.add('hidden'); }
document.getElementById('historyModalClose').onclick = closeHistoryModal;
historyModal.addEventListener('click', function(e) { if(e.target === this) closeHistoryModal(); });

// Chart.js - Day-wise Review Count
const ctx = document.getElementById('reviewChart').getContext('2d');
const reviewChart = new Chart(ctx, {
  type: 'bar',
  data: {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      label: 'Reviews',
      data: [12, 19, 3, 5, 2, 3, 7],
      backgroundColor: '#6366f1',
      borderRadius: 8,
      borderSkipped: false,
    }]
  },
  options: {
    responsive: true,
    plugins: { legend: { display: false } },
    animation: { duration: 1200, easing: 'easeOutQuart' },
    scales: {
      y: { beginAtZero: true, grid: { color: '#f3f4f6' } },
      x: { grid: { display: false } }
    }
  }
});

// Dummy History Data
const historyData = [
  { date: '2024-06-01', action: 'Login', details: 'Logged in from web' },
  { date: '2024-06-01', action: 'Review', details: 'Submitted a review' },
  { date: '2024-06-02', action: 'Logout', details: 'Logged out' },
  { date: '2024-06-03', action: 'Review', details: 'Submitted a review' },
];
function renderHistoryTable() {
  const tbody = document.getElementById('historyTableBody');
  tbody.innerHTML = historyData.map(row => `<tr><td class='py-2 px-4'>${row.date}</td><td class='py-2 px-4'>${row.action}</td><td class='py-2 px-4'>${row.details}</td></tr>`).join('');
  const modalTbody = document.getElementById('historyModalTableBody');
  modalTbody.innerHTML = tbody.innerHTML;
}
renderHistoryTable();
