# Person 4: Testing, Performance & DevOps - File Organization

## 📂 Primary Working Files

### Testing Infrastructure
```
Main Project (../../../)
├── __tests__/                     ← NEW: All tests go here
│   ├── lib/
│   │   ├── geminiService.test.ts
│   │   ├── types.test.ts
│   │   └── constants.test.ts
│   ├── components/
│   │   ├── Dashboard.test.tsx
│   │   ├── TaskBoard.test.tsx
│   │   ├── Store.test.tsx
│   │   └── Climber.test.tsx
│   └── integration/
│       ├── user-flow.test.tsx
│       └── app-state.test.tsx
├── jest.config.js                ← NEW: Jest configuration
└── package.json                  ← UPDATE: Add test scripts
```

### Build Configuration
```
Main Project (../../../)
├── app.json                       ← UPDATE: Build config
├── eas.json                       ← NEW: EAS Build config
├── .github/workflows/
│   └── test.yml                   ← NEW: CI/CD pipeline
└── tsconfig.json                  ← UPDATE: Test paths
```

### Performance Monitoring
```
Main Project (../../../)
├── lib/
│   └── performanceService.ts      ← NEW: Performance tracking
```

---

## 🔧 Setup Instructions

1. **Working directory:**
   ```bash
   cd ../../.. # Go to main project
   ```

2. **Install test dependencies:**
   ```bash
   npm install --save-dev \
     jest \
     @testing-library/react-native \
     @testing-library/jest-native \
     babel-jest \
     metro-react-native-babel-preset
   ```

3. **Install EAS CLI:**
   ```bash
   npm install -g eas-cli
   eas login
   ```

4. **Create test directory:**
   ```bash
   mkdir -p __tests__/{lib,components,integration}
   ```

---

## 📋 Task Breakdown

### Task 1: Testing & Quality Assurance
**Directory:** `__tests__/`
- [ ] Unit tests for `lib/geminiService.ts`
- [ ] Component tests for Dashboard, TaskBoard, Store
- [ ] Integration tests for critical flows
- [ ] Set up GitHub Actions CI/CD
- [ ] Achieve 80%+ code coverage

**Test Files to Create:**
```
__tests__/
├── lib/
│   ├── geminiService.test.ts      (90% coverage target)
│   ├── types.test.ts              (100% coverage target)
│   └── constants.test.ts
├── components/
│   ├── Dashboard.test.tsx         (85% coverage)
│   ├── TaskBoard.test.tsx         (85% coverage)
│   ├── Store.test.tsx             (80% coverage)
│   └── Climber.test.tsx           (80% coverage)
└── integration/
    ├── user-flow.test.tsx
    └── app-state.test.tsx
```

### Task 2: Performance Optimization
**Primary:** Profile and optimize
- [ ] Profile app with React Profiler
- [ ] Optimize image loading
- [ ] Implement lazy loading
- [ ] Reduce bundle size
- [ ] Monitor animation frame rates (60 FPS target)

**Performance Targets:**
- Startup time: < 3 seconds
- Dashboard load: < 500ms
- Animation FPS: 60 FPS
- Memory usage: < 150MB
- Bundle size: < 10MB (compressed)

### Task 3: Build & Deployment
**Files:** `app.json`, `eas.json`, `.github/workflows/`
- [ ] Configure iOS build (provisioning, signing)
- [ ] Configure Android build (keystore, signing)
- [ ] Set up EAS Build
- [ ] Create deployment documentation
- [ ] Implement app store submission workflow

---

## 🗂️ File Reference Map

| File | Purpose | Action |
|------|---------|--------|
| jest.config.js | Test configuration | Create new |
| __tests__/ | All test files | Create new |
| eas.json | EAS Build config | Create new |
| .github/workflows/test.yml | CI/CD pipeline | Create new |
| app.json | Expo/build settings | Update |
| tsconfig.json | TypeScript config | Update |

---

## 📝 Example Jest Configuration

Create `jest.config.js`:

```javascript
module.exports = {
  preset: 'react-native',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.{js,jsx,ts,tsx}'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  collectCoverageFrom: [
    'lib/**/*.ts',
    'components/**/*.tsx',
    'app/**/*.tsx',
    '!**/*.d.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
```

---

## 🔌 Testing Examples

### Unit Test Template (`lib/geminiService.test.ts`)
```typescript
describe('GeminiService', () => {
  describe('breakdownTask', () => {
    it('should break down a task into subtasks', async () => {
      const result = await GeminiService.breakdownTask('Learn React');
      expect(result).toHaveProperty('subtasks');
      expect(result.subtasks.length).toBeGreaterThan(0);
    });

    it('should handle API errors gracefully', async () => {
      const result = await GeminiService.breakdownTask('');
      expect(result).toHaveProperty('fallback');
    });
  });
});
```

### Component Test Template (`components/Dashboard.test.tsx`)
```typescript
describe('Dashboard Component', () => {
  it('should render timer', () => {
    const { getByText } = render(<Dashboard />);
    expect(getByText(/pomodoro/i)).toBeTruthy();
  });

  it('should display character', () => {
    const { getByTestId } = render(<Dashboard />);
    expect(getByTestId('climber')).toBeTruthy();
  });
});
```

---

## 📊 CI/CD Pipeline Template

Create `.github/workflows/test.yml`:

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm test -- --coverage
      - run: npm run lint
```

---

## 🚀 Build Configuration

Create `eas.json`:

```json
{
  "cli": {
    "version": ">= 3.0.0"
  },
  "build": {
    "production": {
      "ios": {
        "certificateType": "distribution"
      },
      "android": {
        "buildType": "apk"
      }
    },
    "preview": {
      "ios": {
        "certificateType": "adhoc"
      }
    }
  },
  "submit": {
    "production": {
      "ios": {
        "ascAppId": "YOUR_APP_ID"
      }
    }
  }
}
```

---

## ⚠️ Important Notes

- **Do NOT** modify game logic (handled by other team members)
- **Focus on:** Quality, performance, and deployment
- **Coordinate** performance optimization with Person 1 (animations)
- **Coordinate** API testing with Person 2 (AI service)
- Keep test files close to source files for easy maintenance
- Update tests when features change

---

## 🚀 Git Workflow for This Branch

```bash
# From main project directory
git checkout -b feature/testing-optimization
npm install

# Create test files
npm test -- --watch

# Once tests pass
git add .
git commit -m "test: add tests for [component/service]"
git push origin feature/testing-optimization
```

---

## 📊 Useful Commands

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test -- Dashboard.test.tsx

# Profile performance locally
npm start
# Then use React Profiler in DevTools

# Build locally with EAS
eas build --platform ios --local
eas build --platform android --local
```

---

## ✅ Quality Gates

Before merging, ensure:
- [ ] All tests pass
- [ ] Coverage >= 80%
- [ ] No lint errors
- [ ] No TypeScript errors
- [ ] Performance benchmarks met
- [ ] CI pipeline passes
