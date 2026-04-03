import React from 'react';
import { Link } from 'react-router-dom';
import { FiEye, FiEdit2, FiTrash2, FiDownload } from 'react-icons/fi';

const FALLBACK_LOGO =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiByeD0iOCIgZmlsbD0iIzkxQTdCRiIvPgo8cGF0aCBkPSJNMjQgMTJDMjcuMzEzNyAxMiAzMCAxNC42ODYzIDMwIDE4QzMwIDIxLjMxMzcgMjcuMzEzNyAyNCAyNCAyNEMyMC42ODYzIDI0IDE4IDIxLjMxMzcgMTggMThDMTggMTQuNjg2MyAyMC42ODYzIDEyIDI0IDEyWk0yNCAzNkMzMCAzNiAzNiAzMi40IDM2IDI4SDEyQzEyIDMyLjQgMTggMzYgMjQgMzZaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K';

const actionBaseClass =
  'rounded-lg p-2 text-white shadow transition-all duration-300 hover:scale-105 hover:shadow-lg';

const TableRow = ({ client, index, onDelete }) => {
  const logoSrc = client.logo ? `/uploads/${client.logo}` : FALLBACK_LOGO;
  const downloadHref = client.downloadLink || client.generateLink || null;

  return (
    <tr
      className={[
        'group border-b border-slate-200/70 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg',
        index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50',
        'hover:bg-gradient-to-r hover:from-slate-50 hover:to-slate-100',
      ].join(' ')}
    >
      <td className="px-6 py-4 font-medium text-slate-600">{client.id ?? '-'}</td>
      <td className="px-6 py-4">
        <div className="font-medium text-slate-800 break-words">{client.name || '-'}</div>
      </td>
      <td className="px-6 py-4">
        <div className="text-slate-600 break-words">{client.email || '-'}</div>
      </td>
      <td className="px-6 py-4 text-slate-600">{client.mobile || '-'}</td>
      <td className="px-6 py-4">
        <img
          src={logoSrc}
          alt={client.name || 'Client Logo'}
          className="h-12 w-12 rounded-lg object-cover shadow"
          onError={(e) => {
            e.currentTarget.src = FALLBACK_LOGO;
          }}
        />
      </td>
      <td className="px-6 py-4">
        <div
          className="max-w-[220px] cursor-pointer overflow-hidden truncate whitespace-nowrap rounded-lg border-l-4 border-indigo-500 bg-gradient-to-r from-slate-100 to-slate-200 px-3 py-2 text-sm text-slate-600 transition-all duration-300 hover:max-w-[420px] hover:overflow-visible hover:whitespace-normal"
          title={client.chatText || ''}
        >
          {client.chatText || '-'}
        </div>
      </td>
      <td className="px-6 py-4">
        {client.reviewLink ? (
          <a
            href={client.reviewLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block max-w-[170px] cursor-pointer overflow-hidden truncate whitespace-nowrap rounded-lg bg-gradient-to-r from-cyan-500 to-cyan-600 px-3 py-2 text-sm font-medium text-white transition-all duration-300 hover:max-w-[420px] hover:scale-105 hover:overflow-visible hover:whitespace-normal hover:from-cyan-600 hover:to-cyan-700 hover:shadow-lg"
            title={client.reviewLink}
          >
            {client.reviewLink}
          </a>
        ) : (
          <span className="text-slate-400">-</span>
        )}
      </td>
      <td className="px-6 py-4">
        <div className="flex space-x-2">
          <Link to={`/user/view/${client.id}`} className={`${actionBaseClass} bg-emerald-500 hover:bg-emerald-600`} title="View">
            <FiEye />
          </Link>
          <Link to={`/user/edit/${client.id}`} className={`${actionBaseClass} bg-indigo-500 hover:bg-blue-600`} title="Edit">
            <FiEdit2 />
          </Link>
          <button
            type="button"
            onClick={() => onDelete(client)}
            className={`${actionBaseClass} bg-red-500 hover:bg-red-600`}
            title="Delete"
          >
            <FiTrash2 />
          </button>
          {downloadHref ? (
            <a
              href={downloadHref}
              target="_blank"
              rel="noopener noreferrer"
              className={`${actionBaseClass} bg-orange-500 hover:bg-orange-600`}
              title="Download"
            >
              <FiDownload />
            </a>
          ) : (
            <button type="button" disabled className="rounded-lg bg-slate-300 p-2 text-white opacity-60" title="Download unavailable">
              <FiDownload />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
};

export default TableRow;
