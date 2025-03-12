import { useState } from 'react';

export function usePhoneValidation() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneError, setPhoneError] = useState('');

  const validatePhoneNumber = (phone: string) => {
    const phoneRegex = /^\(\d{2}\) \d{5}-\d{4}$/;
    if (!phone) {
      setPhoneError('O número de telefone é obrigatório');
      return false;
    }
    if (!phoneRegex.test(phone)) {
      setPhoneError('Formato inválido. Use (99) 99999-9999');
      return false;
    }
    setPhoneError('');
    return true;
  };

  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      let formatted = numbers;
      if (numbers.length > 2) formatted = `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
      if (numbers.length > 7) formatted = `${formatted.slice(0, 10)}-${formatted.slice(10)}`;
      return formatted;
    }
    return value;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhoneNumber(formatted);
    if (formatted.length === 15) {
      validatePhoneNumber(formatted);
    }
  };

  const resetPhone = () => {
    setPhoneNumber('');
    setPhoneError('');
  };

  return {
    phoneNumber,
    phoneError,
    validatePhoneNumber,
    handlePhoneChange,
    resetPhone
  };
} 