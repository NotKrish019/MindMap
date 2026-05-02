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

// Initialize Gemini (Using the requested Flash model)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

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
  if (sadness > 0.6 || disgust > 0.5) return 'low_mood';
  if (fear > 0.5 || anger > 0.4) return 'anxious';
  if (sentiment.score < -0.4 && joy < 0.3) return 'burned_out';
  if (joy > 0.6 && sentiment.score > 0.3) return 'focused';
  return 'calm';
}

// Routes
app.post('/api/analyseAndPlan', authMiddleware, async (req, res) => {
  const { journalText, subjects, availableHours } = req.body;

  try {
    let emotions = { anger: 0, disgust: 0, fear: 0, joy: 0.5, sadness: 0 };
    let sentiment = { score: 0, label: 'neutral' };
    
    try {
      const result = await nlu.analyze({
        text: journalText || "Feeling okay.",
        features: { emotion: {}, sentiment: {} }
      });
      emotions = result.result.emotion.document.emotion;
      sentiment = result.result.sentiment.document;
    } catch (e) {
      console.warn('Watson NLU Warning:', e.message);
    }

    const mood = mapNluToMood(emotions, sentiment);
    const energy = Math.round((emotions.joy * 0.6 + (1 - emotions.sadness) * 0.4) * 10);
    const focus = Math.round(((1 - emotions.fear) * 0.5 + (1 - emotions.anger) * 0.5) * 10);
    const stress = Math.round((emotions.fear * 0.5 + emotions.anger * 0.3 + emotions.sadness * 0.2) * 10);

    const prompt = `You are a personalised study scheduler.
    Student state: mood=${mood}, energy=${energy}/10, focus=${focus}/10, stress=${stress}/10
    Subjects: ${JSON.stringify(subjects)}
    Available time: ${availableHours} hours
    Return ONLY JSON: {
      totalStudyMinutes: number,
      restRecommendedMinutes: number,
      musicVibe: 'lofi_chill'|'lofi_focus'|'ambient'|'silence',
      blocks: [{ subject, durationMinutes, tip, breakAfter: { durationMinutes, type, instruction } }],
      sessionMessage: string,
      empathyNote: string
    }`;

    let sessionPlan;
    try {
      const geminiResult = await model.generateContent(prompt);
      const text = geminiResult.response.text();
      const cleanJson = text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1);
      sessionPlan = JSON.parse(cleanJson);
    } catch (err) {
      console.error('Gemini Error:', err.message);
      sessionPlan = {
        totalStudyMinutes: 60,
        restRecommendedMinutes: 10,
        musicVibe: 'lofi_focus',
        blocks: subjects.map(s => ({
          subject: s.name,
          durationMinutes: 25,
          tip: 'Stay focused and take deep breaths.',
          breakAfter: { durationMinutes: 5, type: 'breathing', instruction: 'Follow the 4-7-8 breathing circle.' }
        })),
        sessionMessage: 'AI is resting, but here is your plan.',
        empathyNote: 'Take it one step at a time.'
      };
    }

    res.json({ mood, energy, focus, stress, emotions, sessionPlan });
  } catch (err) {
    console.error('Final Error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
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
    const doc = {
      _id: `${req.userId}_${Date.now()}`,
      userId: req.userId,
      createdAt: new Date().toISOString(),
      ...req.body
    };
    await cloudant.postDocument({ db: DB_NAME, document: doc });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Cloudant error' });
  }
});

app.get('/api/history', authMiddleware, async (req, res) => {
  try {
    const response = await cloudant.postFind({
      db: DB_NAME,
      selector: { userId: req.userId },
      limit: 7
    });
    res.json(response.result.docs);
  } catch (err) {
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

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
