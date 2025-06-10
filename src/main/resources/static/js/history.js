    document.addEventListener('DOMContentLoaded', function() {
    initializePage();
});

function initializePage() {
    const urlParams = new URLSearchParams(window.location.search);

    // Initialize filter toggle state
    const hasFilters = Array.from(urlParams.keys()).some(key =>
        key !== 'page' && key !== 'size' && key !== 'search' && key !== 'company' && urlParams.get(key)
    );

    if (hasFilters) {
        showFilters();
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
    initializeDatePicker();

    // Add event listeners
    addEventListeners();
}

function initializeDatePicker() {
    const urlParams = new URLSearchParams(window.location.search);
    const startDate = urlParams.get('startDate');
    const endDate = urlParams.get('endDate');
    let defaultDates = [];

    if (startDate && endDate) {
        defaultDates = [startDate.split('T')[0], endDate.split('T')[0]];
    }

    flatpickr("#dateRange", {
        mode: "range",
        dateFormat: "Y-m-d",
        defaultDate: defaultDates,
        maxDate: "today",
        allowInput: false,
        onChange: function(selectedDates) {
            const startDateInput = document.getElementById('startDate');
            const endDateInput = document.getElementById('endDate');

            if (selectedDates.length === 2) {
                startDateInput.value = selectedDates[0].toISOString().split('T')[0] + 'T00:00:00';
                endDateInput.value = selectedDates[1].toISOString().split('T')[0] + 'T23:59:59';
            } else if (selectedDates.length === 1) {
                startDateInput.value = selectedDates[0].toISOString().split('T')[0] + 'T00:00:00';
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
}

function addEventListeners() {
    // Add enter key support for search
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                searchLogs();
            }
        });
    }

    // Add enter key support for filter inputs
    const filterInputs = document.querySelectorAll('#filter-form input[type="text"]');
    filterInputs.forEach(input => {
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                document.getElementById('filter-form').submit();
            }
        });
    });
}

function toggleFilters() {
    const filterContent = document.querySelector('.filter-content');
    const toggleIcon = document.querySelector('.filter-toggle-icon i');

    if (filterContent.classList.contains('show')) {
        hideFilters();
    } else {
        showFilters();
    }
}

function showFilters() {
    const filterContent = document.querySelector('.filter-content');
    const toggleIcon = document.querySelector('.filter-toggle-icon i');

    filterContent.classList.add('show');
    toggleIcon.classList.add('rotated');
}

function hideFilters() {
    const filterContent = document.querySelector('.filter-content');
    const toggleIcon = document.querySelector('.filter-toggle-icon i');

    filterContent.classList.remove('show');
    toggleIcon.classList.remove('rotated');
}

function updatePageSize(size) {
    const url = new URL(window.location.href);
    url.searchParams.set('size', size);
    url.searchParams.set('page', '0');
    window.location.href = url.toString();
}

function resetFilters() {
    const form = document.getElementById('filter-form');
    if (!form) return;

    // Reset form fields
    const fields = ['reviewLength', 'regenerated', 'keyPoints'];
    fields.forEach(fieldName => {
        const field = form.querySelector(`[name="${fieldName}"]`);
        if (field) {
            field.value = '';
        }
    });

    // Reset hidden date fields
    const startDateField = document.getElementById('startDate');
    const endDateField = document.getElementById('endDate');
    if (startDateField) startDateField.value = '';
    if (endDateField) endDateField.value = '';

    // Clear flatpickr instance
    const dateRangeInput = document.querySelector('#dateRange');
    if (dateRangeInput && dateRangeInput._flatpickr) {
        dateRangeInput._flatpickr.clear();
    }

    // Reset search input
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.value = '';
    }

    // Redirect to clean URL, preserving only company
    const companyInput = form.querySelector('input[name="company"]');
    const company = companyInput ? companyInput.value : '';
    window.location.href = '/client/history' + (company ? '?company=' + encodeURIComponent(company) : '');
}

function searchLogs() {
    const form = document.getElementById('filter-form');
    const searchInput = document.getElementById('search-input');
    if (!form || !searchInput) return;

    const searchTerm = searchInput.value.trim();
    const url = new URL(window.location.href);

    // Preserve existing filter parameters
    const formData = new FormData(form);

    // Update search parameter
    if (searchTerm) {
        url.searchParams.set('search', searchTerm);
    } else {
        url.searchParams.delete('search');
    }

    // Preserve other form parameters
    for (let [key, value] of formData.entries()) {
        if (key !== 'search' && value) {
            url.searchParams.set(key, value);
        }
    }

    // Reset to first page for new search
    url.searchParams.set('page', '0');

    window.location.href = url.toString();
}

// Utility function to get URL parameter
function getUrlParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

// Utility function to update URL parameter
function updateUrlParameter(key, value) {
    const url = new URL(window.location.href);
    if (value) {
        url.searchParams.set(key, value);
    } else {
        url.searchParams.delete(key);
    }
    return url.toString();
}

// Function to handle form submission with current parameters
function submitFormWithParams() {
    const form = document.getElementById('filter-form');
    if (!form) return;

    const formData = new FormData(form);
    const url = new URL(window.location.origin + form.getAttribute('action'));

    // Add all form data to URL
    for (let [key, value] of formData.entries()) {
        if (value) {
            url.searchParams.set(key, value);
        }
    }

    // Add search parameter if exists
    const searchInput = document.getElementById('search-input');
    if (searchInput && searchInput.value.trim()) {
        url.searchParams.set('search', searchInput.value.trim());
    }

    // Reset to first page
    url.searchParams.set('page', '0');

    window.location.href = url.toString();
}

// Enhanced filter toggle with animation
function toggleFiltersWithAnimation() {
    const filterContent = document.querySelector('.filter-content');
    const toggleIcon = document.querySelector('.filter-toggle-icon');

    if (!filterContent || !toggleIcon) return;

    const isVisible = filterContent.classList.contains('show');

    if (isVisible) {
        filterContent.style.maxHeight = filterContent.scrollHeight + 'px';
        setTimeout(() => {
            filterContent.style.maxHeight = '0';
            filterContent.classList.remove('show');
            toggleIcon.classList.remove('rotated');
        }, 10);
    } else {
        filterContent.classList.add('show');
        filterContent.style.maxHeight = '0';
        setTimeout(() => {
            filterContent.style.maxHeight = filterContent.scrollHeight + 'px';
            toggleIcon.classList.add('rotated');
        }, 10);

        setTimeout(() => {
            filterContent.style.maxHeight = 'none';
        }, 300);
    }
}