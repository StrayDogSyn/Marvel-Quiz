/**
 * Serverless function to fetch superhero character data from SuperHero API
 * Replacement for deprecated Marvel API (shut down October 29, 2025)
 * 
 * Features:
 * - SuperHero API integration with enhanced data
 * - Automatic fallback to local JSON if API fails
 * - Difficulty-based character selection
 * - Extended metadata (powerstats, biography, work, connections)
 * 
 * SuperHero API Documentation: https://superheroapi.com/
 * Access Token: Get from https://superheroapi.com/ (requires Facebook login)
 */

import fs from 'fs';
import path from 'path';

const SUPERHERO_API_TOKEN = process.env.SUPERHERO_API_TOKEN;
const SUPERHERO_API_BASE = 'https://superheroapi.com/api';
const ENABLE_FALLBACK = process.env.ENABLE_FALLBACK !== 'false'; // Default enabled

// Marvel character IDs in SuperHero API database with difficulty tiers
const MARVEL_CHARACTERS = {
  easy: [
    { id: 620, name: 'Spider-Man', priority: 10 },
    { id: 346, name: 'Iron Man', priority: 10 },
    { id: 332, name: 'Hulk', priority: 10 },
    { id: 659, name: 'Thor', priority: 10 },
    { id: 107, name: 'Captain America', priority: 10 },
    { id: 63, name: 'Black Widow', priority: 8 },
    { id: 263, name: 'Hawkeye', priority: 8 },
    { id: 687, name: 'Vision', priority: 7 },
    { id: 38, name: 'Ant-Man', priority: 7 },
  ],
  medium: [
    { id: 149, name: 'Deadpool', priority: 9 },
    { id: 512, name: 'Doctor Strange', priority: 9 },
    { id: 126, name: 'Black Panther', priority: 9 },
    { id: 717, name: 'Wasp', priority: 7 },
    { id: 309, name: 'Green Goblin', priority: 7 },
    { id: 226, name: 'Gamora', priority: 8 },
    { id: 630, name: 'Star-Lord', priority: 8 },
    { id: 313, name: 'Groot', priority: 8 },
    { id: 455, name: 'Rocket Raccoon', priority: 7 },
    { id: 251, name: 'Scarlet Witch', priority: 8 },
    { id: 538, name: 'Professor X', priority: 8 },
  ],
  hard: [
    { id: 655, name: 'Thanos', priority: 10 },
    { id: 413, name: 'Loki', priority: 10 },
    { id: 423, name: 'Magneto', priority: 9 },
    { id: 595, name: 'Silver Surfer', priority: 8 },
    { id: 414, name: 'Luke Cage', priority: 7 },
    { id: 222, name: 'Galactus', priority: 8 },
    { id: 331, name: 'Human Torch', priority: 7 },
    { id: 340, name: 'Invisible Woman', priority: 7 },
    { id: 470, name: 'Quicksilver', priority: 7 },
    { id: 238, name: 'Mystique', priority: 8 },
  ]
};

/**
 * Load fallback data from local JSON file
 */
function loadFallbackData() {
  try {
    const fallbackPath = path.join(process.cwd(), 'data', 'fallback-characters.json');
    const fallbackData = JSON.parse(fs.readFileSync(fallbackPath, 'utf8'));
    return fallbackData;
  } catch (error) {
    console.error('Failed to load fallback data:', error);
    return null;
  }
}

/**
 * Convert fallback data to API-compatible format
 */
