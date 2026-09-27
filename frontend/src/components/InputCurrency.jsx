import React from 'react';

const InputCurrency = ({ label, value, onChange, required = false, placeholder = '0' }) => {
  // Format number dengan titik ribuan
  const formatNumber = (num) => {
    if (!num && num !== 0) return '';
    const str = num.toString().replace(/\./g, '');
    return str.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  // Parse formatted number kembali ke number biasa
  const parseNumber = (str) => {
    return str.replace(/\./g, '');
  };

  const handleChange = (e) => {
    const rawValue = e.target.value.replace(/[^\d]/g, ''); // Hanya angka
    onChange(rawValue);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-secondary-700 mb-1">
        {label}
      </label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-500 font-medium">
          Rp
        </span>
        <input
          type="text"
          value={formatNumber(value)}
          onChange={handleChange}
          placeholder={placeholder}
          required={required}
          className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-secondary-300 rounded-lg text-slate-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all text-right"
        />
      </div>
    </div>
  );
};

export default InputCurrency;
