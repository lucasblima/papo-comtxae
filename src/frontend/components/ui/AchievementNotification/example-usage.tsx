import React, { useState } from 'react';
import AchievementNotification, { UserAchievement } from './';

/**
 * Exemplo de como usar o componente AchievementNotification
 */
const AchievementExample: React.FC = () => {
  const [achievements, setAchievements] = useState<UserAchievement[]>([]);

  // Exemplos de conquistas
  const exampleAchievements: UserAchievement[] = [
    {
      id: 'first-message',
      name: 'Primeira Mensagem',
      description: 'Você enviou sua primeira mensagem no Papo Social!',
      icon: '/images/achievements/first-message.png',
      earnedAt: new Date(),
      soundEffect: '/sounds/achievement.mp3'
    },
    {
      id: 'profile-complete',
      name: 'Perfil Completo',
      description: 'Você completou seu perfil com todas as informações!',
      icon: '/images/achievements/profile-complete.png',
      earnedAt: new Date(),
    },
    {
      id: 'voice-master',
      name: 'Mestre da Voz',
      description: 'Você utilizou comandos de voz mais de 10 vezes!',
      icon: '/images/achievements/voice-master.png',
      earnedAt: new Date(),
    }
  ];

  // Função para simular uma nova conquista
  const triggerRandomAchievement = () => {
    const randomIndex = Math.floor(Math.random() * exampleAchievements.length);
    const achievement = exampleAchievements[randomIndex];
    if (achievement) {
      setAchievements([{
        ...achievement,
        id: `${achievement.id}-${Date.now()}`
      }]);
    }
  };

  // Função para simular múltiplas conquistas
  const triggerMultipleAchievements = () => {
    const shuffled = [...exampleAchievements].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 2).map(achievement => ({
      ...achievement,
      id: `${achievement.id}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    }));
    setAchievements(selected);
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Demonstração de Conquistas</h2>
      
      <div className="space-y-4">
        <p className="text-gray-700">
          Clique nos botões abaixo para demonstrar as notificações de conquistas.
        </p>
        
        <div className="flex flex-wrap gap-3">
          <button
            className="btn btn-primary"
            onClick={triggerRandomAchievement}
          >
            Mostrar Conquista Aleatória
          </button>
          
          <button
            className="btn btn-secondary"
            onClick={triggerMultipleAchievements}
          >
            Mostrar Múltiplas Conquistas
          </button>
        </div>
      </div>
      
      {/* Componente de notificação de conquistas */}
      <AchievementNotification 
        achievements={achievements}
        autoDismissTime={5000}
        position="bottom-right"
        playSounds={true}
      />
    </div>
  );
};

export default AchievementExample; 