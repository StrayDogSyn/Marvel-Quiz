/**
 * Vercel Serverless Function - Marvel API Proxy
 * This function proxies requests to the Marvel API to avoid CORS issues
 */

// Marvel API Configuration
const MARVEL_PUBLIC_KEY = 'e68a214d78db55dc7ce56b8f9fd573f4';
const MARVEL_PRIVATE_KEY = 'ee923f3a51654f13f4b0c5d1b99c85581b9ab754';
const MARVEL_API_BASE = 'https://gateway.marvel.com/v1/public';

// Import crypto for MD5 hashing (Node.js built-in)
const crypto = require('crypto');

/**
 * Generate MD5 hash for Marvel API authentication
 */
function generateHash(ts, privateKey, publicKey) {
  const hash = crypto
    .createHash('md5')
    .update(ts + privateKey + publicKey)
    .digest('hex');
  return hash;
}

/**
 * Main serverless function handler
 */
module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Generate authentication parameters
    const ts = new Date().getTime().toString();
    const hash = generateHash(ts, MARVEL_PRIVATE_KEY, MARVEL_PUBLIC_KEY);

    // Get query parameters from the request
    const { limit = '50', offset = '0', orderBy = '-modified' } = req.query;

    // Build Marvel API URL
    const params = new URLSearchParams({
      ts,
      apikey: MARVEL_PUBLIC_KEY,
      hash,
      limit,
      offset,
      orderBy
    });

    const url = `${MARVEL_API_BASE}/characters?${params}`;

    // Dynamically import node-fetch for environments that need it
    // Vercel runtime has native fetch in newer versions
    let fetchFn = globalThis.fetch;
    if (!fetchFn) {
      const nodeFetch = await import('node-fetch');
      fetchFn = nodeFetch.default || nodeFetch;
    }

    // Fetch from Marvel API
    const response = await fetchFn(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Marvel API error response:', errorText);
      throw new Error(`Marvel API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    // Return the data
    return res.status(200).json(data);

  } catch (error) {
    console.error('Error fetching from Marvel API:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch Marvel data',
      message: error.message 
    });
  }
};
