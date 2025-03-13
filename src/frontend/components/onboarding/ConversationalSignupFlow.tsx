import React, { useState, useEffect, useRef } from 'react';
import { OnboardingProvider } from '../../contexts/OnboardingContext';
import { FaMicrophone, FaUser, FaPhone, FaCheck } from 'react-icons/fa';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { VoiceAuthentication } from '../speech/VoiceAuthentication';
import { VoiceInput, PhoneInput, ConfirmationInput } from './inputs';

// Tipos de mensagens que podem aparecer na conversa
type MessageType = 'assistant' | 'user' | 'system' | 'input';

// Estrutura de uma mensagem na conversa
interface Message {
  id: string;
  type: MessageType;
  content: string | React.ReactNode;
  timestamp: Date;
}

/**
 * ConversationalSignupFlow
 * 
 * Fluxo de cadastro conversacional que guia o usuário por meio de
 * um diálogo natural com a plataforma.
 */
export function ConversationalSignupFlow(): React.ReactElement {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isTyping, setIsTyping] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showTextInput, setShowTextInput] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { userData, updateUserData } = useOnboarding();

  // Configuração das etapas da conversa
  const conversationSteps = [
    // Boas-vindas
    {
      messages: [
        "Olá! Sou o assistente do Papo Social. 👋",
        "Que bom ter você aqui! Vamos criar sua conta em poucos passos.",
        "O Papo Social é uma plataforma onde sua voz é sua identidade. Sem senhas complicadas, apenas você sendo você.",
        "Você pode interagir comigo usando sua voz ou digitando suas respostas."
      ],
      systemPrompt: "Como podemos te chamar? Clique no microfone para falar ou use o teclado para digitar seu nome",
      inputType: "voice",
      inputPlaceholder: "Diga ou digite seu nome...",
      icon: <FaUser />
    },
    // Coleta de telefone
    {
      messages: [
        (name: string) => `Muito prazer, ${name}! É ótimo conhecer você.`,
        "Agora, precisamos do seu número de telefone para garantir a segurança da sua conta."
      ],
      systemPrompt: "Qual é o seu número de telefone?",
      inputType: "phone",
      inputPlaceholder: "(00) 00000-0000",
      icon: <FaPhone />
    },
    // Confirmação
    {
      messages: [
        "Perfeito! Estamos quase lá.",
        (name: string, phone: string) => `Vamos confirmar seus dados:\n\nNome: ${name}\nTelefone: ${phone}`
      ],
      systemPrompt: "Essas informações estão corretas?",
      inputType: "confirmation",
      icon: <FaCheck />
    },
    // Sucesso
    {
      messages: [
        (name: string) => `Conta criada com sucesso, ${name}! 🎉`,
        "Você ganhou 100 pontos de experiência e desbloqueou suas primeiras conquistas!",
        "Estamos ansiosos para iniciar essa jornada com você!"
      ],
      systemPrompt: "Toque no botão abaixo para começar a usar o Papo Social",
      inputType: "button",
      buttonText: "Começar a usar o Papo Social",
      icon: <FaCheck />
    }
  ];

  // Efeito para iniciar a conversa
  useEffect(() => {
    // Inicia a fala automaticamente após 1 segundo
    setTimeout(() => {
      if (conversationSteps[0]?.messages) {
        startConversation();
        speakWelcomeMessage();
      }
    }, 1000);
  }, []);

  // Efeito para rolar para a mensagem mais recente
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Função para iniciar a conversa
  const startConversation = () => {
    setMessages([]);
    setTimeout(() => {
      if (conversationSteps[0]?.messages) {
        addAssistantMessages(conversationSteps[0].messages);
      }
    }, 600);
  };

  // Função para adicionar mensagens do assistente com efeito de digitação
  const addAssistantMessages = (messageContents: any[], index = 0) => {
    if (index >= messageContents.length) {
      setTimeout(() => {
        const currentStepConfig = conversationSteps[currentStep];
        if (currentStepConfig?.systemPrompt) {
          addSystemPrompt(currentStepConfig.systemPrompt);
        }
      }, 800);
      return;
    }

    setIsTyping(true);

    let content = messageContents[index];
    if (typeof content === 'function') {
      content = content(userData.name, userData.phone);
    }
    
    const typingDelay = Math.min(1000, content.length * 20);

    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {
          id: `assistant-${Date.now()}-${index}`,
          type: 'assistant',
          content,
          timestamp: new Date()
        }
      ]);
      
      speakMessage(content);
      setIsTyping(false);
      
      setTimeout(() => {
        addAssistantMessages(messageContents, index + 1);
      }, 800);
    }, typingDelay);
  };

  // Adicionar prompt do sistema
  const addSystemPrompt = (prompt: string) => {
    setMessages(prev => [
      ...prev,
      {
        id: `system-${Date.now()}`,
        type: 'system',
        content: prompt,
        timestamp: new Date()
      }
    ]);

    setTimeout(() => {
      addInputComponent();
    }, 500);
  };

  // Adicionar componente de entrada baseado na etapa atual
  const addInputComponent = () => {
    const currentStepConfig = conversationSteps[currentStep];
    
    setMessages(prev => [
      ...prev,
      {
        id: `input-${Date.now()}`,
        type: 'input',
        content: renderInputComponent(currentStepConfig),
        timestamp: new Date()
      }
    ]);
  };

  // Renderizar o componente de entrada apropriado
  const renderInputComponent = (stepConfig: any) => {
    switch (stepConfig.inputType) {
      case 'voice':
        return (
          <div className="flex flex-col gap-3">
            <div className="text-center text-sm text-base-content/70">
              Escolha como prefere informar seus dados:
            </div>
            <VoiceInput 
              onComplete={handleNameCapture} 
              placeholder={stepConfig.inputPlaceholder}
            />
            <div className="text-center">
              <button 
                className="btn btn-link btn-sm"
                onClick={() => setShowTextInput(true)}
              >
                Prefiro digitar meu nome
              </button>
            </div>
          </div>
        );
      case 'phone':
        return (
          <PhoneInput 
            onComplete={handlePhoneCapture} 
            placeholder={stepConfig.inputPlaceholder}
          />
        );
      case 'confirmation':
        return (
          <ConfirmationInput 
            onConfirm={handleConfirmation} 
            userData={userData}
          />
        );
      case 'button':
        return (
          <button 
            className="btn btn-primary btn-lg w-full"
            onClick={handleComplete}
          >
            {stepConfig.buttonText || "Continuar"}
          </button>
        );
      default:
        return null;
    }
  };

  // Handlers para os diferentes tipos de entrada
  const handleNameCapture = (name: string) => {
    addUserMessage(name);
    updateUserData({ name });
    setTimeout(() => {
      proceedToNextStep();
    }, 800);
  };

  const handlePhoneCapture = (phone: string) => {
    addUserMessage(phone);
    updateUserData({ phone });
    setTimeout(() => {
      proceedToNextStep();
    }, 800);
  };

  const handleConfirmation = (confirmed: boolean) => {
    if (confirmed) {
      addUserMessage("Sim, está tudo correto!");
      setTimeout(() => {
        proceedToNextStep();
      }, 800);
    } else {
      addUserMessage("Não, preciso corrigir");
      setTimeout(() => {
        setCurrentStep(0);
        addAssistantMessages(["Sem problemas, vamos recomeçar."]);
      }, 800);
    }
  };

  const handleComplete = () => {
    window.location.href = "/dashboard";
  };

  // Adicionar mensagem do usuário
  const addUserMessage = (content: string) => {
    setMessages(prev => [
      ...prev,
      {
        id: `user-${Date.now()}`,
        type: 'user',
        content,
        timestamp: new Date()
      }
    ]);
  };

  // Avançar para o próximo passo da conversa
  const proceedToNextStep = () => {
    const nextStep = currentStep + 1;
    
    if (nextStep < conversationSteps.length && conversationSteps[nextStep]?.messages) {
      setCurrentStep(nextStep);
      setTimeout(() => {
        addAssistantMessages(conversationSteps[nextStep].messages);
      }, 800);
    }
  };

  // Rolar para a parte inferior da conversa
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Sintetizar fala para uma mensagem
  const speakMessage = (message: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(message);
      utterance.lang = 'pt-BR';
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      
      window.speechSynthesis.speak(utterance);
    }
  };

  // Função para falar a mensagem de boas-vindas
  const speakWelcomeMessage = () => {
    const welcomeMessage = "Olá! Sou o assistente do Papo Social. Toque em qualquer lugar da tela ou use sua voz para começar seu cadastro.";
    speakMessage(welcomeMessage);
  };

  return (
    <OnboardingProvider>
      <div className="card w-full max-w-md bg-base-100 shadow-xl h-[600px] flex flex-col">
        <div className="card-body flex-grow flex flex-col p-0">
          <header className="p-4 bg-primary text-primary-content rounded-t-xl">
            <h1 className="text-2xl font-bold">
              Papo Social
              {isSpeaking && <span className="ml-2 inline-block animate-pulse">🔊</span>}
            </h1>
          </header>
          
          <div className="flex-grow overflow-y-auto p-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`mb-4 ${message.type === 'user' ? 'flex justify-end' : ''}`}
              >
                {message.type === 'assistant' && (
                  <div className="chat chat-start">
                    <div className="chat-image avatar">
                      <div className="w-10 rounded-full bg-primary flex items-center justify-center text-primary-content">
                        <FaMicrophone />
                      </div>
                    </div>
                    <div className="chat-bubble">{message.content}</div>
                  </div>
                )}
                
                {message.type === 'user' && (
                  <div className="chat chat-end">
                    <div className="chat-bubble chat-bubble-primary">{message.content}</div>
                  </div>
                )}
                
                {message.type === 'system' && (
                  <div className="text-center text-base-content/70 my-4">
                    {message.content}
                  </div>
                )}
                
                {message.type === 'input' && (
                  <div className="my-2 w-full">
                    {message.content}
                  </div>
                )}
              </div>
            ))}
            
            {isTyping && (
              <div className="chat chat-start">
                <div className="chat-image avatar">
                  <div className="w-10 rounded-full bg-primary flex items-center justify-center text-primary-content">
                    <FaMicrophone />
                  </div>
                </div>
                <div className="chat-bubble flex gap-1">
                  <span className="typing-dot animate-bounce">•</span>
                  <span className="typing-dot animate-bounce" style={{ animationDelay: '0.2s' }}>•</span>
                  <span className="typing-dot animate-bounce" style={{ animationDelay: '0.4s' }}>•</span>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>
    </OnboardingProvider>
  );
} 