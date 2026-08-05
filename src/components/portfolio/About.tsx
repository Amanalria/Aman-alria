import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import portrait from "@/assets/portrait.jpg";
import { profile, services } from "./data";

const LINE_1 = ["Building", "Real"];
const LINE_2 = ["Digital", "Products"];

export default function About() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap.from(".about-word", {
        yPercent: 120,
        autoAlpha: 0,
        duration: 1,
        ease: "power3.out",
        stagger: 0.09,
        scrollTrigger: { trigger: root.current, start: "top 78%" },
      });
      gsap.from(".about-copy > *", {
        y: 28,
        autoAlpha: 0,
        duration: 0.8,
        stagger: 0.12,
        ease: "power2.out",
        scrollTrigger: { trigger: ".about-copy", start: "top 85%" },
      });
      gsap.from(".about-service", {
        y: 34,
        autoAlpha: 0,
        duration: 0.7,
        stagger: 0.08,
        ease: "power2.out",
        scrollTrigger: { trigger: ".about-services", start: "top 88%" },
      });
      gsap.to(".about-portrait", {
        yPercent: -14,
        ease: "none",
        scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: true },
      });
      // slow "small → big" breathing zoom on the portrait itself
      gsap.fromTo(
        ".about-portrait-img",
        { scale: 1.02 },
        {
          scale: 1.14,
          ease: "none",
          scrollTrigger: {
            trigger: ".about-portrait",
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
          },
        },
      );
      gsap.from(".about-portrait", {
        scale: 0.92,
        autoAlpha: 0,
        duration: 1.2,
        ease: "power3.out",
        scrollTrigger: { trigger: ".about-portrait", start: "top 90%" },
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section id="about" ref={root} className="relative mx-auto max-w-[1400px] px-5 pt-24 md:px-10 md:pt-40">
      <h2 className="display-tight text-[3.1rem] sm:text-7xl md:text-[9rem]">
        <span className="block overflow-hidden">
          {LINE_1.map((w) => (
            <span key={w} className="about-word inline-block">
              {w}&nbsp;
            </span>
          ))}
        </span>
        <span className="block overflow-hidden">
          {LINE_2.map((w) => (
            <span key={w} className="about-word inline-block">
              {w}&nbsp;
            </span>
          ))}
        </span>
      </h2>

      <div className="mt-12 grid gap-12 md:mt-20 md:grid-cols-[0.85fr_1fr] md:gap-16">
        <div className="relative">
          <div className="about-portrait overflow-hidden rounded-3xl border border-border bg-card shadow-[var(--shadow-lift)]">
            <img
              src={portrait}
              alt="Portrait of Aman Alria"
              loading="lazy"
              className="about-portrait-img h-full w-full object-cover will-change-transform"
            />

          </div>
          <div className="animate-float pill absolute -right-3 -bottom-5 px-4 py-2 text-xs tracking-[0.18em] uppercase shadow-[var(--shadow-soft)]">
            {profile.years} years · {profile.projectsDone} projects
          </div>
        </div>

        <div>
          <div className="about-copy flex flex-col gap-4 text-lg leading-snug md:text-2xl">
            {profile.intro.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>

          <div className="about-services mt-12">
            <div className="flex items-center gap-4">
              <span className="text-[0.7rem] tracking-[0.25em] text-subtle uppercase">
                Services
              </span>
              <span className="hairline flex-1" />
            </div>
            <div className="mt-6 grid gap-x-10 gap-y-8 sm:grid-cols-2">
              {services.map((s) => (
                <article key={s.title} className="about-service group">
                  <h3 className="flex items-baseline gap-2 text-base font-semibold md:text-lg">
                    <span className="text-accent transition-transform duration-300 group-hover:translate-x-1">
                      ↗
                    </span>
                    {s.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
