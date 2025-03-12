import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * API route for processing voice onboarding
 * This extracts a name from the transcript and returns a simple user object
 */
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST method
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { transcript } = req.body;

    if (!transcript) {
      return res.status(400).json({ error: 'Transcript is required' });
    }

    // Simple name extraction from transcript
    const extractedName = extractNameFromTranscript(transcript);

    if (!extractedName) {
      return res.status(400).json({ error: 'Could not extract name from transcript' });
    }

    // Create a user ID based on the name for this demo
    const userId = Buffer.from(extractedName.toLowerCase()).toString('hex');

    // Return a mock user object with the extracted name
    // In a real app, this would create/lookup a user in the database
    return res.status(200).json({
      _id: userId,
      name: extractedName,
      level: {
        level: 1,
        xp: 50,
        next_level_xp: 100
      },
      achievements: [
        {
          id: 'first_voice_1',
          name: 'Primeira Interação por Voz',
          description: 'Completou sua primeira interação usando reconhecimento de voz',
          icon: '🎤'
        }
      ]
    });
  } catch (error) {
    console.error('Error processing onboarding voice:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Extract a name from the transcript
 * This uses simple pattern matching to find common name introduction phrases
 * @param transcript The transcript text to analyze
 * @returns The extracted name or null if none found
 */
function extractNameFromTranscript(transcript: string): string | null {
  const lowerTranscript = transcript.toLowerCase();
  
  // Common patterns for name introduction in Portuguese
  const patterns = [
    /me\s+chamo\s+([A-Za-zÀ-ÖØ-öø-ÿ]+(\s+[A-Za-zÀ-ÖØ-öø-ÿ]+)?)/i,
    /meu\s+nome\s+[eéê]\s+([A-Za-zÀ-ÖØ-öø-ÿ]+(\s+[A-Za-zÀ-ÖØ-öø-ÿ]+)?)/i,
    /sou\s+(?:o|a)?\s*([A-Za-zÀ-ÖØ-öø-ÿ]+(\s+[A-Za-zÀ-ÖØ-öø-ÿ]+)?)/i,
    /(?:olá|oi)[\s,]+(?:eu\s+)?(?:sou|me\s+chamo)?\s+([A-Za-zÀ-ÖØ-öø-ÿ]+(\s+[A-Za-zÀ-ÖØ-öø-ÿ]+)?)/i,
  ];
  
  // Try each pattern
  for (const pattern of patterns) {
    const match = lowerTranscript.match(pattern);
    if (match && match[1]) {
      // Capitalize the first letter of each word in the name
      return match[1].trim().split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    }
  }
  
  // If no match found with patterns, try to find any capitalized words or common name indicators
  const words = transcript.split(' ');
  const capitalizedWords = words.filter(word => {
    if (!word) return false;
    return word.length > 2 && 
           word.charAt(0) === word.charAt(0).toUpperCase() && 
           !['Eu', 'Olá', 'Oi', 'Me', 'Meu', 'Minha', 'Sou', 'Nome'].includes(word);
  });
  
  if (capitalizedWords.length > 0 && capitalizedWords[0]) {
    return capitalizedWords[0];
  }
  
  // If all else fails, return the last word as a fallback (often the name in simple introductions)
  if (words.length > 0) {
    const lastWord = words[words.length - 1];
    if (lastWord && lastWord.trim().length > 2) {
      const trimmed = lastWord.trim();
      return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
    }
  }
  
  // No name could be extracted
  return null;
} 