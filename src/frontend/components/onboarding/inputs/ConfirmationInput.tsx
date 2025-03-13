import React from 'react';

interface ConfirmationInputProps {
  onConfirm: (confirmed: boolean) => void;
  userData: {
    name?: string;
    phone?: string;
  };
}

export function ConfirmationInput({ onConfirm, userData }: ConfirmationInputProps): React.ReactElement {
  return (
    <div className="flex flex-col gap-4">
      <div className="bg-base-200 p-4 rounded-lg">
        <div className="mb-3">
          <div className="text-sm text-base-content/70">Nome</div>
          <div className="font-medium text-lg">{userData.name}</div>
        </div>
        
        <div>
          <div className="text-sm text-base-content/70">Telefone</div>
          <div className="font-medium text-lg">{userData.phone}</div>
        </div>
      </div>

      <div className="flex gap-2 justify-center">
        <button 
          className="btn btn-outline"
          onClick={() => onConfirm(false)}
        >
          Refazer
        </button>
        <button 
          className="btn btn-primary"
          onClick={() => onConfirm(true)}
        >
          Confirmar
        </button>
      </div>
    </div>
  );
} 