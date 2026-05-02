const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: './server/.env' });

async function testGemini() {
  const key = process.env.GEMINI_API_KEY;
  console.log('Using Key:', key ? 'FOUND' : 'MISSING');
  if (!key) return;

  const genAI = new GoogleGenerativeAI(key);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  try {
    const result = await model.generateContent("Say hello");
    console.log('Response:', result.response.text());
  } catch (err) {
    console.error('Gemini Error:', err.message);
  }
}

testGemini();
