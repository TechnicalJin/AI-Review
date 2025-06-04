document.addEventListener('DOMContentLoaded', function() {
    // Initialize filter toggle
    const urlParams = new URLSearchParams(window.location.search);
    const hasFilters = Array.from(urlParams.keys()).some(key =>
        key !== 'page' && key !== 'size' && key !== 'search'
    );

    // Show filters if they're being used or if it's the first load
    if (hasFilters || !localStorage.getItem('filtersCollapsed')) {
        document.querySelector('.filter-content').classList.add('show');
        document.querySelector('.filter-toggle-icon i').classList.replace('fa-chevron-down', 'fa-chevron-up');
    }

    // Initialize page size selector
    const sizeParam = urlParams.get('size') || '10';
    document.getElementById('entries-per-page').value = sizeParam;

    // Initialize search input
    const searchParam = urlParams.get('search');
    if (searchParam) {
        document.getElementById('search-input').value = searchParam;
    }

    // Initialize Flatpickr for date range
    flatpickr("#dateRange", {
        mode: "range",
        dateFormat: "Y-m-d",
        defaultDate: [urlParams.get('startDate'), urlParams.get('endDate')],
        onChange: function(selectedDates) {
            if (selectedDates.length === 2) {
                document.getElementById('startDate').value = selectedDates[0].toISOString().split('T')[0];
                document.getElementById('endDate').value = selectedDates[1].toISOString().split('T')[0];
            } else {
                document.getElementById('startDate').value = '';
                document.getElementById('endDate').value = '';
            }
        }
    });
});

function updatePageSize(size) {
    const url = new URL(window.location.href);
    url.searchParams.set('size', size);
    url.searchParams.set('page', 0); // Reset to first page
    window.location.href = url.toString();
}

function resetFilters() {
    const form = document.getElementById('filter-form');
    form.querySelector('#company').value = '';
    form.querySelector('#reviewLength').value = '';
    form.querySelector('#regenerated').value = '';
    form.querySelector('#keyPoints').value = '';
    form.querySelector('#startDate').value = '';
    form.querySelector('#endDate').value = '';
    form.querySelector('#dateRange').value = ''; // Clear the visible date range input
    form.submit();
}

function searchLogs() {
    const searchTerm = document.getElementById('search-input').value.trim();
    const url = new URL(window.location.href);

    if (searchTerm) {
        url.searchParams.set('search', searchTerm);
    } else {
        url.searchParams.delete('search');
    }

    url.searchParams.set('page', 0);
    window.location.href = url.toString();
}

function toggleFilters() {
    const filterContent = document.querySelector('.filter-content');
    const toggleIcon = document.querySelector('.filter-toggle-icon i');

    filterContent.classList.toggle('show');

    if (filterContent.classList.contains('show')) {
        toggleIcon.classList.replace('fa-chevron-down', 'fa-chevron-up');
        localStorage.removeItem('filtersCollapsed');
    } else {
        toggleIcon.classList.replace('fa-chevron-up', 'fa-chevron-down');
        localStorage.setItem('filtersCollapsed', 'true');
    }
}

// Add keyboard support for search
document.getElementById('search-input').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        searchLogs();
    }
});