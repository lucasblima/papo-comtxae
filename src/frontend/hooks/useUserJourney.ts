import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { useToast } from '../components/ui/Toast';
import { triggerAchievementCheck, getUserAchievements } from '../services/achievements';
import { Achievement } from '../components/AchievementNotification/AchievementNotification';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface UserJourneyData {
  _id?: string;
  name?: string;
  associations?: string[];
  level?: number;
  xp?: number;
  achievements?: Achievement[];
}

export enum JourneyStep {
  INTRO = 'intro',
  ONBOARDING = 'onboarding',
  ASSOCIATIONS = 'associations',
  DASHBOARD = 'dashboard'
}

export const useUserJourney = () => {
  const [userData, setUserData] = useState<UserJourneyData>({});
  const [journeyStep, setJourneyStep] = useState<JourneyStep>(JourneyStep.INTRO);
  const [loading, setLoading] = useState<boolean>(true);
  const [newAchievements, setNewAchievements] = useState<Achievement[]>([]);
  const router = useRouter();
  const { showToast } = useToast();

  // Initialize user data
  useEffect(() => {
    const initializeUserData = async () => {
      // Check if user is logged in
      const userId = localStorage.getItem('userId');
      
      if (userId) {
        try {
          // Fetch user data from API
          const response = await axios.get(`${API_URL}/users/${userId}`);
          setUserData(response.data);
          
          // Determine current step based on user data
          if (response.data.associations && response.data.associations.length > 0) {
            setJourneyStep(JourneyStep.DASHBOARD);
          } else if (response.data.name) {
            setJourneyStep(JourneyStep.ASSOCIATIONS);
          } else {
            setJourneyStep(JourneyStep.ONBOARDING);
          }
          
          // Trigger daily login achievement
          triggerAchievementCheck('daily-login', { id: userId }, handleNewAchievement);
        } catch (error) {
          console.error('Error initializing user journey:', error);
          showToast({
            title: 'Erro',
            description: 'Não foi possível carregar seus dados. Tente novamente mais tarde.',
            type: 'error'
          });
          setJourneyStep(JourneyStep.INTRO);
        }
      } else {
        setJourneyStep(JourneyStep.INTRO);
      }
      
      setLoading(false);
    };
    
    initializeUserData();
  }, [showToast]);

  // Handle new achievement
  const handleNewAchievement = useCallback((achievement: Achievement) => {
    setNewAchievements(prev => [...prev, achievement]);
  }, []);

  // Complete onboarding
  const completeOnboarding = useCallback(async (data: { name: string }) => {
    setLoading(true);
    
    try {
      // Create new user or update existing
      const userId = localStorage.getItem('userId');
      let response;
      
      if (userId) {
        // Update existing user
        response = await axios.put(`${API_URL}/users/${userId}`, data);
      } else {
        // Create new user
        response = await axios.post(`${API_URL}/users`, data);
        localStorage.setItem('userId', response.data._id);
      }
      
      setUserData(prev => ({ ...prev, ...response.data }));
      setJourneyStep(JourneyStep.ASSOCIATIONS);
      
      // Trigger achievement
      triggerAchievementCheck('complete-profile', { id: response.data._id }, handleNewAchievement);
      
      // Navigate to associations selection
      router.push('/onboarding');
    } catch (error) {
      console.error('Error completing onboarding:', error);
      showToast({
        title: 'Erro',
        description: 'Não foi possível salvar seus dados. Tente novamente mais tarde.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  }, [router, showToast, handleNewAchievement]);

  // Complete associations selection
  const completeAssociations = useCallback(async (associations: string[]) => {
    setLoading(true);
    
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) throw new Error('User ID not found');
      
      const response = await axios.put(`${API_URL}/users/${userId}`, { 
        associations 
      });
      
      setUserData(prev => ({ ...prev, ...response.data }));
      setJourneyStep(JourneyStep.DASHBOARD);
      
      // Trigger achievement
      triggerAchievementCheck('join-association', { id: userId }, handleNewAchievement);
      
      // Navigate to dashboard
      router.push('/dashboard');
    } catch (error) {
      console.error('Error completing associations selection:', error);
      showToast({
        title: 'Erro',
        description: 'Não foi possível salvar suas associações. Tente novamente mais tarde.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  }, [router, showToast, handleNewAchievement]);

  // Load user achievements
  const loadAchievements = useCallback(async () => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) return;
      
      const achievements = await getUserAchievements(userId);
      setUserData(prev => ({ ...prev, achievements }));
    } catch (error) {
      console.error('Error loading achievements:', error);
    }
  }, []);

  // Trigger a specific achievement
  const checkAchievement = useCallback(async (trigger: string) => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) return null;
      
      return triggerAchievementCheck(trigger, { id: userId }, handleNewAchievement);
    } catch (error) {
      console.error('Error checking achievement:', error);
      return null;
    }
  }, [handleNewAchievement]);

  // Clear new achievements (after they've been shown)
  const clearNewAchievements = useCallback(() => {
    setNewAchievements([]);
  }, []);

  return {
    userData,
    journeyStep,
    loading,
    newAchievements,
    completeOnboarding,
    completeAssociations,
    loadAchievements,
    checkAchievement,
    clearNewAchievements
  };
}; 