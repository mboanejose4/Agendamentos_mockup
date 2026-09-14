# Layouts

- src/Layout/AuthLayout.vue: standalone authentication shell.
- src/Layout/MainLayout.vue: shared navigation for other pages.
- src/Component/navigation: sidebar, topbar, footer and workspace switcher.
- src/Composable/navigation/useAppNavigation.js: navigation state and actions.
- The sidebar is an off-canvas drawer by default and only becomes a fixed column under the `desk:` variant — screens wider than 1024px with a fine pointer, or any screen wider than 1366px — so phones and tablets in any orientation reach it through the topbar menu button. The variant is declared in assets/app.css.
- The topbar is `sticky top-0 z-40` at every size, with a translucent surface and a backdrop blur, so it stays in view while the page scrolls.
- The MarcaFácil wordmark is an image (src/assets/img/logo.png, plus logo-dark.png for the dark theme) and it lives **only in the sidebar**, filling the column width up to 186px. The topbar never carries it: on a phone the sidebar is the drawer, so the mark shows once, when the drawer is open, and the topbar is left for the menu button, the screen name and the actions. The dark variant is swapped in by the `.brand-logo-light` / `.brand-logo-dark` rules in app.css.
- Below `lg` the topbar shows only the current screen name; the full path (establishment → screen) appears from `lg` up, where there is room for it.
- src/Page/auth/SignInPage.vue: authentication page.
- src/Component/auth/SignInForm.vue: sign-in and registration interface.
- src/Component/auth/AuthIntroduction.vue: below `sm` only the icon and the greeting are shown; the headline, the supporting line and the photograph are hidden so the form fits the first screen.
- src/Composable/auth/useSignIn.js: authentication form logic.
- src/Page/businesses/RegisterBusinessPage.vue: business registration.

See [architecture.md](architecture.md) for all directory responsibilities.
