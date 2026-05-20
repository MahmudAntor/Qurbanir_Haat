import heroImg from "@/assets/hero-bull.jpg";
import { ArrowRight, PlayCircle } from "lucide-react";

export function Hero() {
  return (
    <section className="relative isolate min-h-[100svh] overflow-hidden">
      <img
        src={heroImg}
        alt="Premium Sahiwal bull at sunrise"
        className="absolute inset-0 h-full w-full object-cover"
        width={1920}
        height={1080}
      />
      <div className="absolute inset-0 bg-gradient-hero" />
      <div className="absolute inset-0 bg-[radial-gradient(80%_60%_at_50%_100%,oklch(0.18_0.05_155/0.6),transparent)]" />

      <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-7xl flex-col justify-end px-5 pb-28 pt-32 sm:pb-16 lg:px-8 lg:pb-24">
        <div className="max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3.5 py-1.5 text-xs font-medium uppercase tracking-[0.18em] text-white/90 backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-gold" />
            Eid-ul-Adha 2026 · Bookings Open
          </span>
          <h1 className="mt-6 font-display text-5xl leading-[1.02] text-white text-balance sm:text-6xl lg:text-7xl">
            Qurbanir Haat
          </h1>
          <p className="mt-5 max-w-xl text-base text-white/80 sm:text-lg">
            Hand-picked Qurbani cattle with transparent stats, vet-certified health notes, and
            delivery support across Bangladesh.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="#catalog"
              className="group inline-flex items-center gap-2 rounded-full bg-gold px-6 py-3.5 text-sm font-medium text-gold-foreground shadow-elegant transition-transform hover:scale-[1.02]"
            >
              View the Cattle Catalog
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </a>
            <a
              href="#how"
              className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/5 px-6 py-3.5 text-sm font-medium text-white backdrop-blur transition-colors hover:bg-white/15"
            >
              <PlayCircle className="h-4 w-4" />
              How it Works
            </a>
          </div>

          <dl className="mt-14 grid max-w-xl grid-cols-3 gap-6 border-t border-white/15 pt-6 text-white">
            {[
              { k: "60+", v: "Cattle in stock" },
              { k: "100%", v: "Vet-certified" },
              { k: "24/7", v: "WhatsApp support" },
            ].map((s) => (
              <div key={s.v}>
                <dt className="font-display text-3xl text-gold">{s.k}</dt>
                <dd className="mt-1 text-xs uppercase tracking-wider text-white/70">{s.v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
