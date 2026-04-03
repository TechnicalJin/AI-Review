import React from 'react';
import TableRow from './TableRow';

const Table = ({ logs, loading, totalElements, emptyTitle = 'No logs found', emptyDescription = 'No logs found matching your current filters. Try adjusting your search criteria.' }) => {
  if (loading) {
    return (
      <section className="mb-8 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-lg">
        <div className="p-12 text-center text-slate-500">Loading logs...</div>
      </section>
    );
  }

  if (!logs.length) {
    return (
      <section className="mb-8 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-lg">
        <div className="p-12 text-center">
          <h3 className="mb-2 text-xl font-semibold text-slate-700">{emptyTitle}</h3>
          <p className="text-slate-500">{emptyDescription}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="mb-8 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-lg">
      <div className="border-b border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100 px-8 py-5">
        <p className="text-base font-semibold text-indigo-600">
          Showing <span>{logs.length}</span> of <span>{totalElements}</span> logs
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[980px]">
          <thead className="sticky top-0 z-10 bg-gradient-to-r from-slate-100 to-slate-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-600">ID</th>
              <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-600">Company</th>
              <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-600">Timestamp</th>
              <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-600">Review Length</th>
              <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-600">Key Points</th>
              <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-600">Regenerated</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <TableRow key={log.id} log={log} />
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default Table;