function convertFallbackToAPIFormat(fallbackData, count = 10, difficulty = null) {
  if (!fallbackData) return null;

  let allQuestions = [];
  
  if (difficulty && fallbackData.difficulty[difficulty]) {
    allQuestions = fallbackData.difficulty[difficulty];
  } else {
    // Mix all difficulties
    allQuestions = [
      ...(fallbackData.difficulty.easy || []),
      ...(fallbackData.difficulty.medium || []),
      ...(fallbackData.difficulty.hard || [])
    ];
  }

  // Shuffle and limit
  const shuffled = allQuestions.sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, count);

  return {
    code: 200,
    status: 'Ok',
    source: 'fallback',
    data: {
      offset: 0,
      limit: count,
      total: selected.length,
      count: selected.length,
      results: selected.map(q => {
        const thumbnailUrl = q.metadata.character.thumbnail;
        
        return {
          id: q.metadata.character.name,
          name: q.metadata.character.name,
          description: q.metadata.character.facts.join(' '),
          thumbnail: {
            path: thumbnailUrl,
            extension: '' // Will be handled by frontend fallback system
          },
          powerstats: q.metadata.character.powerstats,
          biography: {
            'full-name': q.metadata.character.real_name,
            'first-appearance': q.metadata.character.first_appearance,
            'alter-egos': 'No alter egos found.'
          },
          work: {
            occupation: q.metadata.character.teams.join(', ')
          },
          appearance: {},
          connections: {
            'group-affiliation': q.metadata.character.teams.join(', ')
          },
          // Image fallbacks
          imageFallbacks: [
            thumbnailUrl,
            // Generic placeholder with character name
            `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='400'%3E%3Crect fill='%23ed1d24' width='300' height='400'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='24' fill='white' text-anchor='middle' dominant-baseline='middle'%3E${encodeURIComponent(q.metadata.character.name || 'Marvel Hero')}%3C/text%3E%3C/svg%3E`
          ].filter(Boolean),
          // Additional quiz data
          quizData: {
            question: q.question,
            options: q.options,
            answer: q.answer,
            difficulty: Object.keys(fallbackData.difficulty).find(key => 
              fallbackData.difficulty[key].includes(q)
            )
          }
        };
      })
    }
  };
}

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { count = 10, difficulty = null, fallback: forceFallback = false } = req.query;
  const limit = Math.min(parseInt(count) || 10, 50);

  // Always use fallback data for now - SuperHero API images have CORS issues
  // TODO: Implement image proxy if real-time API data is needed
  const fallbackData = loadFallbackData();
  if (fallbackData) {
    const response = convertFallbackToAPIFormat(fallbackData, limit, difficulty);
    return res.status(200).json(response);
  }
  
  // If fallback fails, try API (keeping as backup)
  if (forceFallback === 'true' || !SUPERHERO_API_TOKEN) {
    if (!SUPERHERO_API_TOKEN) {
      console.warn('SuperHero API token not configured, using fallback data');
    }
  }

  try {
    // Select character pool based on difficulty
    let characterPool = [];
    if (difficulty && MARVEL_CHARACTERS[difficulty]) {
      characterPool = MARVEL_CHARACTERS[difficulty];
    } else {
      // Mix all difficulties with priority weighting
      characterPool = [
        ...MARVEL_CHARACTERS.easy,
        ...MARVEL_CHARACTERS.medium,
        ...MARVEL_CHARACTERS.hard
      ];
    }

    // Sort by priority and randomize within priority groups
    const sortedByPriority = characterPool.sort((a, b) => b.priority - a.priority);
    const selectedChars = sortedByPriority
      .sort(() => Math.random() - 0.5)
      .slice(0, limit);

    // Fetch character data for each ID with timeout
    const characterPromises = selectedChars.map(async (charData) => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

        const response = await fetch(
          `${SUPERHERO_API_BASE}/${SUPERHERO_API_TOKEN}/${charData.id}`,
          { signal: controller.signal }
        );
        
        clearTimeout(timeoutId);

        if (!response.ok) {
          console.error(`Failed to fetch character ${charData.name} (${charData.id}): ${response.status}`);
          return null;
        }
        
        const data = await response.json();
        return { ...data, difficulty: difficulty || 'mixed', priority: charData.priority };
      } catch (error) {
        console.error(`Error fetching ${charData.name}:`, error.message);
        return null;
      }
    });

    const characters = await Promise.all(characterPromises);
    
    // Filter for valid Marvel characters only
    const validCharacters = characters.filter(char => {
      if (char === null || char.response !== 'success') return false;
      
      // Verify it's a Marvel character
      const publisher = char.biography?.publisher?.toLowerCase() || '';
      const isMarvel = publisher.includes('marvel');
      
      if (!isMarvel) {
        console.warn(`Filtered out non-Marvel character: ${char.name} (Publisher: ${char.biography?.publisher})`);
      }
      
      return isMarvel;
    });

    // If API failed completely and fallback is enabled, use fallback data
    if (validCharacters.length === 0 && ENABLE_FALLBACK) {
      console.warn('SuperHero API returned no valid characters, falling back to local data');
      const fallbackData = loadFallbackData();
      if (fallbackData) {
        const response = convertFallbackToAPIFormat(fallbackData, limit, difficulty);
        return res.status(200).json(response);
      }
    }

    // If we have some characters but not enough, supplement with fallback
    if (validCharacters.length < limit && validCharacters.length > 0 && ENABLE_FALLBACK) {
      console.log(`Only ${validCharacters.length}/${limit} characters from API, supplementing with fallback`);
      const fallbackData = loadFallbackData();
      if (fallbackData) {
        const needed = limit - validCharacters.length;
        const fallbackResponse = convertFallbackToAPIFormat(fallbackData, needed, difficulty);
        if (fallbackResponse) {
          validCharacters.push(...fallbackResponse.data.results);
        }
      }
    }

    // Enhanced transformation with additional metadata
    const transformedData = {
      code: 200,
      status: 'Ok',
      source: 'superhero-api',
      data: {
        offset: 0,
        limit: limit,
        total: validCharacters.length,
        count: validCharacters.length,
        results: validCharacters.map(char => {
          // Build a clean description
          const parts = [];
          const characterName = char.name?.toLowerCase() || '';
          
          // Only include full name if it doesn't give away the answer
          if (char.biography?.['full-name'] && 
              char.biography['full-name'] !== '-' &&
              !char.biography['full-name'].toLowerCase().includes(characterName)) {
            parts.push(`Also known as ${char.biography['full-name']}`);
          }
          
          if (char.work?.occupation && char.work.occupation !== '-') {
            parts.push(char.work.occupation);
          }
          
          if (char.biography?.['place-of-birth'] && char.biography['place-of-birth'] !== '-') {
            parts.push(`Born in ${char.biography['place-of-birth']}`);
          }
          
          // Add aliases if they don't reveal the character name
          if (char.biography?.aliases && 
              Array.isArray(char.biography.aliases) && 
              char.biography.aliases.length > 0) {
            const safeAliases = char.biography.aliases
              .filter(alias => alias !== '-' && 
                              !alias.toLowerCase().includes(characterName))
              .slice(0, 2); // Limit to 2 aliases
            if (safeAliases.length > 0) {
              parts.push(`Known aliases: ${safeAliases.join(', ')}`);
            }
          }
          
          // Create a clean, readable description
          let description = parts.length > 0 
            ? parts.join('. ') + '.'
            : 'A superhero from the Marvel universe.';
          
          // Clean up double periods and extra spaces
          description = description.replace(/\.\./g, '.').replace(/\s+/g, ' ').trim();
          
          // Generate image URL with fallbacks
          const imageUrl = char.image?.url || '';
          
          return {
            id: char.id,
            name: char.name,
            description: description,
            thumbnail: {
              path: imageUrl,
              extension: '' // SuperHero API provides full URL
            },
            // Enhanced metadata
            powerstats: char.powerstats,
            biography: char.biography,
            appearance: char.appearance,
            work: char.work,
            connections: char.connections,
            difficulty: char.difficulty,
            priority: char.priority,
            // Additional computed fields
            totalPower: Object.values(char.powerstats || {})
              .filter(v => v !== 'null' && !isNaN(parseInt(v)))
              .reduce((sum, val) => sum + parseInt(val), 0),
            primaryTeam: char.connections?.['group-affiliation']?.split(',')[0]?.trim() || 'Independent',
            // Image fallbacks for frontend
            imageFallbacks: [
              imageUrl,
              // Add generic Marvel placeholder as last resort
              `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='400'%3E%3Crect fill='%23ed1d24' width='300' height='400'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='24' fill='white' text-anchor='middle' dominant-baseline='middle'%3E${encodeURIComponent(char.name || 'Marvel Hero')}%3C/text%3E%3C/svg%3E`
            ].filter(Boolean)
          };
        })
      }
    };

    return res.status(200).json(transformedData);

  } catch (error) {
    console.error('SuperHero API Error:', error);
    
    // Final fallback on complete error
    if (ENABLE_FALLBACK) {
      console.log('Critical error, attempting fallback...');
      const fallbackData = loadFallbackData();
      if (fallbackData) {
        const response = convertFallbackToAPIFormat(fallbackData, limit, difficulty);
        return res.status(200).json({
          ...response,
          warning: 'Using fallback data due to API error'
        });
      }
    }

    return res.status(500).json({
      error: 'Failed to fetch superhero data',
      message: error.message,
      fallbackAvailable: ENABLE_FALLBACK
    });
  }
}
