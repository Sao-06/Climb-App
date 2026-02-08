# 🏔️ Climb - React Native App

**A productivity gamification app where you climb mountains as you focus, converted from React web app to React Native using Expo.**

> Previously built as a React/Vite web app, now fully adapted for iOS, Android, and Web using React Native and Expo Router.

---

## ✨ Features

- **📊 Pomodoro Timer**: Multiple preset focus session options (Classic, Short, Deep Work, Study Mode)
- **🏔️ Virtual Mountain**: Watch your character climb as you complete focus sessions and tasks
- **🎮 Gamification**: Earn XP points, unlock levels, and track your progress
- **🐾 Character System**: 4 unique climbing partners (Llama, Leopard, Guinea Pig, Elephant)
- **🎨 Customization**: Equip hats, gear, and skins to personalize your character
- **📝 AI Task Breakdown**: Uses Google Gemini AI to break down large tasks into subtasks (optional)
- **📱 Distraction Detection**: Penalties when you leave the app during focus sessions
- **🌐 Cross-Platform**: Works on iOS, Android, and Web

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18 or higher
- npm or yarn
- (Optional) iOS Simulator or Android Emulator

### Installation

```bash
# Navigate to the climb directory
cd climb

# Install dependencies
npm install

# Set up Gemini API (optional but recommended)
# Create .env.local file with:
# EXPO_PUBLIC_GEMINI_API_KEY=your_key_here
```

### Run the App

```bash
# Start Expo development server
npm start

# Choose a platform:
# i - iOS Simulator
# a - Android Emulator
# w - Web Browser
# j - Expo Go (scan QR with phone)
```

---

## 📱 Platform-Specific Commands

```bash
# iOS Simulator (macOS only)
npm run ios

# Android Emulator
npm run android

# Web Browser
npm run web
```

---

## 🎮 How to Play

### Dashboard (Ascent)
1. **Select a Pomodoro Preset** - Choose your focus duration (25, 15, 50, or 30 minutes)
2. **Start Your Ascent** - Begin the timer and stay focused!
3. **Earn Rewards** - Complete the session to earn XP and climb higher
4. **Watch Progress** - See your character climb the mountain in real-time

### Tasks (Missions)
1. **Create a Mission** - Enter a large task you want to complete
2. **AI Breakdown** - The app breaks it into subtasks (requires Gemini API)
3. **Complete Subtasks** - Mark subtasks complete to earn XP
4. **Track Progress** - Monitor your total expedition progress

### Shop (Basecamp)
1. **Browse Items** - Hats, gear, and character skins
2. **Spend XP** - Purchase customizations for your character
3. **Equip Items** - See changes reflected instantly in preview

### Settings (Gear)
1. **Select Character** - Choose between 4 unique explorers
2. **Learn Tips** - Understand game mechanics and controls
3. **Review Stats** - See your current level and achievements

---

## 🏗️ Project Structure

```
climb/
├── app/                           # Expo Router navigation
│   ├── _layout.tsx               # Root layout
│   ├── (tabs)/
│   │   ├── _layout.tsx           # Tab navigation (5 screens)
│   │   ├── index.tsx             # Dashboard/Ascent
│   │   ├── tasks.tsx             # Task Management/Missions
│   │   ├── store.tsx             # Shop/Basecamp
│   │   ├── social.tsx            # Social/Team (placeholder)
│   │   └── settings.tsx          # Settings/Gear
│   └── modal.tsx                 # Modal screen (starter)
│
├── components/                    # Reusable React Native components
│   ├── Climber.tsx              # Character rendering (emoji-based)
│   ├── Dashboard.tsx            # Timer & stats display
│   ├── TaskBoard.tsx            # Task creation & management
│   ├── Store.tsx                # Shop interface
│   ├── CharacterSelect.tsx      # Character picker
│   └── [other components]       # Navigation, theming, etc.
│
├── lib/                          # Business logic & services
│   ├── types.ts                 # TypeScript interfaces
│   ├── constants.ts             # Game constants, presets, colors
│   └── geminiService.ts         # Google Gemini AI integration
│
├── constants/                    # App constants
├── hooks/                        # Custom React hooks
├── assets/                       # Images, icons, sounds
├── app.json                      # Expo configuration
├── tsconfig.json               # TypeScript config
├── package.json                # Dependencies
└── CONVERSION_SUMMARY.md       # Migration details
```

---

## 🔑 Key Technologies

