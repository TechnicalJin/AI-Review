import React from 'react';

/**
 * Responsive grid container for form fields
 * - Desktop: 2 columns, 24px gap
 * - Tablet: 1 column, 24px gap
 * - Mobile: 1 column, 16px gap
 * 
 * Props:
 * - children: grid items/fields
 * - className: additional classes
 */
export const FormGrid = ({ children, className = '' }) => {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 ${className}`}>
      {children}
    </div>
  );
};

/**
 * Form section wrapper with consistent styling
 * Includes header, padding, and border
 * 
 * Props:
 * - title: section title
 * - description: optional section description
 * - icon: optional icon class (e.g., 'fas fa-user')
 * - iconColor: icon color - 'blue' (default) or 'amber' (edit mode)
 * - children: section content
 * - isLast: if true, removes bottom border
 * - className: additional classes
 */
export const FormSection = ({
  title,
  description,
  icon,
  iconColor = 'blue',
  children,
  isLast = false,
  className = ''
}) => {
  const iconColorClass = iconColor === 'amber' ? 'text-amber-500' : 'text-indigo-500';

  return (
    <div
      className={`p-6 lg:p-8 ${
        !isLast ? 'border-b border-slate-200 dark:border-slate-700' : ''
      } ${className}`}
    >
      {/* Header */}
      {title && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            {icon && <i className={`${icon} ${iconColorClass} text-base`}></i>}
            {title}
          </h2>
          {description && (
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              {description}
            </p>
          )}
        </div>
      )}

      {/* Content */}
      {children}
    </div>
  );
};

/**
 * Form field wrapper with optional full-width support
 * Handles alignment and spacing
 * 
 * Props:
 * - children: form control (Input, Select, Textarea, etc.)
 * - fullWidth: if true, spans 2 columns on desktop (md:col-span-2)
 * - className: additional classes
 */
export const FormField = ({ children, fullWidth = false, className = '' }) => {
  return (
    <div className={`${fullWidth ? 'md:col-span-2' : ''} ${className}`}>
      {children}
    </div>
  );
};
