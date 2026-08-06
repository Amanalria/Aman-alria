import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ClientOnly } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import silhouette from "@/assets/hero-silhouette.png";
import stroke from "@/assets/stroke.png";
import { profile } from "./data";

const HeroAmbience = lazy(() => import("./HeroAmbience"));

const NAME = "AMAN ALRIA";

export default function Hero() {
  const section = useRef<HTMLDivElement>(null);
  const heading = useRef<HTMLDivElement>(null);
  const img = useRef<HTMLDivElement>(null);
  const imgDrift = useRef<HTMLDivElement>(null);
  const stroke1 = useRef<HTMLDivElement>(null);
  const stroke2 = useRef<HTMLDivElement>(null);
  const loader = useRef<HTMLDivElement>(null);
  const counter = useRef<HTMLDivElement>(null);
  const endLine = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    // Scroll is locked only while the intro loader is on screen and is always
    // released again (on complete, on unmount, and via a safety timeout) so the
    // page can never get stuck unscrollable.
    const lock = (on: boolean) => {
      document.body.style.overflow = on ? "hidden" : "";
    };
    lock(true);
    const safety = window.setTimeout(() => lock(false), 6000);

    const ctx = gsap.context(() => {
      const chars = heading.current!.querySelectorAll(".hero-char");
      gsap.set(chars, { autoAlpha: 0, yPercent: 110 });
      gsap.set(img.current, { autoAlpha: 0, yPercent: 22, scale: 0.86 });
      gsap.set([stroke1.current, stroke2.current], { autoAlpha: 0, width: "0%" });
      gsap.set(endLine.current, { autoAlpha: 0 });

      const isMobile = window.matchMedia("(max-width: 768px)").matches;

      const tl = gsap.timeline({
        onComplete: () => {
          setLoaded(true);
          lock(false);
        },
      });

      const greetings: { text: string; font: string }[] = [
        { text: "hello ji", font: "font-hand-en" },
        { text: "नमस्ते", font: "font-hand-hi" },
      ];

      greetings.forEach((g) => {
        const idx = { i: 0 };
        tl.set(counter.current, { autoAlpha: 1 })
          .call(() => {
            if (counter.current) {
              counter.current.className = `intro-greet ${g.font}`;
              counter.current.textContent = "";
            }
          })
          .to(idx, {
            i: g.text.length,
            duration: 0.04 * g.text.length + 0.45,
            ease: "none",
            onUpdate: () => {
              if (counter.current) counter.current.textContent = g.text.slice(0, Math.ceil(idx.i));
            },
          })
          .to(counter.current, { autoAlpha: 0, duration: 0.3, ease: "power2.inOut" }, "+=0.30");
      });

      tl.to(loader.current, { yPercent: -100, duration: 1.1, ease: "power4.inOut" })
        .to(
          chars,
          { autoAlpha: 1, yPercent: 0, duration: 1, ease: "power3.out", stagger: 0.045 },
          "-=0.55",
        )
        .to(
          img.current,
          { autoAlpha: 1, yPercent: 0, scale: 1, duration: 1.2, ease: "power2.out" },
          "-=0.7",
        )
        .to(
          stroke2.current,
          { autoAlpha: 1, width: isMobile ? "34vw" : "17vw", duration: 0.9, ease: "power2.out" },
          "-=0.9",
        )
        .to(
          stroke1.current,
          { autoAlpha: 1, width: isMobile ? "44vw" : "23vw", duration: 0.9, ease: "power2.out" },
          "-=0.75",
        )
        .to(".hero-meta", { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.08 }, "-=0.6");

      // Scroll cue line fades in as you leave the hero.
      gsap.to(endLine.current, {
        autoAlpha: 1,
        ease: "none",
        scrollTrigger: { trigger: section.current, start: "top top", end: "+=280", scrub: true },
      });

      // Portrait scroll drift lives on an inner wrapper, so it always scrubs
      // back to exactly 0 (its intro position) when you scroll to the top.
      gsap.fromTo(
        imgDrift.current,
        { yPercent: 0 },
        {
          yPercent: -5,
          ease: "none",
          immediateRender: false,
          scrollTrigger: {
            trigger: section.current,
            start: "top top",
            end: "bottom top",
            scrub: 1.2,
            invalidateOnRefresh: true,
          },
        },
      );






      gsap.to(".hero-parallax-head", {
        yPercent: 2,
        ease: "none",
        scrollTrigger: { trigger: section.current, start: "top top", end: "bottom top", scrub: 0.6 },
      });
    }, section);

    return () => {
      window.clearTimeout(safety);
      ctx.revert();
      lock(false);
    };
  }, []);

  // Mouse / gyro-free pointer parallax on the layers.
  useEffect(() => {
    if (!loaded) return;
    const el = section.current;
    if (!el) return;
    const layers = Array.from(el.querySelectorAll<HTMLElement>("[data-depth]"));
    const setters = layers.map((l) => ({
      depth: Number(l.dataset["depth"] ?? 0.2),
      x: gsap.quickTo(l, "x", { duration: 0.7, ease: "power3.out" }),
      y: gsap.quickTo(l, "y", { duration: 0.7, ease: "power3.out" }),
    }));

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const dx = (e.clientX - r.left) / r.width - 0.5;
      const dy = (e.clientY - r.top) / r.height - 0.5;
      setters.forEach((s) => {
        s.x(-dx * 70 * s.depth);
        s.y(-dy * 50 * s.depth);
      });
    };
    const onLeave = () => setters.forEach((s) => (s.x(0), s.y(0)));

    window.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [loaded]);

  return (
    <>
      {!loaded && (
        <div
          ref={loader}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-foreground"
          aria-hidden="true"
        >
          <div ref={counter} className="intro-greet font-hand-en" />
        </div>
      )}

      <section
        ref={section}
        id="top"
        className="relative h-[100svh] w-full overflow-hidden bg-background"
      >
        <div className="pointer-events-none absolute inset-0 opacity-70">
          <ClientOnly fallback={null}>
            <Suspense fallback={null}>
              <HeroAmbience />
            </Suspense>
          </ClientOnly>
        </div>



        {/* upper stroke — behind the portrait */}
        <div data-depth="0.3" className="absolute inset-0 z-[4]">
          <div
            ref={stroke2}
            className="absolute top-[26%] right-[6%] max-w-[88vw] overflow-hidden md:top-[23%] md:right-[14%]"
          >
            <img src={stroke} alt="" className="no-drag w-full opacity-100" />
          </div>
        </div>


        {/* giant name */}
        <div data-depth="0.08" className="absolute inset-0 z-[5] flex items-center justify-center">
          <div
            ref={heading}
            className="hero-parallax-head display-tight w-full px-4 text-center text-[16vw] whitespace-nowrap md:text-[13vw]"
          >
            {NAME.split("").map((c, i) => (
              <span key={i} className="hero-char inline-block">
                {c === " " ? "\u00A0" : c}
              </span>
            ))}
          </div>
        </div>

        {/* portrait silhouette */}
        <div className="absolute inset-0 z-10 flex items-end justify-center">
          <div ref={img} className="relative h-[78%] origin-bottom will-change-transform md:h-[90%]">
            <div ref={imgDrift} className="h-full will-change-transform">
              <img
                src={silhouette}
                alt="Aman Alria portrait silhouette"
                className="no-drag h-full w-auto object-contain object-bottom"
              />
            </div>
          </div>

        </div>

        {/* full-width soft fade where the portrait ends */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 z-[11] h-[26%] bg-gradient-to-t from-black via-black/45 to-transparent"
        />


        {/* lower stroke — in the foreground (over the portrait) */}
        <div data-depth="0.2" className="absolute inset-0 z-[12]">
          <div
            ref={stroke1}
            className="absolute bottom-[22%] left-0 max-w-[96vw] overflow-hidden md:bottom-[26%] md:left-[4%]"
          >
            <img src={stroke} alt="" className="no-drag w-full opacity-100" />
          </div>
        </div>



        {/* hero meta */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 px-5 pb-7 md:px-10 md:pb-10">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <p className="hero-meta text-ink-foreground/75 max-w-[16rem] translate-y-3 text-xs leading-relaxed opacity-0 md:max-w-xs md:text-sm">
              {profile.shortRole}
            </p>
            <div className="hero-meta text-ink-foreground/70 flex translate-y-3 items-center gap-3 text-xs tracking-[0.2em] uppercase opacity-0">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              {profile.location}
            </div>
            <p className="hero-meta text-ink-foreground/70 hidden translate-y-3 text-xs tracking-[0.2em] uppercase opacity-0 md:block">
              Scroll to explore
            </p>

          </div>
          <div ref={endLine} className="hairline mt-6 opacity-0" />
        </div>
      </section>
    </>
  );
}
