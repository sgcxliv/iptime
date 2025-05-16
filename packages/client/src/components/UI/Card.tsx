import React from 'react';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
  contentClassName?: string;
  headerClassName?: string;
  actions?: React.ReactNode;
}

export function Card({
  children,
  title,
  className = '',
  contentClassName = '',
  headerClassName = '',
  actions
}: CardProps) {
  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      {(title || actions) && (
        <div className={`p-4 flex items-center justify-between border-b border-gray-200 ${headerClassName}`}>
          {title && (
            <h3 className="text-lg font-semibold font-nunitoSans text-gray-900">{title}</h3>
          )}
          {actions && <div>{actions}</div>}
        </div>
      )}
      <div className={`p-4 ${contentClassName}`}>
        {children}
      </div>
    </div>
  );
}
