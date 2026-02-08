# Person 3: Gameplay & Features Expansion - File Organization

## 📂 Primary Working Files

### Social Features
```
Main Project (../../../)
├── app/(tabs)/
│   ├── social.tsx                 ← PRIMARY: Multiplayer/leaderboards
│   ├── _layout.tsx                ← Navigation setup
│   └── screens/
│       └── social/
│           ├── leaderboard.tsx    (to create)
│           ├── friends.tsx        (to create)
│           ├── team.tsx           (to create)
│           └── chat.tsx           (to create)
```

### Store Expansion
```
Main Project (../../../)
├── components/
│   ├── Store.tsx                  ← PRIMARY: Shop interface
│   └── ui/
│       └── CosmeticCard.tsx       (to create)
```

### Progression System
```
Main Project (../../../)
├── lib/
│   ├── progressionEngine.ts       (new - level/XP system)
│   ├── questSystem.ts             (new - daily challenges)
│   ├── prestigeSystem.ts          (new - prestige resets)
│   └── types.ts                   ← UPDATE: Add new types
```

### Dashboard Integration
```
Main Project (../../../)
├── components/
│   ├── Dashboard.tsx              ← Uses: Progression display
│   └── Climber.tsx                ← Uses: Character cosmetics
```

---

## 🔧 Setup Instructions

1. **Working directory:**
   ```bash
   cd ../../.. # Go to main project
   ```

2. **Primary focus - screens:**
   ```bash
   app/(tabs)/social.tsx
   app/(tabs)/screens/social/
   ```

3. **Secondary focus - components:**
   ```bash
   components/Store.tsx
   ```

4. **New systems to create:**
   ```bash
   lib/
   ├── progressionEngine.ts
   ├── questSystem.ts
   ├── prestigeSystem.ts
   └── socialService.ts (backend integration)
   ```

---

## 📋 Task Breakdown

### Task 1: Social & Multiplayer
**File:** `app/(tabs)/social.tsx` + new screens
- [ ] Friend system (add/remove/block)
- [ ] Leaderboards (global, weekly, seasonal)
- [ ] Team/party mechanics
- [ ] Chat system
- [ ] Social achievements

### Task 2: Advanced Store
**File:** `components/Store.tsx`
- [ ] Character customization (skins, pets, accessories)
- [ ] Seasonal cosmetics & limited editions
- [ ] Cosmetic shop & transactions
- [ ] Equipment tier/rarity system
- [ ] Item preview system

### Task 3: Progression System
**File:** `lib/progressionEngine.ts` (new)
- [ ] Leveling system (1-100+)
- [ ] Skill trees / specializations
- [ ] Daily/weekly challenges
- [ ] Prestige/reset mechanics
- [ ] Battle pass system

---

## 🗂️ New File Structure

```
app/(tabs)/
├── social.tsx
└── screens/
    ├── social/
    │   ├── _layout.tsx
    │   ├── index.tsx (leaderboards)
    │   ├── friends.tsx
    │   ├── team.tsx
    │   └── chat.tsx
    └── progression/ (optional)
        ├── leveling.tsx
        ├── quests.tsx
        └── prestige.tsx

lib/
├── progressionEngine.ts    (NEW)
├── questSystem.ts          (NEW)
├── prestigeSystem.ts       (NEW)
├── socialService.ts        (NEW)
└── types.ts               (UPDATE)

components/
└── Store.tsx (UPDATE)
```

---

## 📊 Data Models

Add to `lib/types.ts`:

```typescript
// Social
interface Friend {
  id: string;
  username: string;
  level: number;
  avatar: string;
  status: 'online' | 'offline' | 'playing';
}

interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  score: number;
  level: number;
  avatar: string;
}

interface Team {
  id: string;
  name: string;
  members: string[]; // user IDs
  createdAt: Date;
  totalXP: number;
}

// Store
interface Cosmetic {
  id: string;
  name: string;
  type: 'skin' | 'pet' | 'accessory' | 'equipment';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  price: number;
  owned: boolean;
  seasonal?: string;
  limitedEdition?: boolean;
  preview: string; // image/emoji
}

// Progression
interface ProgressionData {
  level: number;
  xp: number;
  altitude: number;
  totalXpRequired: number;
  specialization?: string; // skill tree choice
}

interface Quest {
  id: string;
  title: string;
  description: string;
  objective: string;
  reward: number;
  deadline: Date;
  type: 'daily' | 'weekly' | 'seasonal';
  completed: boolean;
}
```

---

## 🔌 Backend Integration Points

### Social/Leaderboard Data
- Needs real-time sync (Firebase Firestore, Supabase, or custom API)
- Leaderboard rankings update daily
- Friend requests and notifications
- Chat history storage

### Store
- Cosmetics catalog
- Purchase history
- Owned items tracking
- Seasonal item availability

### Progression
- User XP and level tracking
- Achievement/quest completion
- Prestige history
- Difficulty scaling

---

## ⚠️ Important Notes

- **Do NOT** modify UI components (handled by Person 1)
- **Do NOT** modify backend AI (handled by Person 2)
- **Do NOT** create tests here (handled by Person 4)
- **COORDINATE** with Person 2 on data persistence for social features
- **COORDINATE** with Person 1 on Store UI styling
- Handle offline scenarios gracefully
- Balance progression to keep gameplay engaging

---

## 🚀 Git Workflow for This Branch

```bash
# From main project directory
git checkout -b feature/gameplay-expansion
npm install

# Create new components and systems
# Update types as needed
npm start

git add .
git commit -m "feat: gameplay expansion - [describe change]"
git push origin feature/gameplay-expansion
```

---

## 🎮 Balance Considerations

- XP requirements should scale with level (exponential curve)
- Cosmetics pricing should be fair but encourage engagement
- Daily quests should be completable in ~15-30 minutes
- Prestige should reward consistent players
- Seasonal cosmetics create urgency without FOMO
