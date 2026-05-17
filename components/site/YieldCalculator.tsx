import { useState } from "react";
import { formatBDT } from "@/lib/cattle-data";
import { Calculator } from "lucide-react";

export function YieldCalculator() {
  const [weight, setWeight] = useState(450);
  const [people, setPeople] = useState(7);

  const yieldLow = Math.round(weight * 0.55);
  const yieldHigh = Math.round(weight * 0.6);
  const avg = Math.round((yieldLow + yieldHigh) / 2);
  const perPerson = avg / people;
  const pricePerKg = 1100; // BDT estimate
  const totalPrice = avg * pricePerKg;
  const sharePrice = totalPrice / people;

  return (
    <section id="calculator" className="bg-background py-20 lg:py-28">
      <div className="mx-auto max-w-6xl px-5 lg:px-8">
        <div className="grid items-center gap-10 rounded-3xl border border-border bg-gradient-to-br from-primary to-primary/85 p-8 text-primary-foreground shadow-elegant lg:grid-cols-5 lg:p-12">
          <div className="lg:col-span-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium uppercase tracking-wider">
              <Calculator className="h-3.5 w-3.5" /> Yield Calculator
            </div>
            <h2 className="mt-4 font-display text-4xl text-balance sm:text-5xl">
              Estimate meat yield <span className="italic text-gold">in seconds.</span>
            </h2>
            <p className="mt-4 text-primary-foreground/80">
              Planning a shared Qurbani? Enter the live weight and group size to see estimated meat
              yield and a fair price-per-share.
            </p>
          </div>

          <div className="rounded-2xl bg-background p-6 text-foreground lg:col-span-3 lg:p-8">
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block">
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Live Weight (kg)
                </span>
                <input
                  type="number"
                  min={100}
                  max={1500}
                  value={weight}
                  onChange={(e) => setWeight(Math.max(50, +e.target.value || 0))}
                  className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-3 font-display text-2xl outline-none ring-ring focus:ring-2"
                />
                <input
                  type="range"
                  min={150}
                  max={1200}
                  step={10}
                  value={weight}
                  onChange={(e) => setWeight(+e.target.value)}
                  className="mt-3 w-full accent-primary"
                />
              </label>
              <label className="block">
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Number of Shares (people)
                </span>
                <input
                  type="number"
                  min={1}
                  max={7}
                  value={people}
                  onChange={(e) => setPeople(Math.min(7, Math.max(1, +e.target.value || 1)))}
                  className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-3 font-display text-2xl outline-none ring-ring focus:ring-2"
                />
                <p className="mt-3 text-xs text-muted-foreground">
                  Up to 7 shares per cattle (Shariah).
                </p>
              </label>
            </div>

            <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-border pt-6 sm:grid-cols-4">
              <div>
                <dt className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  Est. Yield
                </dt>
                <dd className="mt-1 font-display text-2xl text-primary">
                  {yieldLow}–{yieldHigh}
                  <span className="text-sm text-muted-foreground"> kg</span>
                </dd>
              </div>
              <div>
                <dt className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  Per Share
                </dt>
                <dd className="mt-1 font-display text-2xl text-primary">
                  {perPerson.toFixed(1)}
                  <span className="text-sm text-muted-foreground"> kg</span>
                </dd>
              </div>
              <div>
                <dt className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  Suggested ৳/kg
                </dt>
                <dd className="mt-1 font-display text-2xl text-primary">{formatBDT(pricePerKg)}</dd>
              </div>
              <div>
                <dt className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  Per Share Price
                </dt>
                <dd className="mt-1 font-display text-2xl text-gold">
                  {formatBDT(Math.round(sharePrice))}
                </dd>
              </div>
            </dl>
            <p className="mt-4 text-xs text-muted-foreground">
              Estimates only. Actual yield depends on bone structure, fat ratio and butchery method
              (typically 55–60% of live weight).
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
