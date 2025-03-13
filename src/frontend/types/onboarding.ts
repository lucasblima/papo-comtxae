/**
 * Tipos centralizados para o processo de onboarding
 * 
 * Este arquivo contém as definições de tipos usadas no fluxo de onboarding
 * para garantir consistência entre os diferentes componentes e contextos.
 */

/**
 * Identificadores para as etapas do onboarding
 */
export type OnboardingStep = 'welcome' | 'phone' | 'confirmation' | 'success';

/**
 * Contextos em que o onboarding pode ser usado
 */
export type OnboardingContext = 'landing' | 'dedicated-page';

/**
 * Variantes visuais do componente de onboarding
 */
export type OnboardingTheme = 'default' | 'minimal' | 'expanded';

/**
 * Configuração de uma etapa do onboarding
 */
export interface OnboardingStepConfig {
  /** Identificador único da etapa */
  id: OnboardingStep;
  /** Título da etapa */
  title: string;
  /** Mensagem de voz que será reproduzida ao entrar na etapa */
  voicePrompt: string;
  /** Indica se a etapa pode ser pulada */
  isOptional?: boolean;
  /** Dados adicionais específicos para a etapa */
  metadata?: Record<string, any>;
}

/**
 * Dados do usuário coletados durante o onboarding
 */
export interface UserData {
  /** Nome do usuário */
  name: string;
  /** Número de telefone do usuário */
  phone: string;
  /** ID do usuário no sistema (se já existir) */
  _id?: string;
  /** Informações de nível/experiência do usuário */
  level?: {
    /** Nível atual do usuário */
    level: number;
    /** Pontos de experiência atual */
    xp: number;
    /** Pontos necessários para o próximo nível */
    next_level_xp: number;
  };
  /** Data de criação ou último acesso */
  timestamp?: number;
  /** Preferências do usuário */
  preferences?: {
    /** Preferência de tema */
    theme?: string;
    /** Preferência de notificações */
    notifications?: boolean;
  };
}

/**
 * Configuração de evento de voz
 */
export interface VoiceEvent {
  /** Timestamp do evento */
  timestamp: number;
  /** ID do usuário associado ao evento */
  userId: string;
  /** Metadados adicionais */
  metadata?: Record<string, any>;
}

/**
 * Resultado de autenticação por voz
 */
export interface VoiceAuthResult {
  /** Indica se a autenticação foi bem-sucedida */
  success: boolean;
  /** Mensagem de erro, se houver */
  error?: string;
  /** Token de autenticação, se sucesso */
  token?: string;
  /** Dados do usuário autenticado */
  userData?: UserData;
} 