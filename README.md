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
- Manual “Sync now” button is located in Settings; when backend endpoints are ready, wire them inside `actions.syncNow`.

### Where to add backend integrations later

- `contexts/AppContext.tsx`: replace the mock sync delay with real API calls (`actions.syncNow`) and wire SOS/report submission once endpoints exist.
- `services/database.ts`: extend the schema or migrations as new offline entities are required.
- `app/(tabs)/chat.tsx`: swap the placeholder list for WebSocket-powered messaging when the secure server is provided.

### Naming & assets

- Expo display name, components, and copy reference **ProtectMe** consistently.
- Purple GBV theme colors are defined once and reused for accessible contrast.

Feel free to extend the context, add tests, or hook up backend endpoints as they go live. For any questions about the current structure, check the `contexts`, `services`, and `app/(tabs)` directories.

