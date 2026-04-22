import { useState, useRef, useEffect } from 'react';

const Select = ({ 
  label,
  options = [],
  value,
  onChange,
  placeholder = 'Sélectionner...',
  error,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`space-y-1.5 ${className}`} ref={ref}>
      {label && (
        <label className="block text-sm font-medium text-dark-700">{label}</label>
      )}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`input text-left flex items-center justify-between ${isOpen ? 'ring-2 ring-primary-500' : ''}`}
        >
          <span className={selectedOption ? 'text-dark-900' : 'text-dark-400'}>
            {selectedOption?.label || placeholder}
          </span>
          <svg className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-dark-200 rounded-xl shadow-large max-h-60 overflow-auto animate-fade-in">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-2.5 text-left hover:bg-dark-50 first:rounded-t-xl last:rounded-b-xl ${
                  option.value === value ? 'bg-primary-50 text-primary-700' : 'text-dark-700'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
      {error && <p className="text-sm text-error-600">{error}</p>}
    </div>
  );
};

export default Select;