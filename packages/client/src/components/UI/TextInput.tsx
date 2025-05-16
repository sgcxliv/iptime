import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  isPassword?: boolean;
}

export function TextInput({
  label,
  error,
  icon,
  isPassword = false,
  ...props
}: TextInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  
  return (
    <div className="mb-4">
      {label && (
        <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor={props.id}>
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {icon}
          </div>
        )}
        <input
          type={isPassword && !showPassword ? 'password' : 'text'}
          className={`
            w-full rounded-md shadow-sm 
            ${icon ? 'pl-10' : 'pl-3'} 
            ${isPassword ? 'pr-10' : 'pr-3'} 
            py-2 
            ${error ? 'border-red-500' : 'border-gray-300'} 
            focus:border-primary-100 focus:ring focus:ring-primary-100 focus:ring-opacity-50
          `}
          {...props}
        />
        {isPassword && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-gray-400 hover:text-gray-500 focus:outline-none"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        )}
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}