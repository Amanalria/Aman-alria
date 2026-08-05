<div align="center">

# Aman Alria

**Developer · Frontend Engineer · UI / UX Designer**

India · Open to work

</div>

<br />

## About

Aman Alria is a developer and designer who builds real-world digital products end to end — across web, mobile and interactive interfaces. He treats design, code and motion as a single craft, shipping complete products rather than isolated screens. His work combines clean minimal interfaces with performant frontend engineering and meaningful animation.

<br />

## What I Do

- **Web & App Development** — End-to-end builds, from frontend to backend to deployment.
- **Interactive & 3D Web** — GSAP scroll storytelling, WebGL scenes and motion systems that give products a premium feel.
- **UI / UX Design** — Minimal, user-focused interfaces built to modern design standards.
- **Brand Identity** — Complete visual identity systems that define and elevate a digital product.

<br />

## Tech Stack

| Area | Tools |
| --- | --- |
| **Framework** | TanStack Start · React 19 · TypeScript |
| **Build** | Vite 7 |
| **Styling** | Tailwind CSS v4 · Custom design tokens |
| **Animation** | GSAP · ScrollTrigger |
| **3D / WebGL** | Three.js · React Three Fiber · Drei |
| **Fonts** | Inter Tight · JetBrains Mono · Caveat · Kalam |

<br />

## Features

- Animated hero with name reveal, mouse parallax and scroll-driven portrait drift
- 3D ambient scene rendered with React Three Fiber
- Accordion-based Work, Skills and Experience sections (all start closed)
- Scroll-scrub scaling on the About portrait
- Premium contact block with centered portrait and gradient glow
- Fully responsive — mobile-first, works across phone and desktop
- SEO-ready with semantic HTML and Open Graph metadata

<br />

## Project Structure

```
src/
├── assets/                  # Portrait + silhouette images
├── components/portfolio/    # Hero, About, Accordion, HeroAmbience
├── routes/
│   ├── __root.tsx           # App shell + fonts
│   └── index.tsx            # Main portfolio page
├── styles.css               # Design tokens + utilities
└── router.tsx
```

<br />

## Getting Started

### Requirements
- Node.js 18+ (recommended via [nvm](https://github.com/nvm-sh/nvm))

### Install & run locally

```bash
git clone <this-repository-url>
cd aman-alria-portfolio
bun install      # or: npm install
bun run dev      # or: npm run dev
```

Then open `http://localhost:8080` in your browser.

### Build for production

```bash
bun run build    # or: npm run build
```

<br />

## Deployment

This project is configured for **Vercel**.

1. Push the repository to GitHub.
2. On Vercel: **Add New → Project** → import the repo.
3. Settings are picked up automatically from `vercel.json`:
   - **Framework Preset:** Other
   - **Build Command:** `bun run build`
   - **Install Command:** `bun install`
4. Click **Deploy** — live in 1–2 minutes.

<br />

## Customization

All content — bio, skills, projects, experience and contact details — lives in a single file:

```
src/components/portfolio/data.ts
```

Edit it to update text, links and details. Colors and design tokens are defined in `src/styles.css`.

<br />

## Contact

<div align="center">

**Aman Alria** — India · Open to work

📧 [amanalria9@gmail.com](mailto:amanalria9@gmail.com)

</div>

<br />

---

<div align="center">

<sub>© 2026 Aman Alria — All rights reserved</sub>
<br />
<sup>Built with React · GSAP · Three.js</sup>

</div>
