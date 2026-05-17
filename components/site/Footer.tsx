import { MessageCircle } from "lucide-react";
import { useSiteSettings } from "@/lib/use-site-settings";

export function FloatingWhatsApp() {
  const { whatsapp } = useSiteSettings();
  const WHATSAPP = whatsapp;
  return (
    <a
      href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent("Hello! I'd like to know more about your Qurbani cattle.")}`}
      target="_blank"
      rel="noopener"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-5 right-5 z-50 inline-flex items-center gap-2 rounded-full bg-whatsapp px-5 py-3.5 text-sm font-medium text-white shadow-elegant transition-transform hover:scale-105 sm:bottom-6 sm:right-6"
    >
      <span className="relative flex h-2.5 w-2.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/70 opacity-75" />
        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-white" />
      </span>
      <MessageCircle className="h-5 w-5" />
      <span className="hidden sm:inline">Chat with us</span>
    </a>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-border bg-primary text-primary-foreground">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 lg:grid-cols-4 lg:px-8">
        <div className="lg:col-span-2">
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-gold text-gold-foreground font-display text-lg">
              B
            </span>
            <span className="font-display text-lg">
              Bhumi <span className="text-gold">Bovine</span>
            </span>
          </div>
          <p className="mt-4 max-w-md text-sm text-primary-foreground/75">
            Premium Qurbani cattle, raised with care on our farm in Pabna. Hand-picked,
            vet-certified and personally delivered across Bangladesh.
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wider text-gold">Explore</p>
          <ul className="mt-4 space-y-2 text-sm text-primary-foreground/80">
            <li>
              <a href="#catalog" className="hover:text-gold">
                Catalog
              </a>
            </li>
            <li>
              <a href="#how" className="hover:text-gold">
                How it Works
              </a>
            </li>
            <li>
              <a href="#packages" className="hover:text-gold">
                Packages
              </a>
            </li>
            <li>
              <a href="#calculator" className="hover:text-gold">
                Yield Calculator
              </a>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wider text-gold">Contact</p>
          <ul className="mt-4 space-y-2 text-sm text-primary-foreground/80">
            <li>WhatsApp: +880 1700 000 000</li>
            <li>hello@bhumibovine.com</li>
            <li>Pabna · Dhaka · Bangladesh</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-primary-foreground/10 px-5 py-5 text-center text-xs text-primary-foreground/60 lg:px-8">
        © {new Date().getFullYear()} Bhumi Bovine. All rights reserved.
      </div>
    </footer>
  );
}
