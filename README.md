# Habits

Habits is a private, local-first organizer built with React Native and Expo. It brings habit tracking, todos, expiry reminders, birthdays, and simple numeric charts into one app without requiring an account or an online service.

## Features

- **Habits:** define a recurrence in days, mark habits as completed, and review their completion calendar.
- **Todos:** track dated tasks and see overdue or upcoming work at a glance.
- **Fridge:** record food expiry dates and surface items that need attention soon.
- **Birthdays:** keep birthdays ordered by their next occurrence, independently of birth year.
- **Charts:** record one numeric value per day and follow its history in a line chart.
- **Navigation reminders:** themed badges highlight upcoming and urgent todos, birthdays, and expiry dates.
- **Backup and restore:** export the main records or the complete history as JSON, then append a backup or replace the current database during import.
- **Local storage:** all app records are stored in an on-device SQLite database.
- **Appearance and language:** light and dark themes are supported, with English and Spanish translations.

## Technology

- [Expo SDK 57](https://docs.expo.dev/)
- [React Native](https://reactnative.dev/) and React 19
- [Expo Router](https://docs.expo.dev/router/introduction/) for file-based navigation
- [Expo SQLite](https://docs.expo.dev/versions/latest/sdk/sqlite/) for local persistence
- [i18next](https://www.i18next.com/) for localization
- Jest and [React Native Testing Library](https://callstack.github.io/react-native-testing-library/) for tests

## Requirements

- A current Node.js LTS release
- npm
- For Android development: Android Studio and the Android SDK
- For iOS development: macOS with Xcode and CocoaPods

## Getting started

Install the dependencies:

```bash
npm install
```

The install step also runs `patch-package`. This applies the checked-in compatibility patch for `react-native-calendars`, so dependencies should be installed through npm rather than copied manually.

Start the Expo development server:

```bash
npm start
```

From the Expo terminal, choose a connected device, emulator, or simulator. You can also build and launch a native development app directly:

```bash
npm run android
npm run ios
```

## Development commands

| Command | Purpose |
| --- | --- |
| `npm start` | Start the Expo development server. |
| `npm run android` | Build and run the Android app locally. |
| `npm run ios` | Build and run the iOS app locally. |
| `npm run lint` | Run the Expo ESLint configuration. |
| `npm test` | Run the Jest test suite once. |
| `npm run test:watch` | Run Jest in watch mode. |
| `npm run test:coverage` | Run the tests and produce a coverage report. |
| `npx tsc --noEmit` | Type-check the project without generating files. |

## Project structure

```text
src/
├── app/           Expo Router routes and navigation layouts
│   ├── (tabs)/    Main tab screens
│   └── (details)/ Add and edit screens presented above the tabs
├── app-tests/     Route and navigation tests kept outside the route tree
├── components/    Feature components and reusable base controls
├── constants/     Theme colors
├── hooks/         Shared React hooks
├── i18n/          English and Spanish translations
├── platform/      App-owned wrappers around Expo platform libraries
├── store/         SQLite access, migrations, events, and backup logic
├── test/          Shared test infrastructure
├── types/         Domain and backup types
└── utils/         Date, validation, badge, chart, and crypto utilities
```

Test files normally live beside the code they cover. Route tests are the exception: Expo Router treats every file under `src/app` as a route or layout, so route tests live in `src/app-tests`. Navigation integration tests use `expo-router/testing-library` and an in-memory route tree.

## Data and backups

The app opens a SQLite database named `habitDatabase` and applies versioned migrations on startup. Foreign-key checks are enabled, and deleting a habit or chart also removes its associated history.

Backups use a versioned JSON format. The export screen offers two scopes:

- **Main elements:** habits, charts, fridge items, todos, and birthdays.
- **All history:** the main elements plus habit completions and chart values.

An imported backup can be appended to the existing database or used to replace it. Append mode generates new identifiers to avoid conflicts. Replace mode clears the current records inside the same database transaction before inserting the backup.

Exported files are not encrypted. Treat them as personal data and store or share them accordingly.

## Architecture notes

- UI code depends on app-owned platform wrappers instead of importing document picker, file system, and sharing libraries directly.
- Storage mutations return typed result objects rather than using thrown errors as the public error-handling mechanism.
- Main tab routes and detail routes occupy separate navigator groups. Detail screens are pushed above the tab navigator, which hides the bottom navigation bar until the user returns.
- Forms use a shared keyboard-aware, safe-area-aware scroll container.
- Light and dark themes define semantic colors, including reminder urgency colors.

## Privacy

Habits does not require an account and does not send app records to a developer-operated server. Records remain on the device unless the user explicitly exports them or the operating system includes app data in a device backup.

See the full [Privacy Policy](./PRIVACY.md) for details.

## Contributing

Before opening a change, run:

```bash
npm run lint
npx tsc --noEmit
npm test -- --runInBand
```

Bug reports and feature requests can be opened in the [GitHub issue tracker](https://github.com/larkox/habits/issues). Do not attach personal backup files or sensitive information to an issue.

## License

Habits is available under the [MIT License](./LICENSE.md).
