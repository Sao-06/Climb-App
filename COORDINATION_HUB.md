# 🧗 Climb App - Team Coordination Hub

**Project:** Climb - Productivity Gamification App  
**Team Size:** 4 Members  
**Status:** Sprint Development

---

## 📂 Branch Directory Structure

```
climb/
├── branches/
│   ├── feature-ui-enhancement/
│   │   └── README.md (Person 1 - Frontend Lead)
│   ├── feature-ai-enhancements/
│   │   └── README.md (Person 2 - Backend/AI Lead)
│   ├── feature-gameplay-expansion/
│   │   └── README.md (Person 3 - Features Lead)
│   └── feature-testing-optimization/
│       └── README.md (Person 4 - Testing/DevOps Lead)
├── app/
├── components/
├── lib/
├── TEAM_STRUCTURE.md
├── COORDINATION_HUB.md (THIS FILE)
└── ... (main project files)
```

---

## 👥 Team Members & Branches

| Person | Role | Branch | Focus Area |
|--------|------|--------|-----------|
| **Person 1** | Frontend UI/UX Lead | `feature/ui-enhancement` | Animations, Components, Polish |
| **Person 2** | Backend/AI Lead | `feature/ai-enhancements` | Gemini AI, Data Persistence, Coach System |
| **Person 3** | Features/Gameplay Lead | `feature/gameplay-expansion` | Multiplayer, Store, Progression |
| **Person 4** | Testing/DevOps Lead | `feature/testing-optimization` | Tests, Performance, Builds |

---

## 🎯 Key Deliverables by Person

### Person 1: Dashboard & UI Polish
```
✓ Dashboard component animations
✓ TaskBoard interface improvements
✓ Reusable component library
✓ Theme and styling consistency
```

### Person 2: AI & Data Backend
```
✓ Enhanced Gemini integration
✓ Coaching/motivation system
✓ AsyncStorage data persistence
✓ Cloud sync capability
```

### Person 3: Gameplay Features
```
✓ Social/multiplayer system
✓ Advanced store with cosmetics
✓ Leveling and progression
✓ Daily challenges and quests
```

### Person 4: Quality & Deployment
```
✓ Unit and integration tests
✓ Performance optimization
✓ iOS/Android build setup
✓ CI/CD pipeline
```

---

## 🔄 Git Workflow

### Creating Branches

```bash
# Each person creates their branch
git checkout main
git pull origin main

# Person 1
git checkout -b feature/ui-enhancement

# Person 2
git checkout -b feature/ai-enhancements

# Person 3
git checkout -b feature/gameplay-expansion

# Person 4
git checkout -b feature/testing-optimization
```

### Daily Work

```bash
# Start of day - sync with main
git pull origin main

# Make changes to your branch
git add .
git commit -m "feat: describe your change"
git push origin feature/your-branch-name
```

### Submitting PR

```bash
# Push your branch
git push origin feature/your-branch-name

# Create Pull Request on GitHub
# - Add description
# - Request code review from team
# - Ensure CI passes
# - Get approval before merging
```

---

## 🔗 Integration Points (Coordination Required)

### 1. **Store UI Updates** (Person 1 ↔ Person 3)
- Person 3 adds new cosmetics to data
- Person 1 styles and animates store interface
- **Timeline:** Weeks 2-3

### 2. **Dashboard Coach System** (Person 2 ↔ Person 1)
- Person 2 builds coaching logic
- Person 1 creates UI for coach messages
- **Timeline:** Weeks 1-2

### 3. **Task AI Breakdown** (Person 2 ↔ Person 1)
- Person 2 improves Gemini prompts
- Person 1 updates TaskBoard UI to show results
- **Timeline:** Week 1

### 4. **Performance Profiling** (Person 4 ↔ Everyone)
- Person 4 creates performance tests
- Each person optimizes their components
- **Timeline:** Weeks 2-3

### 5. **Testing All Features** (Person 4 ↔ All)
- Person 4 builds test framework
- Other persons write tests for their components
- **Timeline:** Ongoing

