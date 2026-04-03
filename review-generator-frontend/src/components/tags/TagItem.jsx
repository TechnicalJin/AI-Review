import React from 'react';

const TagItem = ({ tag, index, onRemove }) => {
  return (
    <div
      className="tag-modern flex items-center px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-sm font-medium animate-tag-bounce"
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      <span className="mr-1.5 sm:mr-2">{tag}</span>
      <button
        type="button"
        className="remove-tag-btn w-5 h-5 flex items-center justify-center rounded-full text-xs"
        onClick={() => onRemove(tag)}
        aria-label={`Remove tag ${tag}`}
      >
        <i className="fas fa-times"></i>
      </button>
    </div>
  );
};

export default TagItem;
