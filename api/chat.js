module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-sempai-token');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const token = req.headers['x-sempai-token'];
  if (token !== process.env.SEMPAI_SECRET) {
    return res.status(401).json({ error: 'No autorizado' });
  }

  try {
    const { messages, system, hasImage, needsLegalSearch } = req.body;

    const model = hasImage
      ? 'claude-sonnet-4-6'
      : 'claude-haiku-4-5-20251001';

    const requestBody = {
      model,
      max_tokens: 800,
      temperature: 1.0,
      system,
      messages,
    };

    if (needsLegalSearch) {
      requestBody.tools = [
        { type: 'web_search_20250305', name: 'web_search' }
      ];
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};