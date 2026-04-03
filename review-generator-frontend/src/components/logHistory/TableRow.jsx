import React from 'react';

const lengthBadgeClass = (value) => {
  if (value === 'short') return 'bg-gradient-to-r from-sky-500 to-cyan-400';
  if (value === 'medium') return 'bg-gradient-to-r from-emerald-500 to-teal-400';
  return 'bg-gradient-to-r from-rose-500 to-orange-400';
};

const formatTimestamp = (timestamp) => {
  if (!timestamp) return '-';
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return '-';
  const yyyy = date.getFullYear();
  const mm = `${date.getMonth() + 1}`.padStart(2, '0');
  const dd = `${date.getDate()}`.padStart(2, '0');
  const hh = `${date.getHours()}`.padStart(2, '0');
  const min = `${date.getMinutes()}`.padStart(2, '0');
  return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
};

const TableRow = ({ log }) => {
  return (
    <tr className="group relative border-b border-slate-100 transition-all duration-300 hover:translate-x-1 hover:bg-indigo-50/40">
      <td className="px-6 py-4 text-sm font-semibold text-slate-700">{log.id}</td>
      <td className="px-6 py-4 text-sm font-medium text-slate-800">{log.companyName || '-'}</td>
      <td className="px-6 py-4 text-sm text-slate-600">{formatTimestamp(log.timestamp)}</td>
      <td className="px-6 py-4">
        <span className={`rounded-full px-3 py-1 text-xs font-bold text-white ${lengthBadgeClass(log.reviewLength)}`}>
          {log.reviewLength || '-'}
        </span>
      </td>
      <td className="max-w-[280px] truncate px-6 py-4 text-sm text-slate-600" title={log.keyPoints || ''}>
        {log.keyPoints || '-'}
      </td>
      <td className="px-6 py-4 text-sm font-semibold">
        {log.regenerated === 'yes' ? (
          <span className="text-emerald-600">✓ Yes</span>
        ) : (
          <span className="text-slate-400">✗ No</span>
        )}
      </td>
      <td className="absolute left-0 top-0 h-full w-1 origin-top scale-y-0 bg-indigo-400 transition-transform duration-300 group-hover:scale-y-100" />
    </tr>
  );
};

export default TableRow;
