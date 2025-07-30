import React from 'react';

const Textarea = React.forwardRef(({ 
  className = '', 
  error, 
  ...props 
}, ref) => {
  return (
    <div className="w-full">
      <textarea
        ref={ref}
        className={`
          w-full px-3 py-2 border border-gray-300 dark:border-gray-600 
          rounded-md shadow-sm 
          bg-white dark:bg-gray-700 
          text-gray-900 dark:text-white 
          placeholder-gray-500 dark:placeholder-gray-400
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          dark:focus:ring-blue-400 dark:focus:border-blue-400
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error ? 'border-red-300 dark:border-red-600 focus:ring-red-500 focus:border-red-500' : ''}
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
});

Textarea.displayName = 'Textarea';

export default Textarea; 