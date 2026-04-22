import { forwardRef } from 'react';

const Textarea = forwardRef(({ 
  label,
  error,
  className = '',
  rows = 4,
  ...props 
}, ref) => {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-dark-700">{label}</label>
      )}
      <textarea
        ref={ref}
        rows={rows}
        className={`input resize-none ${error ? 'border-error-500 focus:ring-error-500' : ''} ${className}`}
        {...props}
      />
      {error && (
        <p className="text-sm text-error-600">{error}</p>
      )}
    </div>
  );
});

Textarea.displayName = 'Textarea';

export default Textarea;