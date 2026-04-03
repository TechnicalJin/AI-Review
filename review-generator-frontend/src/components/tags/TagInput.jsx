import React from 'react';

const TagInput = ({ value, onChange, onAdd }) => {
  return (
    <div className="mb-6">
      <label
        htmlFor="chatTextInput"
        className="block text-gray-900 mb-2 font-semibold text-sm sm:text-base"
      >
        <i className="fas fa-plus-circle mr-1 text-primary"></i>
        Add New Tag
      </label>

      <div className="relative">
        <input
          type="text"
          id="chatTextInput"
          placeholder="e.g., Billing Inquiry, Technical Support..."
          className="input-modern w-full py-2 sm:py-3 px-3 sm:px-4 pr-10 sm:pr-12 rounded-lg font-medium text-sm sm:text-base"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              onAdd();
            }
          }}
        />
        <button
          type="button"
          className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 btn-primary text-white rounded-full w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center text-xs sm:text-sm hover:scale-105 transition-transform"
          id="addTagBtn"
          onClick={onAdd}
        >
          <i className="fas fa-plus"></i>
        </button>
      </div>

      <p className="mt-1 text-xs text-gray-500 flex items-center">
        <i className="fas fa-info-circle mr-1"></i>
        Type your tag(s) and press Enter or click the '+' button (use commas for multiple tags).
      </p>
    </div>
  );
};

export default TagInput;
