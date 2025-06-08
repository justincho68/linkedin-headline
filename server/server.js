const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Add this right after dotenv.config();
console.log('API Key loaded:', process.env.GOOGLE_API_KEY ? 'Yes' : 'No');
console.log('API Key starts with:', process.env.GOOGLE_API_KEY ? process.env.GOOGLE_API_KEY.substring(0, 7) + '...' : 'Not found');

const app = express();
const port = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// configure google ai
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

const model = genAI.getGenerativeModel({model: "gemini-pro"});

// API endpoint for headline generation
app.post('/api/generate-headlines', async (req, res) => {
  try {
    console.log('Request body:', req.body);
    
    const { currentTitle, yearsExperience, industry, keySkills, targetRole, style } = req.body;
    
    // Validate required fields
    if (!currentTitle || !yearsExperience || !industry || !keySkills) {
      console.log('Missing required fields:', { currentTitle, yearsExperience, industry, keySkills });
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    console.log('Making Google Gemini API call...');
    
    // Create the prompt
    const prompt = `You are a professional LinkedIn headline writer. Generate 3 LinkedIn headlines for a ${industry} professional with the following information:
- Current Title: ${currentTitle}
- Years of Experience: ${yearsExperience}
- Key Skills: ${keySkills}
- Target Role: ${targetRole || 'Not specified'}
- Style: ${style || 'Professional'}

The headlines should be concise, impactful, and highlight the person's expertise. Each headline should be on a new line.`;
    
    // Replace OpenAI call with Gemini call
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    
    console.log('Gemini response:', result);
    
    const headlinesText = result.response.text().trim();
    const headlines = headlinesText.split('\n').filter(line => line.trim() !== '');
    
    console.log('Processed headlines:', headlines);
    
    res.json({ headlines });
  } catch (error) {
    console.error('Detailed error:', error);
    res.status(500).json({ error: 'Failed to generate headlines', details: error.message });
  }
});

//test endpoint to check API key
app.get('/api/test-key', (req, res) => {
  const hasKey = !!process.env.OPENAI_API_KEY;
  const keyPrefix = hasKey ? process.env.OPENAI_API_KEY.substring(0, 7) + '...' : 'Not found';
  
  res.json({
    hasApiKey: hasKey,
    keyPrefix: keyPrefix,
    keyLength: hasKey ? process.env.OPENAI_API_KEY.length : 0
  });
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});