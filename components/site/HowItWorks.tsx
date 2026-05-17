import {
  ShieldCheck,
  Truck,
  Stethoscope,
  Camera,
  HandCoins,
  Sparkles,
  Check,
  X,
} from "lucide-react";

const steps = [
  {
    icon: Camera,
    title: "Browse the Catalog",
    desc: "Explore detailed photos, videos and stats for every animal in our stock.",
  },
  {
    icon: HandCoins,
    title: "Reserve with a Deposit",
    desc: "Lock in your pick with a small advance over WhatsApp or our booking form.",
  },
  {
    icon: Stethoscope,
    title: "Vet & Health Check",
    desc: "Final certification, deworming and a clean bill of health before delivery.",
  },
  {
    icon: Truck,
    title: "Doorstep Delivery",
    desc: "Personally delivered on your scheduled date — anywhere in Bangladesh.",
  },
];

const compareRows = [
  { feature: "Hygiene & Sanitation", us: true, haat: false, corp: true },
  { feature: "Verified Live Weight", us: true, haat: false, corp: true },
  { feature: "Vet-certified Health", us: true, haat: false, corp: true },
  {
    feature: "Personal Manager / 24×7 Support",
    us: true,
    haat: false,
    corp: false,
  },
  { feature: "Pre-purchase HD Video", us: true, haat: false, corp: false },
  { feature: "Transparent Fixed Pricing", us: true, haat: false, corp: true },
  { feature: "Doorstep Delivery", us: true, haat: false, corp: true },
  { feature: "On-farm Care till Eid Day", us: true, haat: false, corp: false },
];

export function HowItWorks() {
  return (
    <section id="how" className="bg-cream py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-xs uppercase tracking-[0.2em] text-gold">How it Works</p>
          <h2 className="mt-3 font-display text-4xl text-balance sm:text-5xl">
            A simple, transparent process — from pasture to your home.
          </h2>
          <p className="mt-4 text-muted-foreground">
            We handle the entire journey so you don't have to step into a crowded haat. Four clear
            steps, zero guesswork.
          </p>
        </div>

        <ol className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <li
              key={s.title}
              className="group relative rounded-2xl border border-border bg-card p-6 shadow-card transition-all hover:-translate-y-1 hover:shadow-elegant"
            >
              <div className="flex items-center justify-between">
                <span className="grid h-11 w-11 place-items-center rounded-full bg-primary/10 text-primary">
                  <s.icon className="h-5 w-5" />
                </span>
                <span className="font-display text-2xl text-gold/70">0{i + 1}</span>
              </div>
              <h3 className="mt-5 font-display text-xl">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
            </li>
          ))}
        </ol>

        {/* Packages */}
        <div id="packages" className="mt-24 grid gap-6 lg:grid-cols-3">
          {[
            {
              name: "Essential",
              price: "Included",
              tag: "with every booking",
              points: [
                "Hand-picked healthy animal",
                "Vet-certified & dewormed",
                "Free delivery within Dhaka",
                "WhatsApp support",
              ],
            },
            {
              name: "Signature",
              price: "+ ৳5,000",
              tag: "Most popular",
              featured: true,
              points: [
                "Everything in Essential",
                "On-farm care till Eid day",
                "Premium feed program",
                "Live video updates",
              ],
            },
            {
              name: "Concierge",
              price: "Custom",
              tag: "for groups & corporates",
              points: [
                "Multiple animals",
                "On-site Qurbani arrangement",
                "Halal-cut, packed & distributed",
                "Dedicated account manager",
              ],
            },
          ].map((p) => (
            <div
              key={p.name}
              className={`relative rounded-2xl p-7 shadow-card ${
                p.featured
                  ? "bg-primary text-primary-foreground shadow-elegant"
                  : "border border-border bg-card"
              }`}
            >
              {p.featured && (
                <span className="absolute -top-3 left-7 rounded-full bg-gradient-gold px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-gold-foreground">
                  <Sparkles className="mr-1 inline h-3 w-3" /> {p.tag}
                </span>
              )}
              <p
                className={`text-xs uppercase tracking-wider ${p.featured ? "text-primary-foreground/70" : "text-muted-foreground"}`}
              >
                {p.featured ? "Tier" : p.tag}
              </p>
              <h3 className="mt-2 font-display text-2xl">{p.name}</h3>
              <p
                className={`mt-1 font-display text-3xl ${p.featured ? "text-gold" : "text-primary"}`}
              >
                {p.price}
              </p>
              <ul className="mt-5 space-y-2.5 text-sm">
                {p.points.map((pt) => (
                  <li key={pt} className="flex gap-2">
                    <Check
                      className={`mt-0.5 h-4 w-4 shrink-0 ${p.featured ? "text-gold" : "text-success"}`}
                    />
                    <span
                      className={
                        p.featured ? "text-primary-foreground/90" : "text-muted-foreground"
                      }
                    >
                      {pt}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Comparison */}
        <div className="mt-24 overflow-hidden rounded-2xl border border-border bg-card shadow-card">
          <div className="border-b border-border p-6 lg:p-8">
            <h3 className="font-display text-2xl sm:text-3xl">Why Bhumi Bovine</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              A clear comparison with the alternatives.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-sm">
              <thead className="bg-muted/60">
                <tr className="text-left">
                  <th className="px-6 py-4 font-medium">Feature</th>
                  <th className="px-6 py-4 text-center font-medium text-primary">Bhumi Bovine</th>
                  <th className="px-6 py-4 text-center font-medium text-muted-foreground">
                    Traditional Haats
                  </th>
                  <th className="px-6 py-4 text-center font-medium text-muted-foreground">
                    Corporate Services
                  </th>
                </tr>
              </thead>
              <tbody>
                {compareRows.map((r, i) => (
                  <tr key={r.feature} className={i % 2 ? "bg-muted/20" : ""}>
                    <td className="px-6 py-4">{r.feature}</td>
                    <td className="px-6 py-4 text-center">
                      <Check className="mx-auto h-4 w-4 text-success" />
                    </td>
                    <td className="px-6 py-4 text-center">
                      {r.haat ? (
                        <Check className="mx-auto h-4 w-4 text-success" />
                      ) : (
                        <X className="mx-auto h-4 w-4 text-muted-foreground/60" />
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {r.corp ? (
                        <Check className="mx-auto h-4 w-4 text-success" />
                      ) : (
                        <X className="mx-auto h-4 w-4 text-muted-foreground/60" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center gap-3 border-t border-border bg-muted/30 px-6 py-4 text-xs text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-primary" />
            100% money-back guarantee if the animal doesn't match the listed specifications.
          </div>
        </div>
      </div>
    </section>
  );
}
