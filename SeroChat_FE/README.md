# SeroChat Frontend

React Native mobile application for SeroChat.

## Features

- Chat room functionality
- Real-time message updates
- User-friendly interface
- Cross-platform (iOS & Android)

## Prerequisites

- Node.js 16+ and npm/yarn
- Expo CLI: `npm install -g expo-cli`
- For iOS: Xcode and CocoaPods
- For Android: Android Studio and SDK

## Getting Started

### Install dependencies

```bash
npm install
```

### Start the development server

```bash
npm start
```

This will open Expo Developer Tools. You can:
- Press `a` to run on Android emulator
- Press `i` to run on iOS simulator
- Scan QR code with Expo Go app on your phone

### Run on specific platform

```bash
npm run android  # Run on Android
npm run ios      # Run on iOS
npm run web      # Run on web browser
```

## Configuration

Update the API base URL in `src/services/api.ts`:

```typescript
const API_BASE_URL = 'http://your-backend-url:5000/api';
```

For local development:
- Android emulator: Use `http://10.0.2.2:5000/api`
- iOS simulator: Use `http://localhost:5000/api`
- Physical device: Use your computer's IP address

## Project Structure

```
src/
├── screens/        # Screen components
├── services/       # API services
└── types/          # TypeScript types
```

## Notes

- Make sure the backend API is running before testing the app
- Image assets (icon.png, splash.png, etc.) need to be added to the `assets/` folder
