# Person 1: UI/UX Enhancement - File Organization

## 📂 Primary Working Files

### Components to Enhance
```
Main Project (../../../)
├── components/
│   ├── Dashboard.tsx              ← PRIMARY: Timer & animations
│   ├── TaskBoard.tsx              ← PRIMARY: Task list UI
│   ├── Store.tsx                  ← SECONDARY: Store UI polish
│   ├── Climber.tsx                ← PRIMARY: Character animation
│   ├── CharacterSelect.tsx        ← SECONDARY: Selection UI
│   └── ui/                        ← NEW: Create reusable components
│       ├── Button.tsx             (to create)
│       ├── Card.tsx               (to create)
│       ├── Input.tsx              (to create)
│       └── index.ts               (to create)
```

### Style Constants
```
Main Project (../../../)
├── constants/
│   └── theme.ts                   ← COLOR & SPACING CONSTANTS
```

### Navigation Screens
```
Main Project (../../../)
├── app/(tabs)/
│   ├── _layout.tsx                ← Tab navigation styling
│   ├── index.tsx                  ← Dashboard screen
│   └── tasks.tsx                  ← Tasks screen
```

---

## 🔧 Setup Instructions

1. **Read-only reference to main files:**
   ```bash
   cd ../../.. # Go to main project
   ```

2. **Create new UI components in:**
   ```bash
   components/ui/
   ```

3. **Update styling in:**
   ```bash
   constants/theme.ts
   ```

4. **Work on animations in:**
   - `components/Dashboard.tsx`
   - `components/TaskBoard.tsx`
   - `components/Climber.tsx`

---

## 📋 Task Breakdown

### Task 1: Dashboard Animations
**File:** `components/Dashboard.tsx`
- [ ] Character climbing smooth transitions
- [ ] Pomodoro timer visual feedback
- [ ] Progress bar animations
- [ ] Stat updates (XP, altitude)

### Task 2: TaskBoard Polish
**File:** `components/TaskBoard.tsx`
- [ ] Improve form UX
- [ ] Swipe gestures
- [ ] List animations
- [ ] Visual hierarchy

### Task 3: Component Library
**Directory:** `components/ui/`
- [ ] Create Button.tsx
- [ ] Create Card.tsx
- [ ] Create Input.tsx
- [ ] Documentation

---

## 🗂️ Reference Map

| Component | Location | Purpose |
|-----------|----------|---------|
| Dashboard | components/ | Main gameplay screen |
| TaskBoard | components/ | Task management |
| Climber | components/ | Character rendering |
| Store | components/ | Shop UI |
| theme.ts | constants/ | Colors & spacing |

---

## ⚠️ Important Notes

- **Do NOT** modify `lib/` files (handled by Person 2)
- **Do NOT** modify `app/(tabs)/social.tsx` (handled by Person 3)
- **Do NOT** create tests here (handled by Person 4)
- Focus on UI/UX improvements and animations
- Keep TypeScript types consistent

---

## 🚀 Git Workflow for This Branch

```bash
# From main project directory
git checkout -b feature/ui-enhancement
npm install
npm start

# Create components as needed
# Edit existing components
# Push to branch
git add .
git commit -m "feat: UI enhancement - [describe change]"
git push origin feature/ui-enhancement
```
