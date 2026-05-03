import React from 'react';

const Input = ({ label, name, type = "text", error ,addClass, ...props }) => {
  return (
    <div className={` text-left ${addClass || ''}`}>
      {label && (
        <label
          htmlFor={name}
          className={`block text-sm font-medium text-gray-700 mb-1 `}
        >
          {label}
        </label>
      )}
      <input
        id={name}
        name={name}
        type={type}
        className={`
          block w-full rounded-md shadow-sm sm:text-sm transition-all
          ${error 
            ? 'border-red-500 focus:border-red-500 focus:ring-red-200' 
            : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-200'
          }
          focus:ring focus:ring-opacity-50
        `}
        {...props}
      />
      {/* Error Message Section */}
      {error && (
        <p className="mt-1 text-xs text-red-600 font-medium">
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;