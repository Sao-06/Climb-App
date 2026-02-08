# 🧗 Climb App - Branch Organization Guide

## 📂 Complete File Organization by Branch

Each branch focuses on specific parts of the codebase while working from the main project directory.

---

## 🎨 Branch 1: Feature/UI-Enhancement (Person 1)

**Focus:** UI/UX, Animations, Component Library

### Working Files Location (in main project)
```
components/
├── Dashboard.tsx              ✏️ EDIT - Add smooth animations
├── TaskBoard.tsx              ✏️ EDIT - Improve UI & add swipes
├── Store.tsx                  ✏️ EDIT - Polish store interface
├── Climber.tsx                ✏️ EDIT - Smooth character animation
├── CharacterSelect.tsx        ✏️ REFERENCE
└── ui/                        ➕ CREATE new reusable components
    ├── Button.tsx
    ├── Card.tsx
    ├── Input.tsx
    └── index.ts

constants/
└── theme.ts                   ✏️ EDIT - Add spacing, colors

app/(tabs)/
├── _layout.tsx                ✏️ EDIT - Tab styling
├── index.tsx                  ✏️ EDIT - Dashboard screen
└── tasks.tsx                  ✏️ EDIT - Tasks screen
```

### Files in Branch Directory (Reference)
```
branches/feature-ui-enhancement/
├── README.md                  📖 Task list
├── FILE_ORGANIZATION.md       📍 THIS GUIDE
└── components/                📋 Links to main files
```

**Key Commands:**
```bash
git checkout -b feature/ui-enhancement
cd ../../..
npm start
```

---

## 🤖 Branch 2: Feature/AI-Enhancements (Person 2)

**Focus:** Gemini AI, Data Persistence, Coaching System

### Working Files Location (in main project)
```
lib/
├── geminiService.ts           ✏️ EDIT - Enhance AI prompts
├── coachSystem.ts             ➕ CREATE - Motivation logic
├── persistenceService.ts      ➕ CREATE - Data storage
├── analyticsService.ts        ➕ CREATE - Performance tracking
├── questSystem.ts             ➕ CREATE - Daily challenges
├── types.ts                   📖 REFERENCE
└── constants.ts               📖 REFERENCE

components/
├── Dashboard.tsx              ← Will use: Coach advice
└── TaskBoard.tsx              ← Will use: AI breakdown

app/(tabs)/
├── index.tsx                  ← Will use: Coach integration
└── tasks.tsx                  ← Will use: Persistence
```

### Files in Branch Directory (Reference)
```
branches/feature-ai-enhancements/
├── README.md                  📖 Task list
├── FILE_ORGANIZATION.md       📍 THIS GUIDE
└── lib/                       📋 Links to main files
```

**Key Commands:**
```bash
git checkout -b feature/ai-enhancements
cd ../../..
npm install @react-native-async-storage/async-storage
npm start
```

---

## 🎮 Branch 3: Feature/Gameplay-Expansion (Person 3)

**Focus:** Multiplayer, Store Expansion, Progression

### Working Files Location (in main project)
```
app/(tabs)/
├── social.tsx                 ✏️ EDIT - Multiplayer hub
└── screens/
    └── social/                ➕ CREATE new social screens
        ├── _layout.tsx
        ├── leaderboard.tsx
        ├── friends.tsx
        ├── team.tsx
        └── chat.tsx

components/
├── Store.tsx                  ✏️ EDIT - Add cosmetics
└── ui/
    └── CosmeticCard.tsx       ➕ CREATE - Cosmetic display

lib/
├── progressionEngine.ts       ➕ CREATE - Level system
├── questSystem.ts             ➕ CREATE - Daily quests
├── prestigeSystem.ts          ➕ CREATE - Prestige resets
├── socialService.ts           ➕ CREATE - Social backend
└── types.ts                   ✏️ EDIT - Add new data types
```

### Files in Branch Directory (Reference)
```
branches/feature-gameplay-expansion/
├── README.md                  📖 Task list
├── FILE_ORGANIZATION.md       📍 THIS GUIDE
├── components/                📋 Links to main files
└── app/                       📋 Links to main files
```

**Key Commands:**
```bash
git checkout -b feature/gameplay-expansion
cd ../../..
npm start
```

---

## 🧪 Branch 4: Feature/Testing-Optimization (Person 4)

**Focus:** Tests, Performance, DevOps, Builds

