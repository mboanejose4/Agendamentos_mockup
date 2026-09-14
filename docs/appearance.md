# Appearance and business branding

- assets/app.css is the only stylesheet: it imports Tailwind CSS v4, declares the light and dark tokens and maps them to utilities through `@theme inline`. See [tailwind.md](tailwind.md).
- Store/themeStore.js stores the light, dark or system preference under marcafacil.appearance and follows OS theme changes in automatic mode.
- Composable/useAppearance.js applies the active business palette to management, details and booking screens. Discovery and authentication use the platform palette.
- Utils/theme.js validates colors, selects a contrasting button foreground and derives readable accent text for each theme.
- Component/businesses/BrandingEditor.vue is shared by business registration and settings. It previews colors and accepts PNG/JPG/WebP icons up to 2 MB, resized to 128 x 128 before persistence.
- Business branding is stored as branding.primaryColor, branding.secondaryColor and branding.icon on each business. Existing records receive default colors without a migration. The existing local persistence retains these fields.
- Component/ui/BusinessIcon.vue displays the uploaded icon with a fallback. ThemeToggle.vue exposes theme selection in the topbar and authentication layout.

Run npm run test:appearance against a running development server (APP_URL override supported) for theme, viewport, upload, settings, persistence and tenant-switching checks. npm run test:ui supports APP_THEME=light or dark. Unit tests cover color validation and contrast.
