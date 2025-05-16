import React from 'react';
import { motion } from 'motion/react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  fullWidth = false,
  className = '',
  ...props
}: ButtonProps) {
  const getBaseStyles = () => {
    return 'inline-flex items-center justify-center rounded-md font-nunitoSans font-semibold transition-colors duration-150';
  };
  
  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return 'py-1 px-3 text-sm';
      case 'lg':
        return 'py-3 px-6 text-lg';
      default:
        return 'py-2 px-4 text-md';
    }
  };
  
  const getVariantStyles = () => {
    switch (variant) {
      case 'secondary':
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
      case 'outline':
        return 'bg-white text-primary-100 border border-primary-100 hover:bg-primary-50';
      case 'danger':
        return 'bg-red-600 text-white hover:bg-red-700';
      default:
        return 'bg-primary-100 text-white hover:bg-primary-120';
    }
  };
  
  const getWidthStyles = () => {
    return fullWidth ? 'w-full' : '';
  };
  
  return (
    <motion.button
      className={`${getBaseStyles()} ${getSizeStyles()} ${getVariantStyles()} ${getWidthStyles()} ${className}`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      disabled={props.disabled}
      {...props}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {children}
    </motion.button>
  );
}
