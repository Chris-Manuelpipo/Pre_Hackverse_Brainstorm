const variants = {
  primary: 'bg-primary-100 text-primary-700 border border-primary-200',
  success: 'bg-success-100 text-success-700 border border-success-200',
  warning: 'bg-warning-100 text-warning-700 border border-warning-200',
  error: 'bg-error-100 text-error-700 border border-error-200',
  default: 'bg-dark-100 text-dark-600 border border-dark-200',
};

const Badge = ({ children, variant = 'primary', className = '' }) => {
  return (
    <span className={`badge ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

const Badge = ({ children, variant = 'primary', className = '' }) => {
  return (
    <span className={`badge ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;