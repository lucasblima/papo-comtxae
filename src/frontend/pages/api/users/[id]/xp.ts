import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * API route for updating a user's XP
 * This is a mock API that simulates updating XP in a database
 */
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow PUT method
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Get the user ID from the URL
  const { id } = req.query;
  
  if (!id || Array.isArray(id)) {
    return res.status(400).json({ error: 'Invalid user ID' });
  }

  try {
    const { xp, phone } = req.body;

    if (typeof xp !== 'number') {
      return res.status(400).json({ error: 'XP must be a number' });
    }

    // Validate phone number if provided
    if (phone) {
      const phoneRegex = /^\(\d{2}\) \d{5}-\d{4}$/;
      if (!phoneRegex.test(phone)) {
        return res.status(400).json({ error: 'Invalid phone number format' });
      }
    }

    // Calculate the new level based on XP
    const baseXp = 50;
    const currentXp = baseXp + xp;
    const level = Math.floor(currentXp / 100) + 1;
    const nextLevelXp = (level * 100);
    
    // Initialize achievements array
    const achievements = [];

    // Add phone verification achievement if phone is provided
    if (phone) {
      achievements.push({
        id: 'phone_verified',
        name: 'Número Verificado',
        description: 'Verificou seu número de telefone com sucesso',
        icon: '📱'
      });
    }

    // Add level achievement if applicable
    if (level > 1) {
      achievements.push({
        id: `level_${level}`,
        name: `Nível ${level} Alcançado!`,
        description: `Você alcançou o nível ${level}`,
        icon: '⭐'
      });
    }

    return res.status(200).json({
      _id: id,
      name: req.body.name || `User ${id.substring(0, 6)}`,
      phone: phone, // Include phone in response if provided
      level: {
        level: level,
        xp: currentXp,
        next_level_xp: nextLevelXp
      },
      achievements: achievements
    });
  } catch (error) {
    console.error('Error updating user XP:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 