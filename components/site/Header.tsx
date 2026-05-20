import { Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import logoSrc from "@/logo.jpg";

const links: Array<{ href?: string; to?: "/about-us"; label: string }> = [
  { href: "/#catalog", label: "Catalog" },
  { href: "/#how", label: "How it Works" },
  { href: "/#comparison", label: "Compare" },
  { href: "/#calculator", label: "Yield Calculator" },
  { to: "/about-us", label: "About Us" },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-background/85 backdrop-blur-lg border-b border-border/60" : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid h-11 w-11 place-items-center overflow-hidden rounded-full bg-background/95 ring-1 ring-border/60">
            <img src={logoSrc} alt="Qurbanir Haat logo" className="h-full w-full object-contain" />
          </span>
          <span className="font-display text-lg font-medium tracking-tight">Qurbanir Haat</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((l) =>
            l.to ? (
              <Link
                key={l.to}
                to={l.to}
                className="text-sm text-foreground/80 transition-colors hover:text-foreground"
              >
                {l.label}
              </Link>
            ) : (
              <a
                key={l.href}
                href={l.href}
                className="text-sm text-foreground/80 transition-colors hover:text-foreground"
              >
                {l.label}
              </a>
            ),
          )}
        </nav>

        <a
          href="/#catalog"
          className="hidden rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-transform hover:scale-[1.02] md:inline-block"
        >
          Browse Cattle
        </a>

        <button className="md:hidden" aria-label="Menu" onClick={() => setOpen((o) => !o)}>
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border bg-background md:hidden">
          <nav className="flex flex-col gap-1 px-5 py-4">
            {links.map((l) =>
              l.to ? (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => setOpen(false)}
                  className="rounded-md px-3 py-3 text-base hover:bg-muted"
                >
                  {l.label}
                </Link>
              ) : (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="rounded-md px-3 py-3 text-base hover:bg-muted"
                >
                  {l.label}
                </a>
              ),
            )}
            <a
              href="/#catalog"
              onClick={() => setOpen(false)}
              className="mt-2 rounded-full bg-primary px-5 py-3 text-center text-sm font-medium text-primary-foreground"
            >
              Browse Cattle
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
