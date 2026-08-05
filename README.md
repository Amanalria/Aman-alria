<div align="center">

# Aman Alria

### Developer · Frontend Engineer · UI / UX Designer

**Personal Portfolio**

</div>

---

<br />

<p align="center">
  <em>"Design, code aur motion — teeno ko ek craft maanta hoon. Isolated screens nahi, poora product banata hoon."</em>
</p>

<br />

## About

Yeh **Aman Alria** ka personal portfolio website hai — ek highly animated, 3D-look, premium dark-themed digital experience. Ismein frontend engineering, motion design aur UI/UX ka combine craft dikhta hai. Built with a focus on performance, minimalism and real interactivity.

- **Theme:** Dark · Light-red accent · Parrot-green contact heading
- **Motion:** GSAP scroll storytelling, Three.js ambience, scroll-scrub reveals
- **Sections:** Hero · About · Selected Work · Skills · Experience · Contact
- **Greeting intro:** Typed "hello ji" / "नमस्ते जी" loader

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

- **Animated hero** — name reveal, mouse parallax, portrait drift-on-scroll
- **3D ambience** — distorted spheres via React Three Fiber
- **Accordion sections** — Work, Skills, Experience (all start closed)
- **Scroll-scrub portrait** — About image scales subtly as you scroll
- **Premium contact block** — centered portrait, "Hi" badge, gradient glow
- **Fully responsive** — mobile-first, works on phone and desktop
- **SEO ready** — meta tags, semantic HTML, Open Graph

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
- Bun (or npm)

### Install & run locally

```bash
git clone <this-repository-url>
cd aman-alria-portfolio
bun install      # or: npm install
bun run dev      # or: npm run dev
```

Open `http://localhost:8080` in your browser.

### Build for production

```bash
bun run build    # or: npm run build
```

<br />

## Deployment

Yeh project **Vercel** ke liye configured hai.

1. GitHub pe repo push karo.
2. Vercel.com → **Add New → Project** → repo import karo.
3. Settings `vercel.json` se automatically aa jayenge:
   - **Framework Preset:** Other
   - **Build Command:** `bun run build`
   - **Install Command:** `bun install`
4. **Deploy** → live in 1–2 minutes.

> Lovable preview ke alag se yeh apne Vercel domain pe chalega.

<br />

## Customization

Saara content — bio, skills, projects, experience, contact details — ek hi file mein hai:

```
src/components/portfolio/data.ts
```

Wahan edit karke text, links aur details update kar sakte ho. Colors aur design tokens `src/styles.css` mein defined hain.

<br />

## Contact

<div align="center">

**Aman Alria** — India · Open to work

📧 [amanalria9@gmail.com](mailto:amanalria9@gmail.com)
📱 [+91 70733 61989](tel:+917073361989)

</div>

<br />

---

<div align="center">

<sub>© 2026 Aman Alria — All rights reserved</sub>
<br />
<sup>Built with React · GSAP · Three.js</sup>

</div>
