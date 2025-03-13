import React, { useState } from 'react';

interface PhoneInputProps {
  onComplete: (phone: string) => void;
  placeholder: string;
}

export function PhoneInput({ onComplete, placeholder }: PhoneInputProps): React.ReactElement {
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');

  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    
    if (numbers.length <= 2) {
      return `(${numbers}`;
    }
    if (numbers.length <= 7) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    }
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const formattedPhone = formatPhoneNumber(value);
    setPhone(formattedPhone);
    
    // Limpar erro se o número for válido
    if (value.replace(/\D/g, '').length >= 10) {
      setError('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const numbers = phone.replace(/\D/g, '');
    if (numbers.length < 10) {
      setError('Por favor, insira um número de telefone válido');
      return;
    }
    
    onComplete(phone);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          <input 
            type="tel" 
            className={`input input-bordered flex-grow ${error ? 'input-error' : ''}`}
            placeholder={placeholder}
            value={phone}
            onChange={handlePhoneChange}
            maxLength={15}
            required
          />
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={phone.replace(/\D/g, '').length < 10}
          >
            Enviar
          </button>
        </div>

        {error && (
          <div className="text-error text-sm">
            {error}
          </div>
        )}
      </div>
    </form>
  );
} 