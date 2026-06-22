Design System & Tokens

1. Color Palette (Tailwind Extension)

These map to `tailwind.config.mjs`. The palette is designed to look premium and "Global-Standard" while remaining accessible.

- Primary (Brand): `4F46E5` (Indigo-600) -> Represents Tech, Trust, and Stability.

- Secondary (Depth): `0F172A` (Slate-900) -> Used for heavy footers and dark mode backgrounds.

- Accent (Growth): `10B981` (Emerald-500) -> Subtly nodding to Kerala's greenery, used for success states and "Growth" metrics.

- Surface: `FFFFFF` (White) / `F8FAFC` (Slate-50)

- Text-Main: `1E293B` (Slate-800) -> Softer than pure black for readability.

- Text-Muted: `64748B` (Slate-500)

Naming Convention: `bg-primary-600`, `text-secondary-900`, `border-accent-500`


2. Typography

These map to `global.css` or Tailwind config.

- Font-Display: `'Outfit', sans-serif` -> Modern, geometric, high-energy. Great for "Digital" branding.

- Font-Body: `'Plus Jakarta Sans', sans-serif` -> Highly legible, professional, tech-oriented.

Scale:

- `text-display`: `text-5xl md:text-7xl font-bold tracking-tighter` (Hero Headlines)

- `text-h1`: `text-4xl md:text-5xl font-bold tracking-tight`

- `text-h2`: `text-3xl md:text-4xl font-semibold text-secondary-900`

- `text-body`: `text-base md:text-lg leading-7 text-slate-600`

- `text-nav`: `text-sm font-medium uppercase tracking-widest`


 3. Animation Strategy (GSAP)

Constraint: Smooth micro-interactions over heavy motion. Mobile performance is key for the Kerala market.

| Class Name     | Effect                                  | Duration | Easing   |
| ------------------ | ------------------------------------------- | ------------ | ------------ |
| .anim-hero-text    | Split-text char reveal (Staggered)          | 1.0s         | expo.out     |
| .anim-fade-up      | Opacity 0 -> 1, Y +30px -> 0                | 0.8s         | power3.out   |
| .anim-image-reveal | Clip-path inset(0% 100% 0% 0%) -> inset(0%) | 1.2s         | power4.inOut |
| .hover-card-lift   | Y -10px, Shadow Spread increase             | 0.3s         | power1.out   |

Implementation Rule:

1. Observer: Use `ScrollTrigger` for all enter animations.

2. Prefers-Reduced-Motion: Wrap GSAP logic in a media query check to disable for sensitive users.


 4. UI Component Specs

Buttons

- Primary (CTA): `bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 rounded-full font-semibold shadow-lg shadow-primary-500/30 transition-all hover:scale-105`

- Secondary (Ghost): `text-secondary-900 hover:text-primary-600 font-medium px-6 py-3 transition-colors flex items-center gap-2 group` (Arrow moves on hover).

- WhatsApp Float: `fixed bottom-6 right-6 bg-[25D366] text-white p-4 rounded-full shadow-xl hover:scale-110 z-50`

Cards (Services/Features)

- `bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-primary-100 transition-all duration-300 group`

- Effect: Icon inside the card scales up slightly on hover.

Forms (Contact)

- Input: `w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all placeholder:text-slate-400`

- Label: `block text-sm font-medium text-slate-700 mb-1`

Navbar

- Mobile: Glassmorphism overlay (`backdrop-blur-md bg-white/90`) is mandatory for the mobile menu to feel "App-like."