---

## 📅 Sprint Schedule

### Week 1: Foundation
- **Person 1:** Set up component library
- **Person 2:** Enhance Gemini service
- **Person 3:** Design data structures for social/store
- **Person 4:** Set up testing framework

### Week 2: Core Features
- **Person 1:** Dashboard and TaskBoard animations
- **Person 2:** Implement data persistence
- **Person 3:** Build social leaderboards
- **Person 4:** Write unit tests

### Week 3: Integration
- **Person 1:** Polish animations
- **Person 2:** Build coach system
- **Person 3:** Advanced store and progression
- **Person 4:** Performance optimization

### Week 4: QA & Deployment
- **Person 1:** Final UI fixes
- **Person 2:** Final syncing/persistence
- **Person 3:** Final gameplay balance
- **Person 4:** Build setup and deployment

---

## 📋 Daily Standup Template

**Person:** [Name]  
**Branch:** [feature/branch-name]  

**Completed Yesterday:**
- [ ] Task 1
- [ ] Task 2

**Working On Today:**
- [ ] Task 3
- [ ] Task 4

**Blockers:**
- [ ] Issue 1
- [ ] Issue 2

**Next 24 Hours:**
- [ ] Task 5

---

## 🚨 Common Issues & Solutions

### Issue: Merge Conflicts
```bash
# When pulling main
git pull origin main

# If conflicts exist
git status  # See conflicted files
# Edit files to resolve
git add .
git commit -m "chore: resolve merge conflicts"
git push origin feature/your-branch-name
```

### Issue: Feature Branch is Behind
```bash
git fetch origin
git rebase origin/main
# If conflicts, resolve them
git push -f origin feature/your-branch-name
```

### Issue: Need to Sync with Another Branch
```bash
# Only for review/reference, don't merge directly
git fetch origin
git checkout feature/other-person-branch
# Review changes
git checkout feature/your-branch-name
```

---

## 📝 Code Review Checklist

Before approving a PR:

- [ ] Code follows project style guide
- [ ] No console errors or warnings
- [ ] TypeScript passes without errors
- [ ] Tests pass and coverage meets targets
- [ ] Documentation is updated
- [ ] Performance is acceptable
- [ ] No hardcoded values
- [ ] Error handling is present
- [ ] Comments explain complex logic

---

## 🎯 Definition of Done

A task is "done" when:

1. ✅ Code is written and tested
2. ✅ All unit tests pass
3. ✅ PR is created with clear description
4. ✅ Code review approved by at least 1 team member
5. ✅ TypeScript validation passes
6. ✅ No console warnings or errors
7. ✅ Performance benchmarks are met
8. ✅ PR is merged to main branch

---

## 📞 Communication Channels

- **Daily Standup:** Morning - share progress
- **Code Review:** Throughout day - async review
- **Weekly Sync:** End of week - architecture discussion
- **Blockers:** Immediate - slack/teams for urgent issues
- **Documentation:** Update this file as needed

---

## 🚀 Getting Started Checklist

Each person should:

- [ ] Clone the repository
- [ ] Create their feature branch
- [ ] Read their assigned README.md in `branches/feature-*/`
- [ ] Install dependencies: `npm install`
- [ ] Start dev server: `npm start`
- [ ] Begin working on assigned tasks
- [ ] Push commits daily
- [ ] Create PR when feature is ready

---

## 📊 Progress Tracking

Track progress in each branch's README:
- Mark tasks with `[x]` when complete
- Update status regularly
- Note any blockers

View overview:
```bash
ls branches/feature-*/README.md
# Each file shows task progress
```

---

## 🎉 Success Metrics

Project is successful when:

1. All 4 team members have working features on their branches
2. Features integrate without major conflicts
3. Test coverage is >80%
4. Performance meets targets (60 FPS animations, <3s startup)
5. Code is documented and reviewed
6. App builds for both iOS and Android
7. All features merged back to main successfully

---

**Last Updated:** February 7, 2026  
**Next Review:** Weekly
