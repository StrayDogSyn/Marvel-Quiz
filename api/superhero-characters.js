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
      results: selected.map(q => ({
        id: q.metadata.character.name,
        name: q.metadata.character.name,
        description: q.metadata.character.facts.join(' '),
        thumbnail: {
          path: q.metadata.character.thumbnail.replace(/\.[^/.]+$/, ''),
          extension: q.metadata.character.thumbnail.match(/\.([^/.]+)$/)?.[1] || 'jpg'
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
        // Additional quiz data
        quizData: {
          question: q.question,
          options: q.options,
          answer: q.answer,
          difficulty: Object.keys(fallbackData.difficulty).find(key => 
            fallbackData.difficulty[key].includes(q)
          )
        }
      }))
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

  // Force fallback if requested or if API token not configured
  if (forceFallback === 'true' || !SUPERHERO_API_TOKEN) {
    if (!SUPERHERO_API_TOKEN) {
      console.warn('SuperHero API token not configured, using fallback data');
    }
    const fallbackData = loadFallbackData();
    if (fallbackData) {
      const response = convertFallbackToAPIFormat(fallbackData, limit, difficulty);
      return res.status(200).json(response);
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
    const validCharacters = characters.filter(char => char !== null && char.response === 'success');

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
        results: validCharacters.map(char => ({
          id: char.id,
          name: char.name,
          description: char.biography?.['full-name'] 
            ? `Also known as ${char.biography['full-name']}. ${char.work?.occupation || ''} ${char.biography['place-of-birth'] ? `Born in ${char.biography['place-of-birth']}.` : ''}`
            : char.work?.occupation || 'A superhero from the Marvel universe.',
          thumbnail: {
            path: char.image?.url?.replace(/\.[^/.]+$/, '') || '',
            extension: char.image?.url?.match(/\.([^/.]+)$/)?.[1] || 'jpg'
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
          primaryTeam: char.connections?.['group-affiliation']?.split(',')[0]?.trim() || 'Independent'
        }))
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
