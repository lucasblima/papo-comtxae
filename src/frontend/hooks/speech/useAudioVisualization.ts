import { useState, useEffect, useRef } from 'react';
import { useToast } from '../../components/ui/Toast';

export function useAudioVisualization(isRecording: boolean) {
  const [audioVolume, setAudioVolume] = useState(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const { showToast } = useToast();

  const startVisualization = async () => {
    try {
      if (typeof window !== 'undefined' && 
          typeof AudioContext !== 'undefined' && 
          typeof navigator.mediaDevices !== 'undefined' &&
          typeof navigator.mediaDevices.getUserMedia === 'function') {
        
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaStreamRef.current = stream;
        
        if (!audioContextRef.current) {
          const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
          if (AudioContextClass) {
            audioContextRef.current = new AudioContextClass();
          }
        }
        
        if (audioContextRef.current && typeof audioContextRef.current.createAnalyser === 'function') {
          analyserRef.current = audioContextRef.current.createAnalyser();
          analyserRef.current.fftSize = 256;
          
          const source = audioContextRef.current.createMediaStreamSource(stream);
          source.connect(analyserRef.current);
          
          const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
          
          const checkVolume = () => {
            if (!analyserRef.current || !isRecording) return;
            
            analyserRef.current.getByteFrequencyData(dataArray);
            let sum = 0;
            
            for (let i = 0; i < dataArray.length; i++) {
              sum += (dataArray[i] || 0);
            }
            
            const avg = sum / dataArray.length;
            setAudioVolume(avg);
            
            if (isRecording) {
              requestAnimationFrame(checkVolume);
            }
          };
          
          checkVolume();
        }
      }
    } catch (error) {
      console.error('Error starting audio visualization:', error);
      showToast({
        title: 'Erro',
        description: 'Não foi possível acessar o microfone para visualização.',
        type: 'error'
      });
    }
  };

  const stopVisualization = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    setAudioVolume(0);
  };

  useEffect(() => {
    if (isRecording) {
      startVisualization();
    } else {
      stopVisualization();
    }
    
    return () => {
      stopVisualization();
    };
  }, [isRecording]);

  return { audioVolume };
} 