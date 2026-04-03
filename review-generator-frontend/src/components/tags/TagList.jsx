import React from 'react';
import TagItem from './TagItem';

const TagList = ({ tags, onRemove }) => {
  if (!tags.length) {
    return (
      <div className="selected-tags-area rounded-lg p-4" id="selectedTags">
        <div className="text-gray-500 text-center py-6 animate-pulse-soft">
          <i className="fas fa-tag text-2xl sm:text-3xl mb-3 opacity-50"></i>
          <p className="text-sm sm:text-base font-medium">No tags added yet</p>
          <p className="text-xs">Add tags to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className="selected-tags-area has-tags rounded-lg p-4" id="selectedTags">
      <div className="tags-scroll-container">
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, index) => (
            <TagItem key={`${tag}-${index}`} tag={tag} index={index} onRemove={onRemove} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default TagList;
