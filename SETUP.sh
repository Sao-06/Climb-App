#!/bin/bash

# Climb App - React to React Native Conversion Quick Start
# =========================================================

echo "🏔️ Climb App - React Native Setup"
echo "=================================="
echo ""

# Check if Node is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo ""
echo "📝 Configuration Steps:"
echo "======================"
echo ""
echo "1. Set up Gemini API Key (optional but recommended):"
echo "   - Create a file called '.env.local' in the 'climb' directory"
echo "   - Add: EXPO_PUBLIC_GEMINI_API_KEY=your_actual_api_key"
echo "   - Get an API key at: https://aistudio.google.com/apikey"
echo ""
echo "2. Start the development server:"
echo "   npm start"
echo ""
echo "3. Choose your platform:"
echo "   - Press 'i' for iOS Simulator"
echo "   - Press 'a' for Android Emulator"
echo "   - Press 'w' for Web"
echo "   - Press 'j' for Expo Go (scan QR code with phone)"
echo ""

echo "🎮 Game Tips:"
echo "============="
echo "- Start on the 'Ascent' (Dashboard) tab"
echo "- Create a task in the 'Missions' tab to practice"
echo "- Buy character customizations in 'Basecamp'"
echo "- Select different characters in 'Gear' settings"
echo "- Focus sessions track your productivity!"
echo ""

echo "✨ Ready to climb! Type 'npm start' to begin."
