import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

const Select = ({
  label,
  options = [],
  value,
  defaultValue = '',
  onChange,
  onValueChange,
  onBlur,
  name,
  placeholder = 'Sélectionner...',
  error,
  className = '',
  ...rest
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [internalValue, setInternalValue] = useState(defaultValue);
  const ref = useRef(null);
  const buttonRef = useRef(null);
  const menuRef = useRef(null);
  const [menuStyle, setMenuStyle] = useState(null);

  const currentValue = value ?? internalValue;
  const selectedOption = options.find((opt) => String(opt.value) === String(currentValue));

  useEffect(() => {
    if (value !== undefined) {
      setInternalValue(value);
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current?.contains(e.target)) return;
      if (menuRef.current?.contains(e.target)) return;
      setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const updateMenuPosition = () => {
      if (!buttonRef.current) return;
      const rect = buttonRef.current.getBoundingClientRect();
      const viewportPadding = 8;
      const menuHeight = Math.min(options.length * 42, 240);

      let top = rect.bottom + 6;
      if (top + menuHeight > window.innerHeight - viewportPadding) {
        top = Math.max(viewportPadding, rect.top - menuHeight - 6);
      }

      setMenuStyle({
        position: 'fixed',
        top: `${top}px`,
        left: `${rect.left}px`,
        width: `${rect.width}px`,
        zIndex: 70,
      });
    };

    updateMenuPosition();
    window.addEventListener('resize', updateMenuPosition);
    window.addEventListener('scroll', updateMenuPosition, true);

    return () => {
      window.removeEventListener('resize', updateMenuPosition);
      window.removeEventListener('scroll', updateMenuPosition, true);
    };
  }, [isOpen, options.length]);

  const handleChange = (newValue) => {
    setInternalValue(newValue);
    const event = { target: { name, value: newValue } };
    if (onChange) {
      onChange(event);
    }
    if (onValueChange) {
      onValueChange(newValue);
    }
  };

  return (
    <div className={`relative space-y-1.5 ${className}`} ref={ref}>
      {label && (
        <label className="block text-sm font-medium text-dark-700">{label}</label>
      )}
      <div className="relative">
        <button
          ref={buttonRef}
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          onBlur={onBlur}
          name={name}
          className={`input text-left flex items-center justify-between ${isOpen ? 'ring-2 ring-primary-500' : ''}`}
          {...rest}
        >
          <span className={selectedOption ? 'text-dark-900' : 'text-dark-400'}>
            {selectedOption?.label || placeholder}
          </span>
          <svg className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {isOpen && menuStyle && createPortal(
          <div ref={menuRef} style={menuStyle} className="bg-[var(--surface-elevated)] border border-dark-200 rounded-xl shadow-xl max-h-60 overflow-auto animate-fade-in">
            {options.map((option, idx) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  handleChange(option.value);
                  setIsOpen(false);
                }}
                onMouseDown={(e) => e.preventDefault()}
                className={`w-full px-4 py-2.5 text-left hover:bg-primary-50 first:rounded-t-xl last:rounded-b-xl ${
                  String(option.value) === String(currentValue) ? 'bg-primary-50 text-primary-700 font-medium' : 'text-dark-700'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>,
          document.body
        )}
      </div>
      <input type="hidden" name={name} value={currentValue ?? ''} />
      {error && <p className="text-sm text-error-600">{error}</p>}
    </div>
  );
};

export default Select;