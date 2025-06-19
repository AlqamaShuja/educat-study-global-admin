import React from 'react';

const Switch = ({
  checked = false,
  onChange,
  label,
  disabled = false,
  size = 'medium', // 'small', 'medium', 'large'
  color = 'primary', // 'primary', 'success', 'warning', 'danger'
  labelPosition = 'right', // 'left', 'right'
  id,
  className = '',
  ...props
}) => {
  const handleToggle = () => {
    if (!disabled && onChange) {
      onChange(!checked);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      handleToggle();
    }
  };

  const switchId = id || `switch-${Math.random().toString(36).substr(2, 9)}`;

  // Size configurations
  const sizeClasses = {
    small: {
      switch: 'w-8 h-4',
      thumb: 'w-3 h-3',
      translate: 'translate-x-4',
    },
    medium: {
      switch: 'w-11 h-6',
      thumb: 'w-5 h-5',
      translate: 'translate-x-5',
    },
    large: {
      switch: 'w-14 h-8',
      thumb: 'w-7 h-7',
      translate: 'translate-x-6',
    },
  };

  // Color configurations
  const colorClasses = {
    primary: checked ? 'bg-blue-600' : 'bg-gray-300',
    success: checked ? 'bg-green-600' : 'bg-gray-300',
    warning: checked ? 'bg-yellow-600' : 'bg-gray-300',
    danger: checked ? 'bg-red-600' : 'bg-gray-300',
  };

  const currentSize = sizeClasses[size];
  const currentColor = colorClasses[color];

  const switchClasses = [
    'relative inline-flex items-center rounded-full transition-colors duration-300 ease-in-out cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
    currentSize.switch,
    currentColor,
    disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const thumbClasses = [
    'inline-block rounded-full bg-white shadow-lg transform ring-0 transition-transform duration-300 ease-in-out',
    currentSize.thumb,
    checked ? currentSize.translate : 'translate-x-0.5',
  ].join(' ');

  const labelClasses = [
    'select-none cursor-pointer',
    disabled ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700',
    labelPosition === 'left' ? 'mr-3' : 'ml-3',
  ].join(' ');

  const labelElement = label && (
    <label htmlFor={switchId} className={labelClasses}>
      {label}
    </label>
  );

  return (
    <div
      className={`flex items-center ${
        labelPosition === 'left' ? 'flex-row-reverse' : 'flex-row'
      }`}
    >
      <button
        id={switchId}
        type='button'
        role='switch'
        aria-checked={checked}
        aria-disabled={disabled}
        disabled={disabled}
        className={switchClasses}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        {...props}
      >
        <span className={thumbClasses} />
      </button>

      {labelElement}
    </div>
  );
};

export default Switch;
