# Person 2: AI/Backend Enhancement - File Organization

## 📂 Primary Working Files

### Backend Services
```
Main Project (../../../)
├── lib/
│   ├── geminiService.ts           ← PRIMARY: AI integration
│   ├── types.ts                   ← Reference: Type definitions
│   └── constants.ts               ← Reference: Constants
```

### Components Using Backend
```
Main Project (../../../)
├── components/
│   ├── Dashboard.tsx              ← Uses: Coach advice
│   └── TaskBoard.tsx              ← Uses: AI task breakdown
```

### Navigation Screens
```
Main Project (../../../)
├── app/(tabs)/
│   ├── index.tsx                  ← Dashboard integration
│   └── tasks.tsx                  ← TaskBoard integration
```

---

## 🔧 Setup Instructions

1. **Working directory:**
   ```bash
   cd ../../.. # Go to main project
   ```

2. **Primary focus:**
   ```bash
   lib/geminiService.ts
   ```

3. **New files to create:**
   ```bash
   lib/
   ├── coachSystem.ts              (new - motivational logic)
   ├── persistenceService.ts       (new - data storage)
   ├── questSystem.ts              (new - quest/challenge logic)
   └── analyticsService.ts         (new - performance tracking)
   ```

4. **Dependencies to install:**
   - `expo-av@^14.0.5` (audio)
   - `@google/genai@^1.40.0` (AI)
   - `@react-native-async-storage/async-storage` (persistence)
   - Firebase or Supabase (cloud sync - TBD)

---

## 📋 Task Breakdown

### Task 1: Enhanced Gemini Integration
**File:** `lib/geminiService.ts`
- [ ] Advanced prompt engineering
- [ ] Conversation history
- [ ] Error handling & retries
- [ ] Performance analytics
- [ ] Rate limiting & caching

### Task 2: Coaching System
**File:** `lib/coachSystem.ts` (new)
- [ ] Context-aware advice
- [ ] Personalized messages
- [ ] Achievement tracking
- [ ] Difficulty progression
- [ ] Streak system

### Task 3: Data Persistence
**File:** `lib/persistenceService.ts` (new)
- [ ] AsyncStorage integration
- [ ] Cloud sync (Firebase/Supabase)
- [ ] Backup/restore
- [ ] Offline-first sync
- [ ] Schema migrations

---

## 🗂️ Reference Map

| File | Purpose | Frequency |
|------|---------|-----------|
| geminiService.ts | AI task breakdown | Every task creation |
| coachSystem.ts | Motivational messages | During gameplay |
| persistenceService.ts | Save/load game state | On app events |
| analyticsService.ts | Track performance | Ongoing |

---

## 📊 Data Models

Create/update in `lib/types.ts`:

```typescript
interface Task {
  id: string;
  title: string;
  description: string;
  subtasks: Subtask[];
  createdAt: Date;
  completedAt?: Date;
}

interface UserProgress {
  level: number;
  xp: number;
  altitude: number;
  streak: number;
  achievements: Achievement[];
}

interface CoachAdvice {
  id: string;
  message: string;
  timestamp: Date;
  context: string; // time of day, user pattern, etc
}
```

---

## 🔌 API Integration Points

### Gemini API
- Endpoint: `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent`
- Auth: `EXPO_PUBLIC_GEMINI_API_KEY` environment variable
- Usage: Task breakdown, advice generation

### AsyncStorage
- Key patterns: `user:progress`, `tasks:*`, `user:achievements`
- Backup: `backup:timestamp`

### Cloud Backend (Future)
- Firebase Firestore or Supabase PostgreSQL
- Real-time sync for multiplayer
- Leaderboard data

---

## ⚠️ Important Notes

- **Do NOT** modify UI components (handled by Person 1)
- **Do NOT** modify navigation/routes (handled by Person 3)
- **Do NOT** create tests here (handled by Person 4)
- Always provide fallback data for offline scenarios
- Keep API keys secure in environment variables
- Handle all async operations with proper error handling

---

## 🚀 Git Workflow for This Branch

```bash
# From main project directory
git checkout -b feature/ai-enhancements
npm install
npm install --save-dev @react-native-async-storage/async-storage

# Create services
# npm start to test
git add .
git commit -m "feat: AI enhancement - [describe change]"
git push origin feature/ai-enhancements
```

---

## 🧪 Testing Considerations

- Test offline scenarios (no internet)
- Test API rate limiting
- Test data persistence across app restarts
- Test with different network speeds (throttle in DevTools)
- Verify no sensitive data in logs
