import React from 'react';

interface FormFieldProps {
  label: string;
  id: string;
  type: string;
  placeholder?: string;
  required?: boolean;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
}

const FormField: React.FC<FormFieldProps> = ({
  label,
  id,
  type,
  placeholder,
  required = false,
  value,
  onChange,
  error,
}) => {
  return (
    <div className="mb-4">
      <label htmlFor={id} className="block text-blue-200 text-sm font-medium mb-2">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <input
        type={type}
        id={id}
        name={id}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={`w-full bg-blue-900/50 border ${
          error ? 'border-red-400' : 'border-blue-700'
        } rounded-lg p-3 text-white placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500`}
      />
      {error && <p className="mt-1 text-sm text-red-400">{error}</p>}
    </div>
  );
};

export default FormField;
