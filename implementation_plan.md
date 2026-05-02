# Implementation Plan - MindMap (Mood-Aware Study Companion)

Build a full-stack MVP that leverages IBM Cloud services and Gemini AI to create a personalized, mood-aware study experience.

## User Review Required

> [!IMPORTANT]
> **IBM Cloud Credentials**: You will need to provide credentials for App ID, Cloudant, and Watson NLU in the `.env` files. I will create the templates.
> **Gemini API Key**: Required for the study planner and reflection prompts.
> **Deployment**: The plan targets IBM Code Engine (backend) and Vercel (frontend), but initial development will be local.

## Proposed Changes

### [Project Scaffolding]

#### [NEW] [backend/package.json](file:///C:/Users/krish/Downloads/MindMap/server/package.json)
Initialize Express app with dependencies: `express`, `cors`, `dotenv`, `axios`, `ibm-watson`, `@google/generative-ai`, `@ibmcloud/cloudant`, `ibmcloud-appid`.

#### [NEW] [frontend/package.json](file:///C:/Users/krish/Downloads/MindMap/client/package.json)
Initialize Vite + React project with dependencies: `react-router-dom`, `recharts`, `axios`, `ibmcloud-appid-js`, `lucide-react`, `framer-motion`.

---

### [Backend - Express.js]

#### [NEW] [server/middleware/auth.js](file:///C:/Users/krish/Downloads/MindMap/server/middleware/auth.js)
Implement token validation using App ID's introspection or standard JWT verification (as per user request using App ID introspection).

#### [NEW] [server/routes/api.js](file:///C:/Users/krish/Downloads/MindMap/server/routes/api.js)
- `POST /analyseAndPlan`: Watson NLU for mood + Gemini for scheduling.
- `POST /getReflection`: Gemini for post-session prompts.
- `POST /getWeeklyInsight`: Gemini for pattern analysis.
- `POST /saveSession`: Cloudant write.
- `GET /history`: Cloudant read (last 7 days).

#### [NEW] [server/utils/moodMapper.js](file:///C:/Users/krish/Downloads/MindMap/server/utils/moodMapper.js)
Logic to map Watson NLU raw emotions to MindMap mood states (low_mood, anxious, burned_out, focused, calm).

---

### [Frontend - React]

#### [NEW] [client/src/services/appid.js](file:///C:/Users/krish/Downloads/MindMap/client/src/services/appid.js)
Wrapper for `ibmcloud-appid-js` to handle PKCE flow, signin, and logout.

#### [NEW] [client/src/components/](file:///C:/Users/krish/Downloads/MindMap/client/src/components/)
- `PomodoroTimer.jsx`: Progress-based countdown.
- `BreathingAnimation.jsx`: CSS 4-7-8 circle animation.
- `MoodTrendChart.jsx`: Recharts implementation for energy/focus/stress.
- `MoodJournal.jsx`: Interactive journaling interface.

#### [NEW] [client/src/pages/](file:///C:/Users/krish/Downloads/MindMap/client/src/pages/)
- `Home.jsx`: Landing/Journaling.
- `Session.jsx`: Study mode with timer and music.
- `Dashboard.jsx`: Insights and history.

---

### [Styling & Aesthetics]

- **Theme**: "Ethereal Study" - Deep indigos, soft violets, glassmorphism components.
- **Animations**: `framer-motion` for page transitions and card entries.
- **Typography**: Inter / Outfit for a modern feel.

## Verification Plan

### Automated Tests
- Backend: Test NLU mapping logic with mock Watson responses.
- Backend: Verify Gemini prompts return valid JSON.

### Manual Verification
- Test App ID login flow (redirect to IBM and back).
- Verify timer auto-advances to break screen.
- Check Cloudant for saved session documents.
