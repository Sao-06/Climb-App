# Team Feature Implementation Guide

## Overview

The Team feature enables players to form climbing parties where they can work together toward shared and individual goals while earning bonus rewards through consistency. Teams can be **public** (discoverable) or **private** (invite-only), with members earning points both individually and as a group.

## Features

### 1. Team Creation & Management

**Public Teams:**
- Anyone can discover and join
- Open enrollment
- Perfect for global climbing communities

**Private Teams:**
- Invite-only with shareable invite codes
- Ideal for friends or small groups
- Maximum member settings

#### Creating a Team
```typescript
import { createTeam } from '@/lib/teamService';

const team = await createTeam(
  user,                // UserProfile
  'Summit Squad',       // Team name
  'A group of dedicated climbers', // Description
  true,                // isPublic
  10                   // maxMembers
);
```

#### Joining Teams
```typescript
// Join public team
import { joinPublicTeam } from '@/lib/teamService';
const team = await joinPublicTeam(user, teamId);

// Join private team with code
import { joinPrivateTeamWithCode } from '@/lib/teamService';
const team = await joinPrivateTeamWithCode(user, 'ABC123');
```

### 2. Dual Mission System

#### Individual Missions
Players complete personal missions that contribute to team progress. Each member can do their own set of missions while the team tracks overall completion.

```typescript
import { createTeamIndividualMission } from '@/lib/teamMissionsService';

const mission = await createTeamIndividualMission(
  teamId,
  'Daily Focus',
  'Complete 50 minutes of focused work',
  100,
  'easy'
);
```

#### Shared Team Missions
Collaborative missions where the entire team works together toward a common goal. Progress represents team contribution.

```typescript
import { createTeamSharedMission } from '@/lib/teamMissionsService';

const teamMission = await createTeamSharedMission(
  teamId,
  'Peak Challenge',
  'Team climbs 5000m total',
  500,
  'hard',
  {
    name: 'Summit Reached',
    requiredProgress: 100,
    reward: 1000  // Bonus points when milestone hit
  }
);
```

#### Mission Progress Tracking
```typescript
// Complete individual mission
import { completeIndividualMission } from '@/lib/teamMissionsService';
await completeIndividualMission(teamId, missionId, userId);

// Update shared mission progress
import { updateSharedMissionProgress } from '@/lib/teamMissionsService';
await updateSharedMissionProgress(teamId, missionId, userId, 25); // 25% progress
```

### 3. Team Rewards & Streaks

#### Streak System
- **Current Streak**: Days team has been active
- **All Members Consecutive**: Days ALL members completed a session
- **Streak Multiplier**: Base 1.0x, increases +0.1x per day (capped at 3.0x)

#### Bonus Points
All Pomodoro sessions earn bonus points based on streak:
```
Total Points = Base Points × Streak Multiplier
```

Example: 25-minute session on a 7-day streak:
- Base: 25 points
- Streak Multiplier: 1.7x (1.0 + 0.1×7)
- **Total: 42 points**

#### Team Levels
Teams gain 1 level per 5000 points earned, unlocking new rewards and cosmetics.

```typescript
const teamLevel = Math.max(1, Math.floor(teamPoints / 5000) + 1);
```

#### Streak Milestones
```
Day 3  → "On Fire" 🔥 (250 bonus points)
Day 7  → "Week Warrior" 💪 (500 bonus points)
Day 14 → "Fortnight Fighter" 🏆 (1000 bonus points)
Day 30 → "Month Master" 👑 (2000 bonus points)
Day 60 → "Legendary Climber" 🌟 (3000 bonus points)
Day 100→ "Unstoppable Force" ⚡ (5000 bonus points)
```

### 4. Pomodoro Integration

When team members complete Pomodoro sessions:

1. **Session recorded** with focus metrics
2. **Streak updated** based on daily participation
3. **Bonus points calculated** using streak multiplier
4. **Team rewards distributed** to all members
5. **Milestone checked** for special achievements

```typescript
import { recordTeamPomodoroSession } from '@/lib/pomodoroTeamService';

const result = await recordTeamPomodoroSession({
  userId: 'user123',
  teamId: 'team456',
  sessionDuration: 25,
  focusedMinutes: 24,
  distractionsCount: 0,
  completedSuccessfully: true
});

// Returns:
// {
//   basePoints: 24,
//   bonusPoints: 16,      // From streak multiplier
//   totalPoints: 40,
//   streakMultiplier: 1.67,
//   newStreak: 7
// }
```

### 5. Team Member Roles

- **Owner**: Can manage team, invite members, set mission goals, transfer ownership
- **Admin**: Can manage missions and members (promotes standard members)
- **Member**: Can complete missions and earn team rewards

## API Reference

### Team Service (`teamService.ts`)

#### Core Functions
```typescript
// Team Management
createTeam(owner, name, desc, isPublic, maxMembers) → Team
getTeamById(teamId) → Team | null
getAllTeams() → Team[]
getUserTeams(userId) → Team[]
updateTeam(teamId, updates) → Team | null
leaveTeam(userId, teamId) → boolean

// Joining
joinPublicTeam(user, teamId) → Team | null
joinPrivateTeamWithCode(user, code) → Team | null

// Streaks & Rewards
updateTeamStreak(teamId, userId) → TeamStreak | null
awardTeamStreakBonus(teamId, basePoints) → number
```

### Missions Service (`teamMissionsService.ts`)

