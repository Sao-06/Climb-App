# 🧗 Climb App - Quick Reference Card

## 📍 Where to Start

**Step 1:** Find your person number (1-4)  
**Step 2:** Go to your branch folder  
**Step 3:** Read README.md + FILE_ORGANIZATION.md  
**Step 4:** Navigate to main project and start coding

---

## 👤 Person 1: UI/UX Lead

```
📂 Location: branches/feature-ui-enhancement/
🎯 Focus: Animations, UI Polish, Components
📁 Work In: components/, constants/

Key Files:
✏️ components/Dashboard.tsx        Edit - Timer animations
✏️ components/TaskBoard.tsx        Edit - Task UI improvements  
✏️ components/Climber.tsx          Edit - Character animation
➕ components/ui/Button.tsx        Create new
➕ components/ui/Card.tsx          Create new
✏️ constants/theme.ts              Edit - Colors & spacing

Git: git checkout -b feature/ui-enhancement
```

---

## 👤 Person 2: Backend/AI Lead

```
📂 Location: branches/feature-ai-enhancements/
🎯 Focus: Gemini AI, Data Persistence, Coach System
📁 Work In: lib/

Key Files:
✏️ lib/geminiService.ts            Edit - Enhance AI prompts
➕ lib/coachSystem.ts              Create new - Motivation
➕ lib/persistenceService.ts       Create new - Data storage
➕ lib/analyticsService.ts         Create new - Analytics
➕ lib/questSystem.ts              Create new - Quests

Git: git checkout -b feature/ai-enhancements
```

---

## 👤 Person 3: Features/Gameplay Lead

```
📂 Location: branches/feature-gameplay-expansion/
🎯 Focus: Multiplayer, Store, Progression
📁 Work In: app/(tabs)/, components/, lib/

Key Files:
✏️ app/(tabs)/social.tsx           Edit - Multiplayer hub
➕ app/(tabs)/screens/social/      Create new - Social screens
✏️ components/Store.tsx            Edit - Cosmetics shop
➕ lib/progressionEngine.ts        Create new - Level system
➕ lib/questSystem.ts              Create new - Daily quests
✏️ lib/types.ts                    Edit - Add new types

Git: git checkout -b feature/gameplay-expansion
```

---

## 👤 Person 4: Testing/DevOps Lead

```
📂 Location: branches/feature-testing-optimization/
🎯 Focus: Tests, Performance, Builds
📁 Work In: __tests__/, .github/, configuration files

Key Files:
➕ __tests__/lib/geminiService.test.ts     Create - AI tests
➕ __tests__/components/Dashboard.test.tsx Create - UI tests
➕ jest.config.js                          Create - Test config
➕ .github/workflows/test.yml              Create - CI/CD
➕ eas.json                                Create - Build config
✏️ app.json                                Edit - Build settings

Git: git checkout -b feature/testing-optimization
```

---

## 🚀 Universal Workflow

```bash
# Step 1: Create your branch
git checkout -b feature/your-branch-name

# Step 2: Navigate to main project
cd ../../..

# Step 3: Install dependencies (if needed)
npm install

# Step 4: Start development
npm start

# Step 5: Make your changes
# Edit files, create new files as specified

# Step 6: Commit & push
git add .
git commit -m "feat: your changes"
git push origin feature/your-branch-name

# Step 7: Create pull request
# Go to GitHub, request code review
```

---

## 📊 File Legend

| Symbol | Meaning |
|--------|---------|
| ✏️ | Edit existing file |
| ➕ | Create new file |
| 🗂️ | Directory reference |
| 📍 | Current location |

---

## 📚 Key Documentation

| Document | Purpose | Read It When |
|----------|---------|-------------|
| `START_HERE.md` | Project overview | You're starting out |
| `branches/feature-*/README.md` | Your task list | You need to know what to do |
| `branches/feature-*/FILE_ORGANIZATION.md` | File mapping | You need to know where to work |
| `TEAM_STRUCTURE.md` | Team roles | You need the big picture |
| `COORDINATION_HUB.md` | Team sync | You need to communicate |

---

## ⚡ Quick Commands

```bash
# Check your task list
cat README.md

# See which files to edit
cat FILE_ORGANIZATION.md

# Go to main project
cd ../../..

# Create your branch
git checkout -b feature/your-branch-name

# Start working
npm start

# Save work
git add .
git commit -m "feat: [description]"
git push origin feature/your-branch-name
```

---

## 🎯 Your Tasks At A Glance

### Person 1
- [ ] Dashboard animations
- [ ] TaskBoard UI polish
- [ ] Component library
- [ ] Theme consistency

### Person 2
- [ ] Enhanced Gemini AI
- [ ] Coaching system
- [ ] Data persistence
- [ ] Analytics tracking

### Person 3
- [ ] Multiplayer/leaderboards
- [ ] Advanced store
- [ ] Progression system
- [ ] Daily challenges

### Person 4
- [ ] Unit tests
- [ ] Component tests
- [ ] Performance optimization
- [ ] Build setup

---

## 🔗 Integration Reminders

**Person 1 & 3:** Coordinate on Store UI styling  
**Person 2 & 1:** Sync on Dashboard coach display  
**Person 4 & All:** Create tests for everyone's features  
**Everyone:** Keep up with main branch daily  

---

## ✅ Before Creating PR

- [ ] All code works locally
- [ ] No console errors/warnings
- [ ] TypeScript passes validation
- [ ] Tests pass (if applicable)
- [ ] Code follows existing style
- [ ] PR description explains changes

---

## 📞 Need Help?

1. **Don't know your task:** Read `branches/feature-*/README.md`
2. **Don't know which files:** Read `branches/feature-*/FILE_ORGANIZATION.md`
3. **Git questions:** See COORDINATION_HUB.md
4. **Team sync:** Standup meeting
5. **Blocked:** Slack/Teams immediately

---

**Status:** ✅ Ready to start!  
**Questions?** Check the full documentation files  
**Start:** `cat README.md` (in your branch)
