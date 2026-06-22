# Screen location images

Drop real screen photos here to replace the auto-generated gradient placeholders.

- Filename must match the `image:` value of a location in
  `src/content/pages/contact.md` (e.g. `image: "koramangala.jpg"` → `koramangala.jpg` in this folder).
- Supported: `.jpg`, `.jpeg`, `.png`, `.webp`, `.avif`.
- Recommended size: 800×600 (4:3), optimized. Astro's `<Image>` handles further optimization.
- If a location has no `image:` (or the file is missing), a branded gradient
  placeholder with the venue initials is shown automatically.

In Phase 3, franchise admins can also upload these images through the admin
panel (stored in Firebase Storage), which override these static files at runtime.