### Working Files Location (in main project)
```
__tests__/                     ➕ CREATE - All test files
├── lib/
│   ├── geminiService.test.ts
│   ├── types.test.ts
│   └── constants.test.ts
├── components/
│   ├── Dashboard.test.tsx
│   ├── TaskBoard.test.tsx
│   ├── Store.test.tsx
│   └── Climber.test.tsx
└── integration/
    ├── user-flow.test.tsx
    └── app-state.test.tsx

jest.config.js                 ➕ CREATE - Jest config
.github/workflows/
└── test.yml                   ➕ CREATE - CI/CD pipeline

eas.json                        ➕ CREATE - Build config
app.json                        ✏️ EDIT - Update build settings
tsconfig.json                   ✏️ EDIT - Test paths
package.json                    ✏️ EDIT - Add test scripts

lib/
└── performanceService.ts      ➕ CREATE - Perf monitoring
```

### Files in Branch Directory (Reference)
```
branches/feature-testing-optimization/
├── README.md                  📖 Task list
├── FILE_ORGANIZATION.md       📍 THIS GUIDE
└── __tests__/                 📋 Example test structure
```

**Key Commands:**
```bash
git checkout -b feature/testing-optimization
cd ../../..
npm install --save-dev jest @testing-library/react-native
npm test
```

---

## 🔄 Git Workflow Summary

### For Each Person:

```bash
# 1. Create your feature branch
git checkout -b feature/your-branch-name

# 2. Navigate to main project
cd ../../..

# 3. Install dependencies (if needed)
npm install

# 4. Start development
npm start

# 5. Make changes to files in main project
# Edit: components/, lib/, app/, etc.
# Create: New files as needed

# 6. Commit your work
git add .
git commit -m "feat: description of what you did"

# 7. Push to your branch
git push origin feature/your-branch-name

# 8. Create Pull Request on GitHub
# Request code review from team members
```

---

## 🔗 File Access Pattern

```
branches/
├── feature-ui-enhancement/
│   ├── README.md              ← Start here
│   └── FILE_ORGANIZATION.md   ← You are here
│
└── (Links to main project files)
        └── Navigate up: cd ../../..
        └── Work on files there
        └── Push changes to feature-* branch
```

### Example Workflow:
```bash
# Start in your branch directory
cd branches/feature-ui-enhancement

# Read your task list
cat README.md

# Go to main project to edit files
cd ../../..

# Edit files
code components/Dashboard.tsx

# Create new components
code components/ui/Button.tsx

# Test changes
npm start

# Commit to your branch
git add .
git commit -m "feat: dashboard animations"
git push origin feature/ui-enhancement
```

---

## 📋 File Symbol Key

| Symbol | Meaning |
|--------|---------|
| ✏️ EDIT | Modify existing file |
| ➕ CREATE | Create new file |
| 📖 REFERENCE | Read-only reference |
| 📍 THIS GUIDE | You are here |
| 📋 Links | Symbolic link to main files |

---

## ⚠️ Important Rules

### ✅ DO:
- Work on files in the main project directory (not in branches/)
- Push code to your feature branch
- Create pull requests for code review
- Keep your branch up to date with main
- Communicate with other team members

### ❌ DON'T:
- Copy files into branch directories
- Edit files in branches/ subdirectories directly
- Merge without code review
- Push to main branch directly
- Ignore merge conflicts

---

## 🚀 First Time Setup

Each person should do this once:

```bash
# 1. Navigate to your branch
cd branches/feature-your-branch

# 2. Read your instructions
cat README.md
cat FILE_ORGANIZATION.md

# 3. Go back to main project
cd ../../..

# 4. Install dependencies
npm install

# 5. Start working on assigned files
git checkout -b feature/your-branch-name
npm start
```

---

## 📞 Quick Reference

| Need Help? | Go to... |
|-----------|----------|
| Overall project structure | `TEAM_STRUCTURE.md` |
| Team coordination | `COORDINATION_HUB.md` |
| Your task list | `branches/feature-*/README.md` |
| Your file guide | `branches/feature-*/FILE_ORGANIZATION.md` |
| Git help | See Git Workflow Summary above |

---

## 🎯 Next Steps

1. Read your branch's `README.md` for detailed tasks
2. Read your branch's `FILE_ORGANIZATION.md` for file locations
3. Navigate to main project: `cd ../../..`
4. Create your feature branch: `git checkout -b feature/branch-name`
5. Start developing!

---

**Last Updated:** February 7, 2026  
**Questions?** Check the COORDINATION_HUB.md for communication channels
