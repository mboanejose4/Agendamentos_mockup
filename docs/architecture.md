# Project architecture

The project is organised by responsibility, with English directory names and domain subfolders.

| Directory       | Responsibility                                                                                      |
| --------------- | --------------------------------------------------------------------------------------------------- |
| src/Page        | Screens and pageRegistry.js; subfolders auth, bookings, businesses, discovery, account and platform |
| src/Component   | Reusable UI, navigation, forms, feature containers and dialogs                                      |
| src/Composable  | Reactive logic and feature contexts, grouped by domain                                              |
| src/Store       | Application session, domain operations and shared reactive state                                    |
| src/API/service | Browser persistence service and demo data; future remote service implementations belong here        |
| src/Utils       | Pure formatting functions and navigation metadata                                                   |
| src/Layout      | MainLayout and AuthLayout                                                                           |
| src/assets      | app.css (Tailwind v4, tokens e primitivas) e imagens da marca                                        |
| tests/unit      | Domain regression tests                                                                             |
| tests/e2e       | Browser regression tests                                                                            |

Pages compose components. Generic components use explicit props and events. Feature dialogs and booking steps share one composable instance through their context provider. Stores manage shared state; services handle persistence. localStorageService.js preserves the existing storage key and schema. There is no remote API yet.

AuthLayout displays authentication without shared navigation. MainLayout serves all other pages. Page/pageRegistry.js preserves the current state-based navigation; it does not introduce Vue Router. App.vue selects the page and layout. core/state.js remains a compatibility re-export; new code imports Store/applicationStore.js.

To add a page, create Page/<domain>/<Name>Page.vue and register it in Page/pageRegistry.js or the relevant management component. Put reusable visual elements in Component, reactive logic in Composable and state-independent helpers in Utils. Keep props read-only and emit actions to the owner of the state.

Styling is Tailwind CSS v4 only; see [identidade-visual.md](identidade-visual.md) for the design tokens and [tailwind.md](tailwind.md) for the class conventions. Run npm test, npm run build, npm run format:check and npm run test:ui. Browser tests use localhost:5175 by default; APP_URL selects another development server. Restart the server after source moves to avoid stale hot-reload references.
