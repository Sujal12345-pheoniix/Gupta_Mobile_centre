import React from 'react';

interface InputProps {
  type?: string;
  placeholder?: string;
  value?: string | number;
  onChange?: (value: string) => void;
  disabled?: boolean;
  className?: string;
  testId?: string;
  autoFocus?: boolean;
}

export const Input: React.FC<InputProps> = ({
  type = 'text',
  placeholder,
  value,
  onChange,
  disabled,
  className,
  testId,
  autoFocus,
}) => {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange?.(e.target.value)}
      disabled={disabled}
      className={[
        'rounded-md border-input p-2 text-sm shadow-sm transition-colors',
        disabled && 'opacity-50 cursor-not-allowed',
        className,
      ].join(' ')}
      autoFocus={autoFocus}
      data-testid={testId}
    />
  );
};