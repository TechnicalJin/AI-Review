document.addEventListener('DOMContentLoaded', function() {
    // Initialize filter toggle state
    const urlParams = new URLSearchParams(window.location.search);
    const hasFilters = Array.from(urlParams.keys()).some(key =>
        key !== 'page' && key !== 'size' && key !== 'search' && urlParams.get(key)
    );

    // Show filters if they're being used
    if (hasFilters) {
        const filterContent = document.querySelector('.filter-content');
        const toggleIcon = document.querySelector('.filter-toggle-icon i');
        if (filterContent && toggleIcon) {
            filterContent.classList.add('show');
            toggleIcon.classList.replace('fa-chevron-down', 'fa-chevron-up');
        }
    }

    // Initialize page size selector
    const sizeParam = urlParams.get('size') || '10';
    const entriesSelect = document.getElementById('entries-per-page');
    if (entriesSelect) {
        entriesSelect.value = sizeParam;
    }

    // Initialize search input
    const searchParam = urlParams.get('search');
    const searchInput = document.getElementById('search-input');
    if (searchParam && searchInput) {
        searchInput.value = searchParam;
    }

    // Initialize Flatpickr for date range
    const startDate = urlParams.get('startDate');
    const endDate = urlParams.get('endDate');
    let defaultDates = [];

    if (startDate && endDate) {
        defaultDates = [startDate, endDate];
    }

    flatpickr("#dateRange", {
        mode: "range",
        dateFormat: "Y-m-d",
        defaultDate: defaultDates,
        maxDate: "today",
        onChange: function(selectedDates) {
            const startDateInput = document.getElementById('startDate');
            const endDateInput = document.getElementById('endDate');

            if (selectedDates.length === 2) {
                startDateInput.value = selectedDates[0].toISOString().split('T')[0];
                endDateInput.value = selectedDates[1].toISOString().split('T')[0];
            } else if (selectedDates.length === 1) {
                startDateInput.value = selectedDates[0].toISOString().split('T')[0];
                endDateInput.value = '';
            } else {
                startDateInput.value = '';
                endDateInput.value = '';
            }
        },
        onClose: function(selectedDates) {
            if (selectedDates.length === 0) {
                document.getElementById('startDate').value = '';
                document.getElementById('endDate').value = '';
            }
        }
    });

    // Add enter key support for search
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                searchLogs();
            }
        });
    }
});

function updatePageSize(size) {
    const url = new URL(window.location.href);
    url.searchParams.set('size', size);
    url.searchParams.set('page', 0); // Reset to first page
    window.location.href = url.toString();
}

function resetFilters() {
    const form = document.getElementById('filter-form');
    if (!form) return;

    // Reset all form fields
    const company = form.querySelector('#company');
    const reviewLength = form.querySelector('#reviewLength');
    const regenerated = form.querySelector('#regenerated');
    const keyPoints = form.querySelector('#keyPoints');
    const startDate = form.querySelector('#startDate');
    const endDate = form.querySelector('#endDate');
    const dateRange = form.querySelector('#dateRange');

    if (company) company.value = '';
    if (reviewLength) reviewLength.value = '';
    if (regenerated) regenerated.value = '';
    if (keyPoints) keyPoints.value = '';
    if (startDate) startDate.value = '';
    if (endDate) endDate.value = '';
    if (dateRange) dateRange.value = '';

    // Clear flatpickr instance
    const flatpickrInstance = document.querySelector('#dateRange')._flatpickr;
    if (flatpickrInstance) {
        flatpickrInstance.clear();
    }

    // Reset search input
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.value = '';
    }

    // Submit form or redirect to clean URL
    const url = new URL(window.location.href);
    url.search = '';
    window.location.href = url.toString();
}

function searchLogs() {
    const searchInput = document.getElementById('search-input');
    if (!searchInput) return;

    const searchTerm = searchInput.value.trim();
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

    if (!filterContent || !toggleIcon) return;

    filterContent.classList.toggle('show');

    if (filterContent.classList.contains('show')) {
        toggleIcon.classList.replace('fa-chevron-down', 'fa-chevron-up');
    } else {
        toggleIcon.classList.replace('fa-chevron-up', 'fa-chevron-down');
    }
}