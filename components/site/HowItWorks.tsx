import { ShieldCheck, Truck, Stethoscope, Camera, HandCoins, Check, X } from "lucide-react";

const steps = [
  {
    icon: Camera,
    title: "Browse the Catalog",
    desc: "Explore detailed photos, videos, pricing, and health notes for every animal in stock.",
  },
  {
    icon: HandCoins,
    title: "Pay on Handover",
    desc: "Confirm your choice over WhatsApp and pay cash on spot after the cow is handed over.",
  },
  {
    icon: Stethoscope,
    title: "Vet & Health Check",
    desc: "Every listed animal is checked for health, feed quality, and readiness before delivery.",
  },
  {
    icon: Truck,
    title: "Doorstep Delivery",
    desc: "For later delivery bookings, we take 50% advance; cancellations forfeit that advance.",
  },
];

const compareRows = [
  { feature: "Hygiene & Sanitation", haat: false, us: true },
  { feature: "Verified Live Weight", haat: false, us: true },
  { feature: "Vet-certified Health", haat: false, us: true },
  { feature: "Personal Support", haat: false, us: true },
  { feature: "Pre-purchase HD Video", haat: false, us: true },
  { feature: "Transparent Fixed Pricing", haat: false, us: true },
  { feature: "Doorstep Delivery", haat: false, us: true },
  { feature: "On-farm Care till Eid Day", haat: false, us: true },
];

export function HowItWorks() {
  return (
    <section id="how" className="bg-cream py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-xs uppercase tracking-[0.2em] text-gold">How it Works</p>
          <h2 className="mt-3 font-display text-4xl text-balance sm:text-5xl">
            A simple, transparent process from selection to handover.
          </h2>
          <p className="mt-4 text-muted-foreground">
            We keep the process direct: choose the animal, confirm with us, receive it, then pay on
            handover unless you book for later delivery.
          </p>
        </div>

        <ol className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <li
              key={s.title}
              className="group relative min-h-72 rounded-2xl border border-border bg-card p-8 shadow-card transition-all hover:-translate-y-1 hover:shadow-elegant"
            >
              <div className="flex items-center justify-between">
                <span className="grid h-14 w-14 place-items-center rounded-full bg-primary/10 text-primary">
                  <s.icon className="h-6 w-6" />
                </span>
                <span className="font-display text-3xl text-gold/70">0{i + 1}</span>
              </div>
              <h3 className="mt-8 font-display text-2xl">{s.title}</h3>
              <p className="mt-4 text-sm leading-6 text-muted-foreground">{s.desc}</p>
            </li>
          ))}
        </ol>

        <div
          id="comparison"
          className="mt-24 overflow-hidden rounded-2xl border border-border bg-card shadow-card"
        >
          <div className="border-b border-border p-6 lg:p-8">
            <h3 className="font-display text-2xl sm:text-3xl">Traditional Haat vs Us</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              A clear look at the parts of Qurbani buying that matter most.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
              <thead className="bg-muted/60">
                <tr className="text-left">
                  <th className="px-6 py-4 font-medium">Feature</th>
                  <th className="px-6 py-4 text-center font-medium text-muted-foreground">
                    Traditional Haat
                  </th>
                  <th className="px-6 py-4 text-center font-medium text-primary">Us</th>
                </tr>
              </thead>
              <tbody>
                {compareRows.map((r, i) => (
                  <tr key={r.feature} className={i % 2 ? "bg-muted/20" : ""}>
                    <td className="px-6 py-4">{r.feature}</td>
                    <td className="px-6 py-4 text-center">
                      {r.haat ? (
                        <Check className="mx-auto h-4 w-4 text-success" />
                      ) : (
                        <X className="mx-auto h-4 w-4 text-muted-foreground/60" />
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {r.us ? (
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
            Pay after handover for direct purchases. Later-delivery bookings require 50% advance and
            cancellations are non-refundable.
          </div>
        </div>
      </div>
    </section>
  );
}
