import { forwardRef } from 'react';

const Input = forwardRef(({ 
  label,
  error,
  icon,
  className = '',
  ...props 
}, ref) => {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-dark-700">{label}</label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400">
            {icon}
          </span>
        )}
        <input
          ref={ref}
          className={`input ${icon ? 'pl-10' : ''} ${error ? 'border-error-500 focus:ring-error-500' : ''} ${className}`}
          {...props}
        />
      </div>
      {error && (
        <p className="text-sm text-error-600">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
