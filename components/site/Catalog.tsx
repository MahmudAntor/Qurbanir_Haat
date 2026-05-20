import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { formatBDT, type Cattle } from "@/lib/cattle-data";
import { optimizedImageUrl } from "@/lib/image-urls";
import { Play, MessageCircle, Scale, Heart, Wheat, Loader2 } from "lucide-react";
import { useSiteSettings } from "@/lib/use-site-settings";

function StatusBadge({ status }: { status: Cattle["status"] }) {
  const map = {
    Available: "bg-success/15 text-success border-success/30",
    Reserved: "bg-warning/20 text-warning border-warning/40",
    Sold: "bg-muted text-muted-foreground border-border",
  } as const;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium uppercase tracking-wider ${map[status]}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${status === "Available" ? "bg-success" : status === "Reserved" ? "bg-warning" : "bg-muted-foreground"}`}
      />
      {status}
    </span>
  );
}

export function Catalog() {
  const { whatsapp } = useSiteSettings();
  const [cattle, setCattle] = useState<Cattle[]>([]);
  const [loading, setLoading] = useState(true);
  const [breed, setBreed] = useState("All");
  const [weight, setWeight] = useState<[number, number]>([200, 1100]);
  const [maxPrice, setMaxPrice] = useState(1500000);
  const [video, setVideo] = useState<Cattle | null>(null);

  useEffect(() => {
    let active = true;
    supabase
      .from("cattle")
      .select("*")
      .order("sort_order", { ascending: true })
      .then(({ data, error }) => {
        if (!active) return;
        if (error) console.error(error);
        setCattle((data as Cattle[]) ?? []);
        setLoading(false);
      });
    const channel = supabase
      .channel("cattle-public")
      .on("postgres_changes", { event: "*", schema: "public", table: "cattle" }, () => {
        supabase
          .from("cattle")
          .select("*")
          .order("sort_order")
          .then(({ data }) => setCattle((data as Cattle[]) ?? []));
      })
      .subscribe();
    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, []);

  const breedOptions = useMemo(
    () => ["All", ...Array.from(new Set(cattle.map((c) => c.breed)))],
    [cattle],
  );

  const filtered = useMemo(
    () =>
      cattle.filter(
        (c) =>
          (breed === "All" || c.breed === breed) &&
          c.weight_kg >= weight[0] &&
          c.weight_kg <= weight[1] &&
          c.price_bdt <= maxPrice,
      ),
    [cattle, breed, weight, maxPrice],
  );

  return (
    <section id="catalog" className="bg-background py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <p className="text-xs uppercase tracking-[0.2em] text-gold">The Catalog</p>
            <h2 className="mt-3 font-display text-4xl text-balance sm:text-5xl">
              Meet our cattle.
            </h2>
            <p className="mt-4 text-muted-foreground">
              Every animal is hand-picked, raised on clean feed, and certified by our in-house vets.
              Tap any card to view a video, full stats, or reserve over WhatsApp.
            </p>
          </div>
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-medium text-foreground">{filtered.length}</span> of{" "}
            {cattle.length}
          </p>
        </div>

        <div className="mt-10 grid gap-5 rounded-2xl border border-border bg-card p-5 shadow-card lg:grid-cols-3">
          <div>
            <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Breed
            </label>
            <div className="mt-2 flex flex-wrap gap-2">
              {breedOptions.map((b) => (
                <button
                  key={b}
                  onClick={() => setBreed(b)}
                  className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${breed === b ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background hover:bg-muted"}`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="flex justify-between text-xs font-medium uppercase tracking-wider text-muted-foreground">
              <span>Weight</span>
              <span className="text-foreground normal-case tracking-normal">
                {weight[0]}–{weight[1]} kg
              </span>
            </label>
            <div className="mt-4 flex items-center gap-3">
              <input
                type="range"
                min={150}
                max={1200}
                step={10}
                value={weight[0]}
                onChange={(e) => setWeight([Math.min(+e.target.value, weight[1] - 10), weight[1]])}
                className="w-full accent-primary"
              />
              <input
                type="range"
                min={150}
                max={1200}
                step={10}
                value={weight[1]}
                onChange={(e) => setWeight([weight[0], Math.max(+e.target.value, weight[0] + 10)])}
                className="w-full accent-primary"
              />
            </div>
          </div>
          <div>
            <label className="flex justify-between text-xs font-medium uppercase tracking-wider text-muted-foreground">
              <span>Max Price</span>
              <span className="text-foreground normal-case tracking-normal">
                {formatBDT(maxPrice)}
              </span>
            </label>
            <input
              type="range"
              min={100000}
              max={1500000}
              step={25000}
              value={maxPrice}
              onChange={(e) => setMaxPrice(+e.target.value)}
              className="mt-4 w-full accent-primary"
            />
          </div>
        </div>

        {loading ? (
          <div className="mt-16 flex justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((c) => (
              <article
                key={c.id}
                className="group overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-elegant"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                  {c.image_url && (
                    <img
                      src={optimizedImageUrl(c.image_url, {
                        width: 640,
                        height: 480,
                        fit: "cover",
                        quality: 72,
                      })}
                      alt={c.name}
                      loading="lazy"
                      decoding="async"
                      width={1024}
                      height={768}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  )}
                  <div className="absolute left-3 top-3">
                    <StatusBadge status={c.status} />
                  </div>
                  {c.video_url && (
                    <button
                      onClick={() => setVideo(c)}
                      className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-background/90 px-3 py-1.5 text-xs font-medium backdrop-blur transition-colors hover:bg-background"
                    >
                      <Play className="h-3.5 w-3.5 fill-current" /> Watch Video
                    </button>
                  )}
                </div>

                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                        {c.code}
                      </p>
                      <h3 className="mt-0.5 font-display text-xl">{c.name}</h3>
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        {c.breed} · {c.color}
                      </p>
                    </div>
                    <p className="font-display text-lg text-primary">{formatBDT(c.price_bdt)}</p>
                  </div>

                  <dl className="mt-4 grid grid-cols-1 gap-y-2 text-xs sm:grid-cols-3 sm:gap-x-3">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Scale className="h-3.5 w-3.5" /> {c.weight_kg} kg
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Wheat className="h-3.5 w-3.5" /> {c.age_teeth} teeth
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Heart className="h-3.5 w-3.5" /> {c.health.split("·")[0].trim()}
                    </div>
                  </dl>

                  <p className="mt-3 line-clamp-1 text-xs text-muted-foreground">Feed: {c.feed}</p>

                  <a
                    href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(`I am interested in Bull ID: ${c.code}.`)}`}
                    target="_blank"
                    rel="noopener"
                    onClick={() => {
                      if (typeof window !== "undefined" && window.fbq)
                        window.fbq("track", "Lead", { content_ids: [c.code] });
                    }}
                    className={`mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-medium transition-colors ${
                      c.status === "Sold"
                        ? "pointer-events-none bg-muted text-muted-foreground"
                        : "bg-primary text-primary-foreground hover:bg-primary/90"
                    }`}
                  >
                    <MessageCircle className="h-4 w-4" />
                    {c.status === "Sold" ? "Sold Out" : "Reserve via WhatsApp"}
                  </a>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {video && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-foreground/70 p-4 backdrop-blur"
          onClick={() => setVideo(null)}
        >
          <div
            className="w-full max-w-2xl overflow-hidden rounded-2xl bg-card shadow-elegant"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="aspect-video bg-foreground">
              <video
                src={video.video_url ?? undefined}
                poster={optimizedImageUrl(video.image_url, {
                  width: 960,
                  height: 540,
                  fit: "cover",
                  quality: 72,
                })}
                controls
                autoPlay
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex items-center justify-between p-5">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  {video.code}
                </p>
                <h3 className="font-display text-xl">{video.name}</h3>
              </div>
              <button
                onClick={() => setVideo(null)}
                className="rounded-full border border-border px-4 py-2 text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
