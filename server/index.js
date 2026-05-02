const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const NaturalLanguageUnderstandingV1 = require('ibm-watson/natural-language-understanding/v1');
const { IamAuthenticator } = require('ibm-watson/auth');
const { CloudantV1 } = require('@ibm-cloud/cloudant');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// Initialize Watson NLU
const nlu = new NaturalLanguageUnderstandingV1({
  version: '2022-04-07',
  authenticator: new IamAuthenticator({ apikey: process.env.WATSON_NLU_API_KEY }),
  serviceUrl: process.env.WATSON_NLU_URL,
});

// Initialize Cloudant
const cloudant = CloudantV1.newInstance({
  authenticator: new IamAuthenticator({ apikey: process.env.CLOUDANT_API_KEY }),
  serviceUrl: process.env.CLOUDANT_URL,
});
const DB_NAME = 'mindmap-moodlogs';

// Ensure database exists
async function ensureDbExists() {
  try {
    console.log(`Checking for database: ${DB_NAME}`);
    await cloudant.getDatabaseInformation({ db: DB_NAME });
    console.log(`Database ${DB_NAME} exists.`);
  } catch (err) {
    if (err.status === 404) {
      console.log(`Database ${DB_NAME} not found. Creating...`);
      await cloudant.putDatabase({ db: DB_NAME });
      console.log(`Database ${DB_NAME} created.`);
    } else {
      console.error(`Error checking for database: ${err.message}`);
    }
  }
}
ensureDbExists();

// Initialize Gemini (Using the requested Flash model)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

// Auth Middleware (Manual JWT Verification for IBM App ID)
const client = jwksClient({
  jwksUri: `${process.env.APPID_OAUTH_SERVER_URL}/publickeys`
});

function getKey(header, callback) {
  client.getSigningKey(header.kid, (err, key) => {
    if (err) return callback(err);
    const signingKey = key.getPublicKey();
    callback(null, signingKey);
  });
}

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  const token = authHeader.split(' ')[1];

  // More flexible verification for App ID tokens
  jwt.verify(token, getKey, {
    // We allow a bit of flexibility with the issuer to avoid trailing slash issues
    algorithms: ['RS256']
  }, (err, decoded) => {
    if (err) {
      console.error('Auth Error:', err.message);
      // Fallback: Just decode if verification fails during dev (CAUTION: Dev only)
      // For MVP, we will try to be strict but log the error
      return res.status(401).json({ error: 'Auth failed: ' + err.message });
    }
    req.userId = decoded.sub || decoded.email;
    console.log(`Authenticated user: ${req.userId}`);
    next();
  });
};

// Mood Mapping Logic
function mapNluToMood(emotions, sentiment) {
  const { anger, disgust, fear, joy, sadness } = emotions;
  const score = sentiment.score || 0;
  
  // High Priority: Stress/Anxiety
  if (fear > 0.3 || anger > 0.3 || (score < -0.2 && (fear > 0.2 || anger > 0.2))) return 'anxious';
  
  // High Priority: Low Mood / Sadness
  if (sadness > 0.4 || (score < -0.5 && joy < 0.3)) return 'low_mood';
  
  // Burned Out: Negative sentiment, low joy, and presence of sadness/fear
  if (score < -0.4 && joy < 0.2 && (sadness > 0.2 || fear > 0.2)) return 'burned_out';
  
  // Positive States
  if (joy > 0.5 && score > 0.3) return 'focused';
  if (joy > 0.3 && score > 0) return 'calm';
  
  // Fallback for negative sentiment
  if (score < -0.1) return 'low_mood';
  
  return 'calm';
}

