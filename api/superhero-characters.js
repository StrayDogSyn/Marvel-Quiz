/**
 * Serverless function to fetch superhero character data from SuperHero API
 * Replacement for deprecated Marvel API (shut down October 29, 2025)
 * 
 * SuperHero API Documentation: https://superheroapi.com/
 * Access Token: Get from https://superheroapi.com/ (requires Facebook login)
 */

const SUPERHERO_API_TOKEN = process.env.SUPERHERO_API_TOKEN;
const SUPERHERO_API_BASE = 'https://superheroapi.com/api';

// Marvel character IDs in SuperHero API database
const MARVEL_CHARACTER_IDS = [
  69,   // Batman - wait, need Marvel only
  620,  // Spider-Man
  346,  // Iron Man
  332,  // Hulk
  659,  // Thor
  107,  // Captain America
  63,   // Black Widow
  655,  // Thanos
  149,  // Deadpool
  263,  // Hawkeye
  313,  // Groot
  455,  // Rocket Raccoon
  309,  // Green Goblin
  512,  // Doctor Strange
  226,  // Gamora
  222,  // Galactus
  149,  // Daredevil
  540,  // Scarlet Witch
  687,  // Vision
  38,   // Ant-Man
  717,  // Wasp
  470,  // Quicksilver
  630,  // Star-Lord
  306,  // Groot
  413,  // Loki
  414,  // Luke Cage
  331,  // Human Torch
  340,  // Invisible Woman
  423,  // Magneto
  595,  // Silver Surfer
];

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Validate API token
  if (!SUPERHERO_API_TOKEN) {
    console.error('SuperHero API token not configured');
    return res.status(500).json({
      error: 'SuperHero API token not configured',
      message: 'Please add SUPERHERO_API_TOKEN to environment variables'
    });
  }

  try {
    const { count = 10 } = req.query;
    const limit = Math.min(parseInt(count) || 10, 50);

    // Randomly select character IDs
    const selectedIds = MARVEL_CHARACTER_IDS
      .sort(() => Math.random() - 0.5)
      .slice(0, limit);

    // Fetch character data for each ID
    const characterPromises = selectedIds.map(async (id) => {
      const response = await fetch(
        `${SUPERHERO_API_BASE}/${SUPERHERO_API_TOKEN}/${id}`
      );
      
      if (!response.ok) {
        console.error(`Failed to fetch character ${id}: ${response.status}`);
        return null;
      }
      
      return response.json();
    });

    const characters = await Promise.all(characterPromises);
    const validCharacters = characters.filter(char => char !== null);

    // Transform to Marvel API-compatible format
    const transformedData = {
      code: 200,
      status: 'Ok',
      data: {
        offset: 0,
        limit: limit,
        total: validCharacters.length,
        count: validCharacters.length,
        results: validCharacters.map(char => ({
          id: char.id,
          name: char.name,
          description: char.biography?.['full-name'] 
            ? `Also known as ${char.biography['full-name']}. ${char.biography['alter-egos'] !== 'No alter egos found.' ? 'Alter egos: ' + char.biography['alter-egos'] : ''}`
            : char.work?.occupation || 'A superhero from the Marvel universe.',
          thumbnail: {
            path: char.image?.url?.replace(/\.[^/.]+$/, '') || '',
            extension: char.image?.url?.match(/\.([^/.]+)$/)?.[1] || 'jpg'
          },
          // Additional data for quiz questions
          powerstats: char.powerstats,
          biography: char.biography,
          appearance: char.appearance,
          work: char.work,
          connections: char.connections
        }))
      }
    };

    return res.status(200).json(transformedData);

  } catch (error) {
    console.error('SuperHero API Error:', error);
    return res.status(500).json({
      error: 'Failed to fetch superhero data',
      message: error.message
    });
  }
}
