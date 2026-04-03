import React from 'react';

const TagInput = ({ value, onChange, onAdd, onKeyDown, tags, onRemove, error }) => {
  return (
    <div>
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={onChange}
          onKeyDown={onKeyDown}
          placeholder="Enter tag (use commas for multiple)"
          className="w-full rounded-full border px-3 py-2 pr-12 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
        />
        <button
          type="button"
          onClick={onAdd}
          className="absolute right-2 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full bg-indigo-600 text-white transition-all duration-200 hover:scale-105 hover:bg-indigo-700"
          aria-label="Add tag"
        >
          +
        </button>
      </div>

      <div className="mt-3">
        <p className="mb-2 text-sm font-medium text-slate-700">Selected Tags</p>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="flex items-center gap-2 rounded-full border border-blue-300 bg-blue-100 px-3 py-1 text-sm text-blue-900 transition-transform duration-150 hover:scale-105"
            >
              {tag}
              <button
                type="button"
                onClick={() => onRemove(tag)}
                className="rounded-full px-1 text-blue-700 transition-colors duration-150 hover:text-red-600"
                aria-label={`Remove ${tag}`}
              >
                x
              </button>
            </span>
          ))}
        </div>
      </div>

      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default TagInput;
