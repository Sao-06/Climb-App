# Mission Generator - Usage Guide

## Overview

The Mission Generator uses OpenAI's Gemini API to intelligently create personalized missions based on user goals. Users input their goals, select preferences (category, difficulty, timeframe), and the AI generates 3 mission options with detailed subtasks.

## Components

### 1. **missionGenerator.ts** (`lib/missionGenerator.ts`)
The core service that handles mission generation using the Gemini API.

**Key Classes & Functions:**
- `MissionGeneratorService` - Main service class
  - `generateMissionsFromGoal(input: MissionInput)` - Generate missions from user goals
  - `getRecommendedMissions(userGoals[], userProfile)` - Get recommendations

**Interfaces:**
```typescript
interface MissionInput {
  userGoal: string;                          // User's goal
  category?: 'health' | 'productivity' | ... // Goal category
  timeframe?: 'daily' | 'weekly' | 'monthly' // Time to complete
  difficulty?: 'easy' | 'medium' | 'hard'   // Challenge level
  userProfile?: { name, level, pastGoals }  // User context
}

interface GeneratedMission {
  title: string;              // Mission title
  description: string;        // What it achieves
  mainTask: Task;            // Full task with subtasks
  category: string;          // Mission category
  estimatedDays: number;     // Days to complete
  motivation: string;        // Motivational message
}
```

### 2. **MissionGenerator.tsx** (`components/MissionGenerator.tsx`)
React Native UI component for the mission generation flow.

**Features:**
- Input form for user goals
- Category, difficulty, and timeframe selectors
- Beautiful mission preview cards
- One-click mission selection
- Fallback UI when generation fails

**Props:**
```typescript
interface MissionGeneratorProps {
  onMissionSelect?: (mission: GeneratedMission) => void;
  userProfile?: any;
}
```

## Usage Examples

### Basic Mission Generation

```typescript
import { missionGenerator } from '@/lib/missionGenerator';

// Generate missions from a goal
const missions = await missionGenerator.generateMissionsFromGoal({
  userGoal: 'Learn React Native',
  category: 'learning',
  difficulty: 'medium',
  timeframe: 'weekly'
});

console.log(missions); // Array of 3 GeneratedMission objects
```

### Using in Components

```typescript
import { MissionGenerator } from '@/components/MissionGenerator';
import { appManager } from '@/lib/integrationExample';

export function TasksScreen() {
  const handleMissionSelect = (mission: GeneratedMission) => {
    console.log(`Mission "${mission.title}" selected`);
    // Mission is automatically added to app via appManager
  };

  return (
    <MissionGenerator 
      onMissionSelect={handleMissionSelect}
      userProfile={userProfile}
    />
  );
}
```

### Integration with AppManager

```typescript
import { appManager } from '@/lib/integrationExample';

// Generate missions directly from app manager
const missions = await appManager.generateMissionsFromGoal({
  userGoal: 'Master TypeScript',
  category: 'learning',
  difficulty: 'hard'
});

// Get recommended missions
const recommendations = await appManager.getRecommendedMissions([
  'Learn React',
  'Improve fitness',
  'Read more'
]);
```

## How It Works

### Flow Diagram

```
User Input (Goal)
    ↓
Build Prompt (with context)
    ↓
Call Gemini API
    ↓
Parse Response (extract JSON)
    ↓
Convert to GeneratedMission objects
    ↓
Display in UI
    ↓
User Selects Mission
    ↓
Add to appManager (saved to AsyncStorage)
```

### The Generation Process

1. **User Input**: User enters goal and preferences
2. **Prompt Building**: Service creates a detailed prompt with:
   - User's goal and context
   - Difficulty preferences
   - Category and timeframe
   - User profile info (level, past goals)
3. **API Call**: Sends prompt to Gemini API
4. **Parsing**: Extracts JSON from response
5. **Conversion**: Transforms AI output into Task objects with:
   - Automatically calculated point values
   - Difficulty levels for each subtask
   - Estimated time ranges
6. **Storage**: Missions saved to AsyncStorage via appManager
7. **Coaching**: AI provides motivational message

## API Response Example

The Gemini API returns missions in this format:

```json
[
  {
    "title": "Master React Native Fundamentals",
    "description": "Build a strong foundation in React Native development",
    "subtasks": [
      {
        "title": "Set up development environment",
        "points": 25,
        "difficulty": "easy"
      },
      {
        "title": "Learn core concepts (JSX, components, hooks)",
        "points": 75,
        "difficulty": "medium"
      },
      {
        "title": "Build a sample app",
        "points": 100,
        "difficulty": "hard"
      }
    ],
    "estimatedDays": 14,
    "motivation": "You're building the skills for modern app development!",
    "category": "learning"
  }
]
```

## Point Value System

The service automatically assigns points based on difficulty:
- **Easy**: 15-40 points (15-30 minutes)
- **Medium**: 50-75 points (30-45 minutes)
- **Hard**: 100+ points (60+ minutes)

Total mission points = sum of all subtask points

## Error Handling

If the Gemini API fails or response can't be parsed:
1. Service returns 2 default missions as fallback
2. Default missions cover "Master Goal" and "Quick Win" approaches
3. User can still complete missions even without AI generation
4. Console logs show error details for debugging

## Features

✅ **Personalized Generation**
- Takes user profile into account
- Considers past goals and experience level
- Adjusts difficulty based on preference

✅ **Flexible Options**
- 6 goal categories (health, productivity, learning, fitness, career, personal)
- 3 difficulty levels (easy, medium, hard)
- 3 timeframes (daily, weekly, monthly)

✅ **Beautiful UI**
- Smooth modal animation
- Responsive design
- Visual feedback on selection

✅ **Integration**
- Automatically saves to AsyncStorage
- Tracks analytics
- Provides coaching messages
- Adds points when completed

## Configuration

Set your Gemini API key in `.env`:
```
EXPO_PUBLIC_GEMINI_API_KEY=your_api_key_here
```

## Troubleshooting

**Q: Missions not generating?**
- Check API key is set correctly
- Verify Gemini API is enabled
- Check console for error messages

**Q: Points seem wrong?**
- Review the point calculation in `calculateTotalPoints()`
- Check individual subtask point values

**Q: Missions not saving?**
- Verify AsyncStorage is initialized
- Check appManager.initialize() is called
- Review persistenceService logs

## Future Enhancements

- [ ] Support for image-based goal input
- [ ] Mission templates and variations
- [ ] Real-time progress tracking
- [ ] AI-generated difficulty adjustments
- [ ] Social mission sharing
- [ ] Custom reward systems
