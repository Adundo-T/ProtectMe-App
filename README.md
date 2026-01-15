## ProtectMe (Expo + React Native)

ProtectMe is a survivor-first GBV safety companion built with Expo Router, React Navigation, React Native Paper, AsyncStorage, and SQLite. The current frontend scope delivers the entire offline-ready UX, theming, navigation, and local persistence needed to plug into a future backend.

### Getting started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the Expo dev server (web, iOS, or Android)

   ```bash
   npm run dev
   ```

3. The entry file is `app/index.tsx`, which redirects to onboarding or the tab navigator.

### Tech stack

- Expo (managed workflow) + Expo Router v6
- React Navigation (stack + bottom tabs via Expo Router)
- UI: React Native Paper + custom ProtectMe components
- State: Lightweight React context (`contexts/AppContext.tsx`)
- Persistence: SQLite (`expo-sqlite`) for reports/resources/pending alerts, AsyncStorage for onboarding + lock flags
- Device APIs: `expo-local-authentication`, `Linking` for SOS calls and resources

### Key features implemented

- **Onboarding & Permissions**: Minimal onboarding screen with consent toggles and anonymous mode description.
- **Navigation**: Root stack + `(tabs)` folder with Home, SOS, Report Form, Reports, Resources, Chat (placeholder), Settings.
- **Home Dashboard**: Quick access cards, sync status, pending SOS pill, resource shortcuts, and placeholder chat card.
- **SOS Screen**: Large one-tap trigger that stores pending alert records locally and attempts to dial `112`.
- **Report Workflow**: Draft/save/update reports, anonymous toggle, placeholder attachments, and SQLite persistence with detailed view.
- **Reports List & Details**: Offline statuses, edit/delete/mark-synced controls, detail screen routed as `/report/[id]`.
- **Resources**: Offline cached safe houses/services with call + map actions.
- **Chat Placeholder**: UI stub referencing future secure channel with status pills.
- **Settings**: PIN + biometric toggles (with hardware checks), manual “Sync now” button, language selector, and privacy copy.
- **Theme**: Dedicated purple palette + spacing/radius/shadow tokens in `theme/index.ts`.

### Offline & sync behavior

- All reports/resources/pending alerts live in `protectme.db` via SQLite.
- Draft vs pending vs synced statuses shown throughout the UI, with manual sync converting pending items to synced after a faux delay.
- SOS button logs a pending alert entry in the local DB for auditing even without network.
- Manual "Sync now" button is located in Settings; backend integration is now complete with real API endpoints.

### Backend Integration

✅ **Complete**: Backend API endpoints are now deployed and integrated.

- `contexts/AppContext.tsx`: `syncNow` function calls real API endpoints for reports, alerts, and resources
- `services/api.ts`: HTTP client with retry logic and network utilities
- `backend/`: Node.js/Express server with Docker support
- Real-time sync between mobile app and backend services

### Monitoring & Analytics

Comprehensive monitoring and analytics setup for production observability:

#### **Backend Monitoring**
- **Error Tracking**: Sentry integration with performance profiling
- **Logging**: Winston structured logging with file and console outputs
- **Metrics**: Prometheus metrics for HTTP requests, sync operations, and system health
- **Health Checks**: `/health` endpoint with system metrics

#### **Frontend Analytics**
- **User Analytics**: Firebase Analytics for user behavior tracking
- **Performance Monitoring**: Firebase Performance for app speed metrics
- **Error Tracking**: Sentry for crash reporting and error boundaries
- **Custom Events**: Report creation, SOS activation, sync operations

#### **Tracked Events**
- App lifecycle (open, background)
- User actions (report creation, SOS alerts, settings changes)
- Sync operations (success/failure, duration, item counts)
- API calls (endpoints, response times, success rates)
- Error occurrences with context

#### **Configuration**
Environment variables required:
```bash
# Frontend
EXPO_PUBLIC_SENTRY_DSN=your-sentry-dsn
EXPO_PUBLIC_FIREBASE_*=your-firebase-config

# Backend
SENTRY_DSN=your-sentry-dsn
LOG_LEVEL=info
```

### CI/CD Pipeline

Automated build and deployment pipeline using GitHub Actions:

- **Backend**: Docker container build, testing, and deployment to container registry
- **Frontend**: Web build, Android APK generation, and deployment to GitHub Pages
- **Dependencies**: Automated security updates via Dependabot
- **Testing**: TypeScript checking, linting, and security audits on every PR

See `.github/README.md` for detailed CI/CD setup instructions.

### Naming & assets

- Expo display name, components, and copy reference **ProtectMe** consistently.
- Purple GBV theme colors are defined once and reused for accessible contrast.

Feel free to extend the context, add tests, or hook up backend endpoints as they go live. For any questions about the current structure, check the `contexts`, `services`, and `app/(tabs)` directories.

