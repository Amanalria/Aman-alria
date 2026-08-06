import { createFileRoute, ClientOnly } from "@tanstack/react-router";
import { useEffect, useRef, useState, lazy, Suspense } from "react";

const Globe = lazy(() => import("@/components/portfolio/Globe"));
import Hero from "@/components/portfolio/Hero";
import About from "@/components/portfolio/About";
import Accordion from "@/components/portfolio/Accordion";
import portrait from "@/assets/portrait.jpg";
import { profile, skillGroups, projects, experience } from "@/components/portfolio/data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Aman Alria — Developer, Frontend & UI Designer" },
      {
        name: "description",
        content:
          "Portfolio of Aman Alria — developer, frontend engineer and UI/UX designer building animated, interactive digital products with GSAP, Three.js and React.",
      },
      { property: "og:title", content: "Aman Alria — Developer, Frontend & UI Designer" },
      {
        property: "og:description",
        content:
          "Animated portfolio: frontend engineering, motion design and UI/UX work by Aman Alria.",
      },
    ],
  }),
  component: Index,
});

const nav = [
  { id: "about", label: "About" },
  { id: "work", label: "Work" },
  { id: "skills", label: "Skills" },
  { id: "experience", label: "Experience" },
  { id: "contact", label: "Contact" },
];

function Index() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const els = Array.from(
      root.current?.querySelectorAll<HTMLElement>(".reveal, .stagger") ?? [],
    );
    els.forEach((el) => {
      if (el.classList.contains("stagger")) {
        Array.from(el.children).forEach((child, i) => {
          (child as HTMLElement).style.transitionDelay = `${Math.min(i * 55, 500)}ms`;
        });
      }
    });

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );
    els.forEach((el) => io.observe(el));

    // Anything already in view on load reveals immediately.
    const t = window.setTimeout(() => {
      els.forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.top < window.innerHeight) el.classList.add("is-in");
      });
    }, 300);

    return () => {
      window.clearTimeout(t);
      io.disconnect();
    };
  }, []);

  return (
    <div ref={root} className="relative">
      <Nav />
      <Hero />
      <About />
      <Marquee />
      <Work />
      <Skills />
      <Experience />
      <Contact />
      <Footer />
    </div>
  );
}