| Technology | Purpose |
|-----------|---------|
| **React Native** | Cross-platform mobile framework |
| **Expo** | Development platform & managed service |
| **Expo Router** | File-based routing |
| **TypeScript** | Type-safe JavaScript |
| **React Native Animated** | Smooth animations |
| **expo-av** | Audio/video playback |
| **Google Generative AI** | AI task breakdown (optional) |

---

## 🔧 Configuration

### Environment Variables

Create `.env.local` in the `climb` directory:

```
EXPO_PUBLIC_GEMINI_API_KEY=your_api_key_here
```

**To get a Gemini API key:**
1. Visit [Google AI Studio](https://aistudio.google.com/apikey)
2. Click "Create API Key"
3. Copy the key and paste it in `.env.local`

### Game Constants

Edit `lib/constants.ts` to modify:
- Pomodoro presets (focus/break durations)
- Character data (names, descriptions, colors)
- Shop items (prices, types)
- Color palette

---

## 📊 Game Mechanics

### Points System
- **Focus Sessions**: Earn 10 XP per minute (25 min session = 250 XP)
- **Completed Subtasks**: Earn points based on difficulty (10-50 XP)
- **Distractions**: Lose 1 XP per minute away from app during focus session

### Leveling
- Gain 1 level every 1000 XP
- Unlocks higher-tier customization items
- Displayed on dashboard and in header

### Mountain Climbing
- Progress is visual - watch character move up the mountain
- 1 meter climb per 1 XP earned
- Peak waypoints at 1000m intervals (1000m, 2000m, 5000m, etc.)

### Character Customization
- **Base Color**: Changes character skin tone
- **Hat**: Head accessory
- **Gear**: Body/equipment customization
- All items purchasable with XP

---

## 🛠️ Development

### Building for Production

```bash
# Create production build
npm run build

# Create web-optimized version
npm run web:build
```

### Testing

```bash
# Run linter
npm run lint

# Type checking (TypeScript)
npx tsc --noEmit
```

### Device Testing

```bash
# Install Expo Go on your phone
# Then use QR code from 'npm start'

# Or create custom dev client:
expo install expo-dev-client
npm start -- --dev-client
```

---

## 🚨 Troubleshooting

| Issue | Solution |
|-------|----------|
| App crashes on startup | Clear cache: `expo start -c` |
| Gemini API not working | Check API key in `.env.local` |
| Tasks not breaking down | Gemini API key might be missing or invalid |
| Animations are choppy | Disable dev tools: `npm start` without any flags |
| Timer doesn't work | Ensure JavaScript is enabled |

---

## 📝 API Integration

### Gemini AI Service
The app uses Google's Generative AI to break down tasks:

```typescript
// Automatically breaks a task into subtasks
const subtasks = await breakdownTask("Learn React Hooks");
// Returns: [{ title: "...", points: 25 }, ...]
```

Falls back to manual task entry if API is unavailable.

---

## 🎯 Roadmap

### Coming Soon
- [ ] Cloud sync with Firebase
- [ ] User accounts & authentication
- [ ] Leaderboards & friend competition
- [ ] Push notifications for reminders
- [ ] Achievement badges system
- [ ] Dark mode theme
- [ ] Offline mode with sync

### Future Features
- Multiplayer climbing with friends
- Team challenges
- Custom theme creator
- Weekly productivity reports
- Integration with calendar/task apps
- Voice commands for hands-free focus

---

## 📄 Migration Notes

This app was converted from a React/Vite web app to React Native with these key adaptations:

- **Styling**: Tailwind CSS → React Native StyleSheet
- **Audio**: Web Audio API → expo-av
- **App State**: Document visibility → React Native AppState
- **List Rendering**: React.map → FlatList
- **Character Rendering**: SVG → Unicode emoji
- **Animations**: CSS → React Native Animated API

See `CONVERSION_SUMMARY.md` for detailed migration information.

---

## 📚 Resources

- [React Native Documentation](https://reactnative.dev)
- [Expo Documentation](https://docs.expo.dev)
- [Expo Router Guide](https://docs.expo.dev/routing/introduction/)
- [Google Generative AI API](https://ai.google.dev)
- [React Native Animated API](https://reactnative.dev/docs/animated)

---

## 📄 License

[Add your license here]

---

## 👥 Contributing

[Add contribution guidelines here]

---

## 📧 Support

For issues, questions, or feature requests, please [open an issue on GitHub](https://github.com).

---

**Happy climbing! 🏔️⛰️**
