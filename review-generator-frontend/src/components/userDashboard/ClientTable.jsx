import React from 'react';
import { Link } from 'react-router-dom';
import TableRow from './TableRow';

const TableRowSkeleton = () => (
  <tr className="animate-pulse">
    <td className="px-6 py-4"><div className="h-4 w-8 rounded bg-slate-200" /></td>
    <td className="px-6 py-4"><div className="h-4 w-28 rounded bg-slate-200" /></td>
    <td className="px-6 py-4"><div className="h-4 w-40 rounded bg-slate-200" /></td>
    <td className="px-6 py-4"><div className="h-4 w-24 rounded bg-slate-200" /></td>
    <td className="px-6 py-4"><div className="h-12 w-12 rounded-lg bg-slate-200" /></td>
    <td className="px-6 py-4"><div className="h-8 w-44 rounded-lg bg-slate-200" /></td>
    <td className="px-6 py-4"><div className="h-8 w-44 rounded-lg bg-slate-200" /></td>
    <td className="px-6 py-4"><div className="h-8 w-36 rounded-lg bg-slate-200" /></td>
  </tr>
);

const ClientTable = ({ loading, clients, searchTerm, onDelete }) => {
  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1120px]">
          <thead className="relative overflow-hidden bg-gradient-to-r from-slate-800 to-slate-700 text-white">
            <tr>
              <th className="border-r border-white/10 px-6 py-4 text-left text-sm font-semibold uppercase tracking-wide">ID</th>
              <th className="border-r border-white/10 px-6 py-4 text-left text-sm font-semibold uppercase tracking-wide">Name</th>
              <th className="border-r border-white/10 px-6 py-4 text-left text-sm font-semibold uppercase tracking-wide">Email</th>
              <th className="border-r border-white/10 px-6 py-4 text-left text-sm font-semibold uppercase tracking-wide">Mobile</th>
              <th className="border-r border-white/10 px-6 py-4 text-left text-sm font-semibold uppercase tracking-wide">Logo</th>
              <th className="border-r border-white/10 px-6 py-4 text-left text-sm font-semibold uppercase tracking-wide">Chat Text</th>
              <th className="border-r border-white/10 px-6 py-4 text-left text-sm font-semibold uppercase tracking-wide">Review Link</th>
              <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, index) => <TableRowSkeleton key={index} />)
            ) : clients.length > 0 ? (
              clients.map((client, index) => (
                <TableRow key={client.id || `${client.email}-${index}`} client={client} index={index} onDelete={onDelete} />
              ))
            ) : (
              <tr>
                <td colSpan={8} className="px-6 py-16 text-center">
                  <div className="inline-block rounded-2xl border-2 border-dashed border-slate-300 bg-gradient-to-r from-slate-100 to-slate-200 p-12">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-200">
                      <span className="text-2xl text-slate-400">📭</span>
                    </div>
                    <h3 className="mb-1 text-lg font-bold text-slate-700">{searchTerm ? 'No clients found' : 'No clients yet'}</h3>
                    <p className="mx-auto mb-6 max-w-xs text-sm text-slate-500">
                      {searchTerm ? 'Try a different search term' : 'Create your first client to get started'}
                    </p>
                    {!searchTerm && (
                      <Link
                        to="/user/create"
                        className="inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-colors hover:bg-indigo-600"
                      >
                        + Create First Client
                      </Link>
                    )}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default ClientTable;
