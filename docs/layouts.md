# Layouts

- src/Layout/AuthLayout.vue: standalone authentication shell.
- src/Layout/MainLayout.vue: shared navigation for other pages.
- src/Component/navigation: sidebar, topbar, footer and workspace switcher.
- src/Composable/navigation/useAppNavigation.js: navigation state and actions.
- The sidebar is an off-canvas drawer by default and only becomes a fixed column under the `desk:` variant — screens wider than 1024px with a fine pointer, or any screen wider than 1366px — so phones and tablets in any orientation reach it through the topbar menu button. The variant is declared in assets/app.css.
- The topbar is `sticky top-0 z-40` at every size, with a translucent surface and a backdrop blur, so it stays in view while the page scrolls.
- The MarcaFácil wordmark is an image (src/assets/img/logo.png, plus logo-dark.png for the dark theme) shown in the sidebar and, once the sidebar collapses into a drawer, in the topbar. Both copies scale with the viewport: the sidebar one fills the available column width up to 186px, the topbar one is 24px tall and 32px from `sm` up. The dark variant is swapped in by the `.brand-logo-light` / `.brand-logo-dark` rules in app.css.
- src/Page/auth/SignInPage.vue: authentication page.
- src/Component/auth/SignInForm.vue: sign-in and registration interface.
- src/Composable/auth/useSignIn.js: authentication form logic.
- src/Page/businesses/RegisterBusinessPage.vue: business registration.

See [architecture.md](architecture.md) for all directory responsibilities.
