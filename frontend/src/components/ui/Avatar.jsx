const Avatar = ({ 
  src, 
  alt = '', 
  size = 'md', 
  className = '',
  level 
}) => {
  const sizes = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl',
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  };

  const colors = [
    'bg-primary-500',
    'bg-accent-500', 
    'bg-success-500',
    'bg-warning-500',
    'bg-error-500',
  ];
  
  const colorIndex = alt.charCodeAt(0) % colors.length;

  return (
    <div className="relative inline-block">
      {src ? (
        <img
          src={src}
          alt={alt}
          className={`${sizes[size]} rounded-full object-cover ${className}`}
        />
      ) : (
        <div className={`${sizes[size]} ${colors[colorIndex]} rounded-full flex items-center justify-center text-white font-medium ${className}`}>
          {getInitials(alt)}
        </div>
      )}
      {level !== undefined && (
        <span className="absolute -bottom-1 -right-1 bg-primary-600 text-white text-xs font-bold px-1.5 rounded-full border-2 border-white">
          {level}
        </span>
      )}
    </div>
  );
};

export default Avatar;