# Expense Tracker – React Native (Expo)

Personal Expense Tracker mobile app built with **React Native** + **Expo** (managed workflow).  
No native modules, pure JS + raw styles.

Backend Repo: https://github.com/TheLunatic1/RNT-backend.git
App link: https://expo.dev/artifacts/eas/6qqzJLFqMZk7fP2pVB5h45.apk (Still on Dev but useable)

### Screenshots

<table>
  <tr>
    <td><img src="https://github.com/TheLunatic1/RNT/raw/main/preview.png" alt="Screenshot 1" width="200"/></td>
    <td><img src="https://github.com/TheLunatic1/RNT/raw/main/preview1.jpg" alt="Screenshot 2" width="200"/></td>
    <td><img src="https://github.com/TheLunatic1/RNT/raw/main/preview2.jpg" alt="Screenshot 3" width="200"/></td>
    <td><img src="https://github.com/TheLunatic1/RNT/raw/main/preview3.jpg" alt="Screenshot 4" width="200"/></td>
  </tr>
</table>

<!-- Optional caption below -->
<p align="center"><em>App in action: List view, Chart view, login, sign up</em></p>

## Features

- **User Authentication** (JWT)
  - Register / Login
  - Secure token storage with `expo-secure-store`
- **Expense Management** (CRUD)
  - Add new expense (description, amount, category, date)
  - Edit existing expense (optimistic UI)
  - Delete expense (confirmation alert)
- **Dynamic Categories**
  - Add new categories directly from expense modal
  - Categories fetched and cached
- **Two Tabs**
  - **List** — full expense history with pull-to-refresh
  - **Chart** — category breakdown bar chart using pure `react-native-svg`
- **Date Filtering** (Chart tab)
  - All / Last 7 days / Last 30 days
- **Dark / Light Mode Toggle**
  - Manual switch (☀️ ↔ 🌙)
  - Persists via AsyncStorage
  - Beautiful theme with card, accent, error colors
- **Offline Foundation Ready**
  - AsyncStorage caching layer
  - NetInfo connectivity detection
  - Pending change queue (add/edit/delete) — ready to be activated
- **Responsive & Mobile-first UI**
  - Raw StyleSheet (no external UI libraries)
  - Animated modal with KeyboardAvoidingView
  - FAB for quick add
- **Production-ready structure**
  - Constants for API base URL
  - Context-based auth & theme
  - Git-friendly commit history

## Tech Stack (Frontend)

- React Native (Expo managed workflow)
- Expo SDK
- Expo Go for development (physical Android device)
- React Navigation not used (simple tab state)
- State management: React Context + useState/useEffect
- Storage: `@react-native-async-storage/async-storage`
- Network: `@react-native-community/netinfo`
- Secure storage: `expo-secure-store`
- Charts: pure `react-native-svg` (no victory-native / chart-kit)
- Auth: JWT token stored securely
- Styling: raw `StyleSheet` (no Tailwind / styled-components)
- API: REST fetch to Node.js/Express backend

## Prerequisites

- Node.js ≥ 18
- npm / yarn
- Expo CLI (`npm install -g expo-cli`)
- Android phone with Expo Go app installed
- Backend running

## Setup & Development

1. Clone the repo
   ```bash
   git clone https://github.com/TheLunatic1/RNT.git
   cd RNT
   ```

2. Install dependencies
   ```bash
   npm install
   # or
   yarn install
   ```

3. Start development server
   ```bash
   npx expo start -c
   ```

4. Open Expo Go on your Android phone
   - Scan the QR code
   - Or press `a` in terminal (Android emulator) / `shift + a` for physical device

5. Make sure backend is running
   - Local: `http://192.168.x.x:5000`
   - Deployed: `https://rnt-backend.server.example.com`

## Important Commands

- Clear cache & restart Metro  
  `npx expo start -c`

- Build debug APK (standalone)  
  `eas build --platform android --profile development`

- Build production AAB (for Play Store)  
  `eas build --platform android --profile production`

- Login to EAS (first time)  
  `eas login`

- View build status  
  `eas build:list` or go to https://expo.dev

## Folder Structure

```
src/
├── components/
│   └── AddExpenseModal.js
├── context/
│   ├── AuthContext.js
│   └── ThemeContext.js
├── screens/
│   ├── ExpenseScreen.js
│   ├── AuthScreen.js
│   └── ChartTab.js
├── constants/
│   └── api.js
├── utils/
│   └── offlineStorage.js     (offline foundation – not fully active yet)
assets/                     (icons, splash)
app.json                    (Expo config)
eas.json                    (build profiles)
```

## Environment Variables / Config

All API calls use:

```js
import { API_BASE_URL } from '../constants/api';
API_BASE_URL = 'https://rnt-backend.server.example.com'   // production
// or 'http://192.168.x.x:5000' for local dev
```

Change in `src/constants/api.js` if needed.

## Future / Planned Features

- **Full Offline Support**
  - Queue add/edit/delete when offline
  - Auto-sync on reconnect
  - Conflict resolution (last-write-wins)
- **Category Management**
  - Delete / edit categories
  - Category colors/icons
- **Date Range Filter on List Tab**
- **Export CSV / PDF**
- **Search expenses**
- **Monthly / yearly summaries**
- **Push notifications** (reminders)
- **Google Play / App Store release**
  - Custom icon + splash
  - Remove development banner
  - Analytics (Firebase)
  - Crash reporting (Sentry)
- **Performance**
  - Memoization / useMemo
  - FlatList optimizations
  - Image caching

## Known Limitations / To-do

- Offline mode is partially implemented (caching ready, queue ready, sync logic ready — just needs activation)
- No loading skeleton / shimmer effect yet
- Chart is basic SVG bars — can be enhanced (tooltips, animation)
- No input validation on backend response shape
- No rate limiting / error boundaries

## Contributing

Feel free to open issues or PRs!  
Especially welcome:
- Bug fixes
- UI polish
- Offline sync activation
- New features

## License

MIT — do whatever you want with it 😄

Made by Lunatic1 (MERN → React Native learner)

```
