import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const ClientCard = ({ client, onDelete, index = 0 }) => {
  const [imgError, setImgError] = useState(false);

  const getInitials = (name) => {
    if (!name) return 'C';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div
      className="
        card
        overflow-hidden
        group
        hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-slate-900/50
        motion-slow
        hover:-translate-y-1
        animate-fade-in
      "
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="h-24 bg-gradient-to-br from-primary-500 via-secondary-700 to-primary-600 relative overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 to-transparent"></div>

        <div className="absolute -bottom-8 left-4">
          <div className="w-16 h-16 rounded-xl bg-white dark:bg-slate-800 p-1.5 shadow-xl ring-4 ring-white dark:ring-slate-800">
            {client.logo && !imgError ? (
              <img
                src={`/uploads/${client.logo}`}
                alt={client.name}
                className="w-full h-full rounded-lg object-cover"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="w-full h-full rounded-lg bg-gradient-to-br from-primary-100 to-secondary-400 dark:from-primary-600/30 dark:to-secondary-700/30 flex items-center justify-center">
                <span className="text-primary-600 dark:text-primary-400 font-bold text-lg">
                  {getInitials(client.name)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="pt-12 px-5 pb-5">
        <h3 className="font-bold text-slate-900 dark:text-white text-lg truncate" title={client.name}>
          {client.name}
        </h3>

        <p className="text-sm text-slate-500 dark:text-slate-400 truncate mb-4" title={client.email}>
          {client.email || 'No email provided'}
        </p>

        <div className="space-y-2 mb-5">
          <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
              <i className="fas fa-phone text-xs text-slate-500 dark:text-slate-400"></i>
            </div>
            <span className="truncate">{client.mobile || 'No mobile'}</span>
          </div>

          {client.reviewLink && (
            <div className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
                <i className="fas fa-link text-xs text-slate-500 dark:text-slate-400"></i>
              </div>
              <a
                href={client.reviewLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-600 dark:text-primary-400 hover:underline truncate"
              >
                Review Link
              </a>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Link
            to={`/user/view/${client.id}`}
            className="flex-1 py-2 rounded-xl bg-primary-100 dark:bg-primary-600/10 hover:bg-primary-100 dark:hover:bg-primary-600/20 text-primary-600 dark:text-primary-400 text-sm font-semibold motion-fast text-center flex items-center justify-center gap-1.5"
            title="View client"
          >
            <i className="fas fa-eye text-xs"></i>
            <span className="hidden sm:inline">View</span>
          </Link>

          <Link
            to={`/user/edit/${client.id}`}
            className="flex-1 py-2 rounded-xl bg-amber-100 dark:bg-amber-500/10 hover:bg-amber-200 dark:hover:bg-amber-500/20 text-amber-600 dark:text-amber-500 text-sm font-semibold motion-fast text-center flex items-center justify-center gap-1.5"
            title="Edit client"
          >
            <i className="fas fa-pen text-xs"></i>
            <span className="hidden sm:inline">Edit</span>
          </Link>

          <button
            onClick={onDelete}
            className="flex-1 py-2 rounded-xl bg-red-100 dark:bg-red-500/10 hover:bg-red-200 dark:hover:bg-red-500/20 text-red-600 dark:text-red-500 text-sm font-semibold motion-fast flex items-center justify-center gap-1.5"
            title="Delete client"
          >
            <i className="fas fa-trash-can text-xs"></i>
            <span className="hidden sm:inline">Delete</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export const ClientCardSkeleton = () => (
  <div className="card overflow-hidden">
    <div className="h-24 shimmer"></div>
    <div className="pt-12 px-5 pb-5">
      <div className="h-6 w-3/4 shimmer rounded mb-2"></div>
      <div className="h-4 w-1/2 shimmer rounded mb-4"></div>
      <div className="space-y-2 mb-5">
        <div className="h-8 shimmer rounded-lg"></div>
        <div className="h-8 shimmer rounded-lg"></div>
      </div>
      <div className="flex gap-2">
        <div className="flex-1 h-10 shimmer rounded-xl"></div>
        <div className="flex-1 h-10 shimmer rounded-xl"></div>
        <div className="flex-1 h-10 shimmer rounded-xl"></div>
      </div>
    </div>
  </div>
);

export default ClientCard;

