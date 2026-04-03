import React from 'react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const pages = [];
  const start = Math.max(0, currentPage - 3);
  const end = Math.min(totalPages - 1, currentPage + 3);

  for (let p = start; p <= end; p += 1) pages.push(p);

  const btn =
    'rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-100 hover:text-indigo-600';
  const activeBtn = 'rounded-lg bg-gradient-to-r from-indigo-500 to-violet-500 px-3 py-2 text-sm font-semibold text-white shadow-md';

  return (
    <section className="mb-8 rounded-2xl border border-slate-100 bg-white px-6 py-5 shadow-lg">
      <div className="flex flex-wrap items-center justify-center gap-2">
        <button type="button" className={btn} onClick={() => onPageChange(0)} disabled={currentPage === 0}>
          First
        </button>
        <button type="button" className={btn} onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 0}>
          Prev
        </button>

        {start > 0 && (
          <>
            <button type="button" className={btn} onClick={() => onPageChange(0)}>
              1
            </button>
            {start > 1 && <span className="px-1 text-slate-400">...</span>}
          </>
        )}

        {pages.map((p) => (
          <button key={p} type="button" className={p === currentPage ? activeBtn : btn} onClick={() => onPageChange(p)}>
            {p + 1}
          </button>
        ))}

        {end < totalPages - 1 && (
          <>
            {end < totalPages - 2 && <span className="px-1 text-slate-400">...</span>}
            <button type="button" className={btn} onClick={() => onPageChange(totalPages - 1)}>
              {totalPages}
            </button>
          </>
        )}

        <button
          type="button"
          className={btn}
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages - 1}
        >
          Next
        </button>
        <button
          type="button"
          className={btn}
          onClick={() => onPageChange(totalPages - 1)}
          disabled={currentPage === totalPages - 1}
        >
          Last
        </button>
      </div>
      <div className="mt-3 text-center text-sm font-medium text-slate-600">
        Page <span className="text-slate-900">{currentPage + 1}</span> of <span className="text-slate-900">{totalPages}</span>
      </div>
    </section>
  );
};

export default Pagination;
