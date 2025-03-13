import React, { useState } from 'react';
import { FaMicrophone, FaKeyboard } from 'react-icons/fa';
import { VoiceAuthentication } from '../../speech/VoiceAuthentication';

interface VoiceInputProps {
  onComplete: (text: string) => void;
  placeholder: string;
}

export function VoiceInput({ onComplete, placeholder }: VoiceInputProps): React.ReactElement {
  const [isRecording, setIsRecording] = useState(false);
  const [showTextInput, setShowTextInput] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [error, setError] = useState('');

  const handleVoiceSuccess = (text: string) => {
    setIsRecording(false);
    setError('');
    onComplete(text);
  };

  const handleVoiceError = (errorMessage: string) => {
    setIsRecording(false);
    setError(errorMessage);
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (textInput.trim()) {
      onComplete(textInput.trim());
    }
  };

  if (showTextInput) {
    return (
      <form onSubmit={handleTextSubmit} className="flex flex-col gap-2">
        <div className="flex gap-2">
          <input
            type="text"
            className="input input-bordered flex-grow"
            placeholder={placeholder}
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            autoFocus
          />
          <button
            type="submit"
            className="btn btn-primary"
            disabled={!textInput.trim()}
          >
            Enviar
          </button>
        </div>
        <div className="text-center">
          <button
            type="button"
            className="btn btn-link btn-sm"
            onClick={() => setShowTextInput(false)}
          >
            Prefiro usar minha voz
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <VoiceAuthentication
          onSuccess={handleVoiceSuccess}
          onError={handleVoiceError}
          onCancel={() => setIsRecording(false)}
          prompt={placeholder}
          isActive={isRecording}
          className="flex-grow"
        />
        
        <button 
          type="button"
          className={`btn ${isRecording ? 'btn-error' : 'btn-primary'} rounded-full`}
          onClick={() => setIsRecording(!isRecording)}
        >
          <FaMicrophone className={isRecording ? 'animate-pulse' : ''} />
        </button>
      </div>

      {error && (
        <div className="text-error text-sm">
          {error}
        </div>
      )}

      <div className="text-center">
        <button
          type="button"
          className="btn btn-link btn-sm gap-2"
          onClick={() => setShowTextInput(true)}
        >
          <FaKeyboard />
          Prefiro digitar meu nome
        </button>
      </div>
    </div>
  );
} 