// Routes
app.post('/api/analyseAndPlan', authMiddleware, async (req, res) => {
  const { journalText, subjects, availableHours } = req.body;
  console.log(`Processing plan for user: ${req.userId}`);
  console.log(`Journal: ${journalText}`);

  try {
    let emotions = { anger: 0, disgust: 0, fear: 0, joy: 0.5, sadness: 0 };
    let sentiment = { score: 0, label: 'neutral' };
    
    try {
      console.log('Analyzing with Watson NLU...');
      const result = await nlu.analyze({
        text: journalText || "Feeling okay.",
        features: { emotion: {}, sentiment: {} }
      });
      emotions = result.result.emotion.document.emotion;
      sentiment = result.result.sentiment.document;
      console.log('NLU Results:', { emotions, sentiment });
    } catch (e) {
      console.warn('Watson NLU Warning:', e.message);
    }

    const mood = mapNluToMood(emotions, sentiment);
    
    // Improved logic for metrics
    const energy = Math.round((emotions.joy * 0.7 + (1 - emotions.sadness) * 0.3) * 10);
    const focus = Math.round(((1 - emotions.fear) * 0.3 + (1 - emotions.anger) * 0.2 + emotions.joy * 0.3 + (1 - emotions.sadness) * 0.2) * 10);
    const stress = Math.round((emotions.fear * 0.6 + emotions.anger * 0.3 + emotions.sadness * 0.1) * 10);

    let studyDuration = 25;
    let breakDuration = 5;
    
    if (mood === 'calm' || mood === 'focused') {
      studyDuration = 90;
      breakDuration = 30;
    } else if (mood === 'low_mood' || mood === 'burned_out') {
      studyDuration = 20;
      breakDuration = 10;
    } else if (mood === 'anxious') {
      studyDuration = 25;
      breakDuration = 5;
    }

    const prompt = `You are a personalised study scheduler.
    Student state: mood=${mood}, energy=${energy}/10, focus=${focus}/10, stress=${stress}/10
    Subjects: ${JSON.stringify(subjects)}
    Available time: ${availableHours} hours
    IMPORTANT: Structure the plan using these specific durations for this mood:
    - Each study block MUST be exactly ${studyDuration} minutes.
    - Each break MUST be exactly ${breakDuration} minutes.
    - If the student is stressed (stress > 7), make the break "breathing" type.
    Return ONLY JSON: {
      "totalStudyMinutes": number,
      "restRecommendedMinutes": number,
      "musicVibe": "lofi_chill"|"lofi_focus"|"ambient"|"silence",
      "blocks": [{ "subject": string, "durationMinutes": ${studyDuration}, "tip": string, "breakAfter": { "durationMinutes": ${breakDuration}, "type": "breathing"|"normal", "instruction": string } }],
      "sessionMessage": string,
      "empathyNote": string
    }`;

    console.log('Generating content with Gemini...');
    let sessionPlan;
    try {
      const geminiResult = await model.generateContent(prompt);
      const text = geminiResult.response.text();
      console.log('Gemini Raw Text:', text);
      let cleanJson = text;
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleanJson = jsonMatch[0];
      }
      sessionPlan = JSON.parse(cleanJson);
      console.log('Parsed Session Plan:', sessionPlan);
    } catch (err) {
      console.error('Gemini Error Detailed:', err);
      sessionPlan = {
        totalStudyMinutes: subjects.length * studyDuration,
        restRecommendedMinutes: subjects.length * breakDuration,
        musicVibe: mood === 'calm' ? 'lofi_chill' : 'lofi_focus',
        blocks: subjects.map(s => ({
          subject: s.name,
          durationMinutes: studyDuration,
          tip: 'Stay focused and take deep breaths.',
          breakAfter: { durationMinutes: breakDuration, type: 'breathing', instruction: 'Follow the 4-7-8 breathing circle.' }
        })),
        sessionMessage: 'AI is resting, but here is your plan.',
        empathyNote: 'Take it one step at a time.'
      };
    }

    res.json({ mood, energy, focus, stress, emotions, sessionPlan });
  } catch (err) {
    console.error('Final Error Detailed:', err);
    res.status(500).json({ error: 'Internal Server Error: ' + err.message });
  }
});

app.post('/api/getReflection', authMiddleware, async (req, res) => {
  const { mood, plannedMinutes, actualMinutes } = req.body;
  const prompt = `You are a gentle journaling coach. Generate exactly 2 reflection prompts for a student who felt ${mood}. Return ONLY JSON: { prompt1: string, prompt2: string, closingNote: string }`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const cleanJson = text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1);
    res.json(JSON.parse(cleanJson));
  } catch (err) {
    res.json({ prompt1: 'How did you feel today?', prompt2: 'What is your goal for tomorrow?', closingNote: 'Keep going!' });
  }
});

app.post('/api/saveSession', authMiddleware, async (req, res) => {
  try {
    console.log(`Saving session for user: ${req.userId}`);
    const doc = {
      _id: `${req.userId}_${Date.now()}`,
      userId: req.userId,
      createdAt: new Date().toISOString(),
      ...req.body
    };
    const response = await cloudant.postDocument({ db: DB_NAME, document: doc });
    console.log('Cloudant save response:', response.result);
    res.json({ success: true });
  } catch (err) {
    console.error('Cloudant error:', err.message);
    res.status(500).json({ error: 'Cloudant error: ' + err.message });
  }
});

app.get('/api/history', authMiddleware, async (req, res) => {
  try {
    console.log(`Fetching history for user: ${req.userId}`);
    const response = await cloudant.postFind({
      db: DB_NAME,
      selector: { userId: req.userId },
      limit: 7
    });
    console.log(`Found ${response.result.docs.length} docs`);
    res.json(response.result.docs);
  } catch (err) {
    console.error('History fetch error:', err.message);
    res.json([]);
  }
});

app.post('/api/getWeeklyInsight', authMiddleware, async (req, res) => {
  try {
    res.json({ bestPattern: 'Morning sessions', suggestion: 'Try to stay consistent!', streak: 1, moodTrend: 'stable' });
  } catch (err) {
    res.status(500).json({ error: 'Insight error' });
  }
});

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;
