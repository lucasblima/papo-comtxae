import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useRouter } from 'next/router';
import { useToast } from '../ui/Toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface Association {
  _id: string;
  name: string;
  description: string;
  memberCount: number;
  image?: string;
}

interface AssociationSelectionProps {
  userId: string;
  onComplete?: () => void;
  className?: string;
}

export function AssociationSelection({
  userId,
  onComplete,
  className = '',
}: AssociationSelectionProps) {
  const [associations, setAssociations] = useState<Association[]>([
    {
      _id: 'assoc-1',
      name: 'Associação de Moradores Vila Verde',
      description: 'Comunidade de moradores dedicada a melhorar a qualidade de vida no bairro Vila Verde.',
      memberCount: 120,
      image: '/images/associations/vila-verde.jpg'
    },
    {
      _id: 'assoc-2',
      name: 'Cruz Vermelha - RJ',
      description: 'Filial da Cruz Vermelha no Rio de Janeiro, promovendo assistência humanitária e saúde.',
      memberCount: 1500,
      image: '/images/associations/cruz-vermelha.jpg'
    },
    {
      _id: 'assoc-3',
      name: 'Associação Indígena Amazônica',
      description: 'Representação de comunidades indígenas da Amazônia, promovendo cultura e preservação.',
      memberCount: 350,
      image: '/images/associations/indigena.jpg'
    }
  ]);
  
  const [selectedAssociations, setSelectedAssociations] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();
  const router = useRouter();
  
  const toggleAssociation = (associationId: string) => {
    setSelectedAssociations(prev => {
      if (prev.includes(associationId)) {
        return prev.filter(id => id !== associationId);
      } else {
        return [...prev, associationId];
      }
    });
  };
  
  const handleSubmit = async () => {
    if (selectedAssociations.length === 0) {
      showToast({
        title: 'Seleção necessária',
        description: 'Por favor, selecione pelo menos uma associação para continuar.',
        type: 'warning'
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Atualiza o usuário com as associações selecionadas
      await axios.put(`${API_URL}/users/${userId}`, {
        associations: selectedAssociations
      });
      
      // Adiciona XP ao usuário por participar de associações
      await axios.put(`${API_URL}/users/${userId}/xp`, {
        xp: 15 * selectedAssociations.length
      });
      
      showToast({
        title: 'Associações selecionadas!',
        description: `Você agora é membro de ${selectedAssociations.length} associação(ões).`,
        type: 'success',
        duration: 4000
      });
      
      // Redireciona ou completa o fluxo
      if (onComplete) {
        setTimeout(onComplete, 2000);
      } else {
        setTimeout(() => router.push('/dashboard'), 2000);
      }
      
    } catch (error) {
      console.error('Erro ao salvar associações:', error);
      showToast({
        title: 'Erro',
        description: 'Não foi possível salvar suas associações. Tente novamente.',
        type: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Animação para cada item
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5
      }
    })
  };
  
  return (
    <div className={`p-4 ${className}`} data-testid="association-selection">
      <div className="max-w-3xl mx-auto bg-base-100 shadow-xl rounded-xl p-6 relative overflow-hidden">
        <div className="text-center mb-8">
          <motion.h2 
            className="text-3xl font-bold mb-2"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Escolha suas Associações
          </motion.h2>
          
          <motion.p
            className="text-base-content/70"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            Selecione as associações que você deseja participar para conectar-se com sua comunidade.
          </motion.p>
        </div>
        
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8"
          initial="hidden"
          animate="visible"
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.1
              }
            }
          }}
        >
          {associations.map((association, index) => (
            <motion.div
              key={association._id}
              custom={index}
              variants={itemVariants}
              className={`card bg-base-200 hover:shadow-md transition-shadow cursor-pointer ${
                selectedAssociations.includes(association._id) ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => toggleAssociation(association._id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="card-body">
                <div className="flex items-center justify-between">
                  <h3 className="card-title">{association.name}</h3>
                  {selectedAssociations.includes(association._id) && (
                    <div className="badge badge-primary">Selecionado</div>
                  )}
                </div>
                
                <p className="text-sm opacity-80">{association.description}</p>
                
                <div className="flex justify-between items-center mt-2 text-xs opacity-70">
                  <span>{association.memberCount} membros</span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
        
        <div className="flex justify-center mt-6">
          <motion.button
            className="btn btn-primary min-w-40"
            onClick={handleSubmit}
            disabled={isSubmitting}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {isSubmitting ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
                Processando...
              </>
            ) : selectedAssociations.length > 0 ? (
              `Continuar com ${selectedAssociations.length} selecionada(s)`
            ) : (
              'Continuar sem associações'
            )}
          </motion.button>
        </div>
        
        <motion.p
          className="text-center text-xs opacity-70 mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          Você pode gerenciar suas associações a qualquer momento no seu perfil.
        </motion.p>
      </div>
    </div>
  );
}

export default AssociationSelection; 