function Nav() {
  const [open, setOpen] = useState(false);
  return (
    <header className="fixed inset-x-0 top-0 z-[100]">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-5 py-4 md:px-10">
        <a href="#top" className="text-sm font-semibold tracking-[0.18em] uppercase">
          Aman<span className="text-accent">.</span>Alria
        </a>
        <nav className="hidden items-center gap-1 rounded-full border border-border bg-card/80 p-1.5 backdrop-blur-xl md:flex">
          {nav.map((n) => (
            <a
              key={n.id}
              href={`#${n.id}`}
              className="rounded-full px-4 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              {n.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <a
            href="#contact"
            className="hidden rounded-full bg-ink px-5 py-2.5 text-xs font-semibold text-ink-foreground transition-colors hover:bg-accent hover:text-accent-foreground md:inline-flex"
          >
            Let's talk •
          </a>
          <button
            aria-label="Toggle menu"
            onClick={() => setOpen((v) => !v)}
            className="pill px-4 py-2 text-xs font-medium backdrop-blur-xl md:hidden"
          >
            {open ? "Close" : "Menu"}
          </button>
        </div>
      </div>
      {open && (
        <nav className="card-soft mx-5 grid gap-1 rounded-2xl p-3 md:hidden">
          {nav.map((n) => (
            <a
              key={n.id}
              href={`#${n.id}`}
              onClick={() => setOpen(false)}
              className="rounded-xl px-3 py-2 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              {n.label}
            </a>
          ))}
        </nav>
      )}
    </header>
  );
}

function Marquee() {
  const words = ["Development", "Interaction", "3D / WebGL", "Design Systems", "Brand", "Motion"];
  return (
    <div className="mt-24 overflow-hidden border-y border-border py-6 md:mt-40">
      <div className="animate-marquee flex w-max items-center gap-8 whitespace-nowrap">
        {[...words, ...words, ...words, ...words].map((w, i) => (
          <span
            key={i}
            className="display-tight flex items-center gap-8 text-3xl text-muted-foreground md:text-6xl"
          >
            {w} <span className="text-accent">✳</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function SectionHead({ index, title }: { index: string; title: string }) {
  return (
    <div className="reveal mb-10 md:mb-16">
      <div className="flex items-center gap-4">
        <span className="mono-label text-subtle">{index}</span>
        <span className="hairline flex-1" />
        <span className="h-1.5 w-1.5 rounded-full bg-accent" />
      </div>
      <h2 className="display-tight mt-6 text-4xl sm:text-6xl md:text-[6.5rem]">{title}</h2>
    </div>
  );
}

function Work() {
  return (
    <section id="work" className="mx-auto max-w-[1400px] scroll-mt-24 px-5 py-24 md:px-10 md:py-36">
      <SectionHead index="01 — Selected work" title="Projects" />
      <Accordion
        items={projects.map((p) => ({
          title: p.title,
          meta: `${p.kind} · ${p.year}`,
          body: (
            <div className="max-w-2xl">
              <p className="text-sm leading-relaxed text-muted-foreground md:text-base">
                {p.blurb}
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {p.stack.map((s) => (
                  <span
                    key={s}
                    className="pill px-3.5 py-1.5 text-[11px] text-muted-foreground transition-colors hover:border-accent hover:text-accent"
                  >
                    {s}
                  </span>
                ))}
              </div>
              <a
                href="#contact"
                className="group mt-7 inline-flex items-center gap-2 text-sm font-medium text-accent"
              >
                Discuss this project
                <span className="transition-transform duration-500 group-hover:translate-x-1">
                  →
                </span>
              </a>
            </div>
          ),
        }))}
      />
    </section>
  );
}

function Skills() {
  return (
    <section
      id="skills"
      className="mx-auto max-w-[1400px] scroll-mt-24 px-5 py-24 md:px-10 md:py-36"
    >
      <SectionHead index="02 — Toolkit" title="Skills" />
      <Accordion
        items={skillGroups.map((g) => ({
          title: g.title,
          meta: `${g.items.length} tools`,
          body: (
            <ul className="grid max-w-3xl gap-x-10 gap-y-3 sm:grid-cols-2">
              {g.items.map((s) => (
                <li
                  key={s}
                  className="flex items-center gap-3 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  <span className="h-1 w-1 shrink-0 rounded-full bg-accent" />
                  {s}
                </li>
              ))}
            </ul>
          ),
        }))}
      />
    </section>
  );
}

function Experience() {
  return (
    <section
      id="experience"
      className="mx-auto max-w-[1400px] scroll-mt-24 px-5 py-24 md:px-10 md:py-36"
    >
      <SectionHead index="03 — Journey" title="Experience" />
      <Accordion
        items={experience.map((e) => ({
          title: e.role,
          meta: `${e.company} · ${e.period}`,
          body: (
            <ul className="max-w-2xl space-y-3">
              {e.points.map((pt) => (
                <li key={pt} className="flex gap-3 text-sm leading-relaxed text-muted-foreground">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" />
                  {pt}
                </li>
              ))}
            </ul>
          ),
        }))}
      />
    </section>
  );
}

function Contact() {
  return (
    <section id="contact" className="relative scroll-mt-24 pb-10 md:pb-16">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 flex h-[42rem] w-full items-center justify-center overflow-hidden"
      >
        <div className="h-[150vw] max-h-[52rem] w-[150vw] max-w-[52rem] opacity-70 md:h-[50rem] md:w-[50rem]">
          <ClientOnly fallback={null}>
            <Suspense fallback={null}>
              <Globe
                speed={1.6}
                scale={9}
                detail={4}
                fill="dots"
                dots={{ color: "#ef4444", size: 6, density: 8, allDots: false }}
                oceanColor="rgba(0,0,0,0)"
                showOutline={false}
                showGrid
                graticuleColor="rgba(239,68,68,0.16)"
                stopOnHover={false}
                markerConfig={{ markers: [{ lat: 26.9, lng: 75.8 }], color: "#ef4444", size: 55 }}
              />
            </Suspense>
          </ClientOnly>
        </div>
      </div>
      <div className="relative mx-auto max-w-[1400px] px-5 py-16 text-center md:px-10 md:py-24">


        <div className="relative mx-auto flex max-w-3xl flex-col items-center">
          <div className="reveal relative">
            <div className="animate-float overflow-hidden rounded-[2rem] border border-border shadow-[var(--shadow-lift)]">
              <img
                src={portrait}
                alt="Portrait of Aman Alria"
                loading="lazy"
                className="h-[19rem] w-[15rem] object-cover md:h-[24rem] md:w-[19rem]"
              />
            </div>
            <span className="absolute -bottom-3 -left-6 flex h-20 w-20 items-center justify-center rounded-full bg-accent text-lg font-semibold text-accent-foreground md:h-24 md:w-24 md:text-xl">
              Hi
            </span>
          </div>

          <h2 className="reveal display-tight mt-14 text-[2.8rem] text-parrot uppercase sm:text-6xl md:text-[6.5rem]">
            Let&apos;s work together
          </h2>

          <p className="reveal mt-7 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
            Let&apos;s build something impactful together — whether it&apos;s your brand, your
            website, or your next big idea.
          </p>

          <div className="stagger mt-10 flex flex-wrap items-center justify-center gap-3">
            <a
              href={`mailto:${profile.email}`}
              className="sheen group inline-flex items-center gap-3 rounded-full bg-accent px-7 py-3.5 text-sm font-semibold text-accent-foreground transition-all duration-500 hover:-translate-y-0.5"
            >
              {profile.email}
              <span className="transition-transform duration-500 group-hover:translate-x-1">→</span>
            </a>
            <a
              href={`tel:${profile.phone.replace(/\s/g, "")}`}
              className="inline-flex items-center gap-3 rounded-full border border-border px-7 py-3.5 text-sm font-semibold transition-all duration-500 hover:-translate-y-0.5 hover:border-accent hover:text-accent"
            >
              {profile.phone}
            </a>
          </div>

          <div className="mono-label mt-8 flex items-center gap-2 text-subtle">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
            Available for work
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="mx-auto max-w-[1400px] px-5 pb-10 text-center md:px-10">
      <div className="hairline" />
      <div className="reveal flex flex-col items-center gap-6 py-14">
        <a href="#top" className="display-tight text-4xl md:text-6xl">
          Aman<span className="text-accent">.</span>Alria
        </a>
        <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
          {profile.shortRole}
        </p>

        <nav className="mt-2 flex flex-wrap items-center justify-center gap-x-7 gap-y-3 text-sm text-muted-foreground">
          {nav.map((n) => (
            <a
              key={n.id}
              href={`#${n.id}`}
              className="story-link transition-colors hover:text-foreground"
            >
              {n.label}
            </a>
          ))}
        </nav>

        <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
          {profile.socials.map((s) => (
            <a
              key={s.label}
              href={s.href}
              className="pill px-4 py-2 text-xs text-muted-foreground transition-all duration-500 hover:-translate-y-0.5 hover:border-accent hover:text-accent"
            >
              {s.label}
            </a>
          ))}
        </div>

        <a
          href={`mailto:${profile.email}`}
          className="mt-2 text-sm font-medium transition-colors hover:text-accent"
        >
          {profile.email}
        </a>
        <span className="mono-label text-subtle">{profile.location}</span>
      </div>
      <div className="flex flex-col items-center gap-2 border-t border-border py-6 text-xs text-subtle">
        <span>
          © {new Date().getFullYear()} {profile.name} — All rights reserved
        </span>
        <span className="mono-label">React · GSAP · Three.js</span>
      </div>
    </footer>
  );
}