```typescript
// Mission Creation
createTeamIndividualMission(teamId, title, desc, points, difficulty) → TeamMission | null
createTeamSharedMission(teamId, title, desc, points, difficulty, milestone?) → TeamMission | null

// Progress Tracking
completeIndividualMission(teamId, missionId, userId) → boolean
updateSharedMissionProgress(teamId, missionId, userId, progressDelta) → TeamMission | null

// Queries
getTeamMissions(teamId) → { individual, shared }
getMemberMissionProgress(teamId, userId) → { completedIndividual, inProgressIndividual, teamContributions }
resetDailyMissions(teamId) → boolean

// Recommendations
getMissionRecommendations(teamLevel) → [] of mission templates
```

### Pomodoro Integration (`pomodoroTeamService.ts`)

```typescript
// Session Recording
recordTeamPomodoroSession(sessionResult) → { basePoints, bonusPoints, totalPoints, etc }

// Status & Info
getTeamStreakStatus(teamId) → { currentStreak, multiplier, allMembersConsecutive, etc }
checkTeamStreakEligibility(teamId) → { isEligible, completedToday, missingMembers }
calculateSessionRewards(teamId, focusedMinutes) → { basePoints, streakBonus, totalPoints, multiplier }
getNextStreakMilestoneInfo(teamId) → { daysRemaining, nextMilestone, progress }

// Milestones
getStreakMilestones() → milestone list
checkStreakMilestone(currentStreak) → milestone info or null
```

## Data Models

### Team
```typescript
interface Team {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  members: TeamMember[];
  isPublic: boolean;
  inviteCode?: string;        // For private teams
  maxMembers: number;
  createdAt: Date;
  updatedAt: Date;
  
  // Missions
  individualMissions: TeamMission[];
  sharedMissions: TeamMission[];
  
  // Rewards
  teamPoints: number;
  teamLevel: number;
  teamRewards: TeamReward[];
  streak: TeamStreak;
}
```

### TeamMember
```typescript
interface TeamMember {
  userId: string;
  name: string;
  characterType: CharacterType;
  joinedAt: Date;
  role: 'owner' | 'admin' | 'member';
  individualMissionProgress: number;
  pomodoroSessionsCompleted: number;
}
```

### TeamStreak
```typescript
interface TeamStreak {
  currentStreak: number;              // Days of activity
  allMembersConsecutiveDays: number;  // Days all members active
  streakMultiplier: number;           // 1.0 to 3.0
  lastSessionDate: Date;
}
```

### TeamMission
```typescript
interface TeamMission extends Task {
  teamId: string;
  progress: number;                   // 0-100%
  teamMembersCompleted: string[];     // userIds
  milestone?: {
    name: string;
    requiredProgress: number;
    reward: number;
  };
}
```

## UI Components

### TeamDashboard
Main component handling:
- Team list display
- Create team modal
- Join team functionality
- Team detail view
- Member list with emojis
- Team stats (points, level, streak)
- Shared mission progress

Location: `components/TeamDashboard.tsx`

#### Usage
```tsx
import { TeamDashboard } from '@/components/TeamDashboard';

<TeamDashboard user={userProfile} />
```

### Integrated in Social Tab
The TeamDashboard is integrated into the main social/team tab, replacing the "Multiplayer Coming Soon" placeholder.

Location: `app/(tabs)/social.tsx`

## Storage

All team data is stored in AsyncStorage with the following keys:

```typescript
TEAM_STORAGE_KEYS = {
  TEAMS: '@climb:teams',                    // All teams []
  USER_TEAMS: '@climb:user_teams:{userId}', // User's team IDs []
  TEAM_INVITES: '@climb:team_invites',      // Invite codes []
  TEAM_STREAKS: '@climb:team_streaks',      // Streak data
}
```

## Usage Examples

### Complete Flow: Create Team → Add Mission → Record Session

```typescript
import { createTeam } from '@/lib/teamService';
import { createTeamSharedMission, completeIndividualMission } from '@/lib/teamMissionsService';
import { recordTeamPomodoroSession } from '@/lib/pomodoroTeamService';

// 1. Create team
const team = await createTeam(
  user,
  'Morning Climbers',
  'Wake up and climb together',
  false, // private
  8
);

// 2. Create shared mission
const mission = await createTeamSharedMission(
  team.id,
  'Daily Climb',
  'Team completes 100 total focus minutes',
  200,
  'easy'
);

// 3. Record Pomodoro session (user completes 25-min session)
const sessionReward = await recordTeamPomodoroSession({
  userId: 'user123',
  teamId: team.id,
  sessionDuration: 25,
  focusedMinutes: 24,
  distractionsCount: 0,
  completedSuccessfully: true
});

console.log(`User earned ${sessionReward.totalPoints} points!`);
console.log(`Current team streak: ${sessionReward.newStreak} days`);

// 4. Update mission progress
const updatedMission = await updateSharedMissionProgress(
  team.id,
  mission.id,
  'user123',
  24 // 24% progress toward 100 minutes
);
```

## Future Enhancements

- Team leaderboards with seasonal rankings
- Custom team badges and cosmetics
- Team-vs-team competitions
- Scheduled team challenges
- Advanced analytics and stats
- Voice/video chat integration
- Team announcements system
- Difficulty scaling based on team level
- Achievement system specific to teams

## Notes

- User identification currently uses `user.name` as ID (should use UUID in production)
- Toast/notification system recommended for milestone achievements
- Consider implementing rate limiting for mission creation
- Team streak resets if any member misses a day
- All times stored in UTC for consistency
