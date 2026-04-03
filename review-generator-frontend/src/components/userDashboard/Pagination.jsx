import React from 'react';

const Pagination = ({ currentPage, totalPages, totalItems, currentItemsCount, onPageChange }) => {
  if (totalItems <= 0) {
    return null;
  }

  const pages = [];
  const showEllipsis = totalPages > 7;

  if (!showEllipsis) {
    for (let i = 0; i < totalPages; i += 1) pages.push(i);
  } else {
    const startPage = Math.max(0, currentPage - 3);
    const endPage = Math.min(totalPages - 1, currentPage + 3);

    if (startPage > 0) {
      pages.push(0);
      if (startPage > 1) pages.push('ellipsis-start');
    }

    for (let i = startPage; i <= endPage; i += 1) {
      pages.push(i);
    }

    if (endPage < totalPages - 1) {
      if (endPage < totalPages - 2) pages.push('ellipsis-end');
      pages.push(totalPages - 1);
    }
  }

  const disabledClass = 'opacity-50 pointer-events-none';

  return (
    <section className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-lg">
      <nav aria-label="Page navigation" className="mb-4">
        <ul className="flex flex-wrap justify-center gap-2">
          <li className={currentPage === 0 ? disabledClass : ''}>
            <button type="button" onClick={() => onPageChange(0)} className="rounded-lg bg-slate-100 px-4 py-2 font-medium text-slate-700 transition-all duration-300 hover:bg-slate-200">
              First
            </button>
          </li>
          <li className={currentPage === 0 ? disabledClass : ''}>
            <button type="button" onClick={() => onPageChange(currentPage - 1)} className="rounded-lg bg-slate-100 px-4 py-2 font-medium text-slate-700 transition-all duration-300 hover:bg-slate-200">
              Prev
            </button>
          </li>

          {pages.map((page, index) => (
            <li key={`${page}-${index}`}>
              {typeof page === 'string' ? (
                <span className="px-4 py-2 text-slate-400">...</span>
              ) : (
                <button
                  type="button"
                  onClick={() => onPageChange(page)}
                  className={[
                    'rounded-lg px-4 py-2 font-medium transition-all duration-300',
                    page === currentPage
                      ? 'bg-indigo-500 text-white shadow-lg'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200',
                  ].join(' ')}
                >
                  {page + 1}
                </button>
              )}
            </li>
          ))}

          <li className={currentPage === totalPages - 1 ? disabledClass : ''}>
            <button type="button" onClick={() => onPageChange(currentPage + 1)} className="rounded-lg bg-slate-100 px-4 py-2 font-medium text-slate-700 transition-all duration-300 hover:bg-slate-200">
              Next
            </button>
          </li>
          <li className={currentPage === totalPages - 1 ? disabledClass : ''}>
            <button type="button" onClick={() => onPageChange(totalPages - 1)} className="rounded-lg bg-slate-100 px-4 py-2 font-medium text-slate-700 transition-all duration-300 hover:bg-slate-200">
              Last
            </button>
          </li>
        </ul>
      </nav>

      <div className="rounded-lg bg-slate-50 px-4 py-3 text-center text-slate-600">
        Showing <span className="font-semibold text-slate-800">{currentItemsCount}</span> of{' '}
        <span className="font-semibold text-slate-800">{totalItems}</span> items
        (Page <span className="font-semibold text-indigo-500">{currentPage + 1}</span> of{' '}
        <span className="font-semibold text-indigo-500">{totalPages}</span>)
      </div>
    </section>
  );
};

export default Pagination;
