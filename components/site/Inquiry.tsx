import { useState } from "react";
import { Send } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

const schema = z.object({
  name: z.string().trim().min(1).max(100),
  phone: z.string().trim().min(6).max(30),
  location: z.string().trim().min(1).max(200),
  budget: z.string().trim().max(100).optional(),
  notes: z.string().trim().max(1000).optional(),
});

export function Inquiry() {
  const [state, setState] = useState<"idle" | "loading" | "ok" | "err">("idle");
  const [err, setErr] = useState("");

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setState("loading");
    setErr("");
    const fd = new FormData(e.currentTarget);
    const parsed = schema.safeParse(Object.fromEntries(fd));
    if (!parsed.success) {
      setErr(parsed.error.issues[0].message);
      setState("err");
      return;
    }
    const { error } = await supabase.from("inquiries").insert(parsed.data);
    if (error) {
      setErr("Could not submit. Please try again.");
      setState("err");
      return;
    }
    setState("ok");
    e.currentTarget.reset();
    if (typeof window !== "undefined" && window.fbq) window.fbq("track", "Lead");
    setTimeout(() => setState("idle"), 4000);
  };

  return (
    <section id="contact" className="bg-cream py-20 lg:py-28">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 lg:grid-cols-2 lg:px-8">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-gold">Custom Search</p>
          <h2 className="mt-3 font-display text-4xl text-balance sm:text-5xl">
            Looking for something specific? <span className="italic">We'll find it.</span>
          </h2>
          <p className="mt-4 text-muted-foreground">
            Tell us your budget, weight range and location. Our team will hand-pick the best match
            from our farm and send you photos and video within 24 hours.
          </p>
          <ul className="mt-8 space-y-4 border-l-2 border-gold/40 pl-6 text-sm text-muted-foreground">
            <li>
              <span className="font-medium text-foreground">No-obligation consultation</span> — we
              only sell when you're satisfied.
            </li>
            <li>
              <span className="font-medium text-foreground">Refundable deposit</span> — full refund
              if specs don't match.
            </li>
            <li>
              <span className="font-medium text-foreground">All over Bangladesh</span> — Dhaka,
              Chattogram, Sylhet & beyond.
            </li>
          </ul>
        </div>

        <form
          onSubmit={onSubmit}
          className="rounded-2xl border border-border bg-card p-6 shadow-card lg:p-8"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full Name" name="name" placeholder="Md. Karim" required />
            <Field label="Phone" name="phone" type="tel" placeholder="01XXXXXXXXX" required />
            <Field label="Location" name="location" placeholder="Dhaka, Banani" required />
            <Field label="Budget (BDT)" name="budget" placeholder="৳ 200,000" />
          </div>
          <label className="mt-4 block">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Notes
            </span>
            <textarea
              name="notes"
              rows={3}
              maxLength={1000}
              placeholder="Preferred breed, weight, color..."
              className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-3 outline-none ring-ring focus:ring-2"
            />
          </label>
          <button
            type="submit"
            disabled={state === "loading"}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-medium text-primary-foreground transition-transform hover:scale-[1.01] disabled:opacity-60"
          >
            <Send className="h-4 w-4" />
            {state === "loading"
              ? "Sending..."
              : state === "ok"
                ? "Sent — we'll call you shortly"
                : "Submit Inquiry"}
          </button>
          {state === "err" && <p className="mt-3 text-center text-xs text-destructive">{err}</p>}
          <p className="mt-3 text-center text-xs text-muted-foreground">
            By submitting, you agree to be contacted via WhatsApp or phone.
          </p>
        </form>
      </div>
    </section>
  );
}

function Field({
  label,
  name,
  type = "text",
  placeholder,
  required,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        required={required}
        maxLength={200}
        className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-3 outline-none ring-ring focus:ring-2"
      />
    </label>
  );
}
