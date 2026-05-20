import { createFileRoute } from "@tanstack/react-router";
import logoSrc from "@/logo.jpg";
import { Header } from "@/components/site/Header";
import { FloatingWhatsApp, Footer } from "@/components/site/Footer";

const introParagraphs = [
  "Every year, millions of Bangladeshi families go through the same exhausting ritual. Weeks before Eid ul Adha, fathers and sons wake up at dawn, travel through chaotic traffic, wade through muddy, overcrowded cattle markets under the scorching heat, and spend hours — sometimes entire days — trying to find the right cow at the right price.",
  "They negotiate with sellers they do not know, inspect animals they cannot properly evaluate, and make one of the most significant purchases of the year under enormous pressure, with no system, no transparency, and no protection if something goes wrong.",
  "They get overcharged. They get misled. They bring home animals that do not match what was promised. And they do it again the following year, because there was simply no other way. Until now.",
];

const founders = [
  {
    name: "Nafis",
    school: "Islamic University of Technology (IUT)",
    text: "saw firsthand how the lack of a trusted platform forced buyers into uninformed decisions during one of the most meaningful religious occasions of the year.",
  },
  {
    name: "Tahmid",
    school: "North South University (NSU)",
    text: "brought a sharp understanding of how digital platforms could bridge the gap between buyers and sellers in a way that builds trust on both sides.",
  },
  {
    name: "Riyashat",
    school: "BRAC University",
    text: "recognized that the problem was fundamentally one of access and information for both genuine buyers and genuine sellers.",
  },
];

const articleSections = [
  {
    title: "The Problem We Could Not Ignore",
    paragraphs: [
      "The traditional Qurbani cattle market in Bangladesh is a broken system. Not because the sellers are bad people, and not because the buyers are careless. It is broken because it has never been properly organized.",
      "There is no standardized pricing. There is no verification of animal health or weight. There is no accountability when a transaction goes wrong. Everything depends on personal judgment in a high-pressure, high-noise environment where the odds are heavily stacked against the buyer.",
      "The consequences are real. Families overpay by tens of thousands of taka for animals that do not match what the seller claimed. People travel hours only to find nothing suitable within their budget. Elderly buyers, who cannot physically manage the demands of a crowded haat, are forced to depend entirely on others or simply accept whatever they can find closest to home.",
      "In a country that is rapidly digitizing — where people book flights, order food, transfer money, and run entire businesses from their smartphones — the Qurbani cattle market remained completely untouched by technology. That gap bothered us deeply.",
    ],
  },
  {
    title: "What Qurbanir Haat Is",
    paragraphs: [
      "Qurbanir Haat — কোরবানির হাট — is Bangladesh's first digital Qurbani cattle marketplace. We are a platform that connects verified cow sellers directly to buyers across the country, making it possible for any family to find, evaluate, and purchase their Qurbani cow entirely from the comfort of their home.",
      "No travel. No crowds. No chaos. No compromise.",
      "Here is how it works. Sellers list their cattle on our platform with detailed information — photographs, weight, breed, age, health status, and price. Buyers browse these listings, compare options, ask questions, and make their selection.",
      "Our team facilitates the connection and ensures that every transaction is handled with transparency and accountability. From browsing to purchase, the entire experience is designed to be smooth, clear, and trustworthy.",
      "We are not just a listing platform. We are the layer of trust and management that the traditional cattle market has always lacked.",
    ],
  },
  {
    title: "Why This Matters Beyond Convenience",
    paragraphs: [
      "Qurbani is not a shopping transaction. It is an act of worship. It carries deep religious significance for every Muslim family that observes it, and it deserves to be approached with the seriousness and dignity it demands.",
      "When a family is scrambling through a hot, chaotic haat, getting pressured by sellers, second-guessing every decision, and worrying about being scammed — they cannot approach Qurbani the way it should be approached. The process undermines the experience entirely.",
      "Qurbanir Haat exists to restore that dignity. When you are not stressed about logistics, when you are not second-guessing whether you are being misled, when you can take your time, compare your options, and make a decision you feel genuinely good about — you can focus on what actually matters.",
      "The religious act itself. The family gathering. The intention behind it.",
      "That is what we are building toward. Not just a marketplace. A better Eid experience.",
    ],
  },
  {
    title: "Our Small Step Toward a Smarter Bangladesh",
    paragraphs: [
      "Bangladesh is in the middle of a historic transformation. The vision of a Smart Bangladesh — a nation powered by technology, driven by innovation, and built on digital infrastructure — is no longer a distant aspiration. It is actively being realized, sector by sector, year by year.",
      "Digital financial services, e-governance, telemedicine, online education — one by one, the pillars of daily Bangladeshi life are being reimagined for the digital age.",
      "But transformation does not happen all at once. It happens one problem at a time, solved by people who refuse to accept that the old way is the only way.",
      "Qurbanir Haat is our contribution to that transformation — small in scale, but meaningful in direction. The Qurbani cattle market is one of the largest annual economic events in Bangladesh. It touches nearly every Muslim household in the country. It moves billions of taka every Eid season. And yet, until now, it operated entirely outside the digital ecosystem — unorganized, unaccountable, and inefficient.",
      "By building Bangladesh's first digital cattle marketplace, we are not just solving an inconvenience. We are demonstrating that even the most traditional, deeply rooted corners of our economy can be organized, digitized, and made to work better for everyone.",
      "We are proving that the spirit of Smart Bangladesh is not limited to corporations or government initiatives — it lives in the ambition of young people who see a broken system and choose to fix it.",
      "This is our small step. But every transformation begins with one.",
    ],
  },
  {
    title: "Our Commitment to You",
    paragraphs: [
      "Whether you are a buyer looking for the perfect cow for your family's Qurbani, or a seller who wants a reliable platform to reach genuine buyers, Qurbanir Haat is built for you.",
      "We commit to transparency in every listing. We commit to accountability in every transaction. We commit to treating every interaction with the respect that the occasion of Eid ul Adha deserves.",
      "Our tagline is simple: No Haat. No Hassle. No Compromise.",
      "We mean every word of it. And we are just getting started.",
    ],
  },
];

export const Route = createFileRoute("/about-us")({
  head: () => ({
    meta: [
      { title: "About Us - Qurbanir Haat" },
      {
        name: "description",
        content:
          "Learn why Qurbanir Haat was built: to bring transparency, trust, and dignity to Bangladesh's Qurbani cattle market.",
      },
      { property: "og:title", content: "About Qurbanir Haat" },
      {
        property: "og:description",
        content:
          "Qurbanir Haat is Bangladesh's first digital Qurbani cattle marketplace, built to replace chaos with trust.",
      },
    ],
  }),
  component: AboutUs,
});

function AboutUs() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <section className="bg-cream px-5 pb-16 pt-32 lg:px-8 lg:pb-24">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.9fr_1.4fr] lg:items-center">
          <div className="overflow-hidden rounded-2xl border border-border bg-background p-8 shadow-card">
            <img src={logoSrc} alt="Qurbanir Haat logo" className="mx-auto w-full max-w-sm" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-gold">About Us</p>
            <h1 className="mt-3 font-display text-5xl leading-tight text-balance sm:text-6xl">
              We did not build this because it was easy.
            </h1>
            <p className="mt-5 max-w-2xl text-lg text-muted-foreground">
              We built it because it was necessary.
            </p>
          </div>
        </div>
      </section>

      <article className="mx-auto max-w-4xl px-5 py-16 lg:px-8 lg:py-24">
        <div className="border-l-4 border-gold pl-6">
          <p className="text-xs uppercase tracking-[0.2em] text-gold">Our starting point</p>
          <h2 className="mt-3 font-display text-3xl text-balance sm:text-4xl">
            The yearly search for a Qurbani cow should not feel like a gamble.
          </h2>
        </div>

        <div className="mt-10 space-y-6 text-base leading-8 text-muted-foreground">
          {introParagraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>

        <section className="mt-16 border-y border-border py-12">
          <p className="text-xs uppercase tracking-[0.2em] text-gold">Who We Are</p>
          <h2 className="mt-3 font-display text-3xl text-balance sm:text-4xl">
            Three students who refused to accept the old way.
          </h2>
          <p className="mt-6 text-base leading-8 text-muted-foreground">
            Qurbanir Haat was founded by three university students who grew up in Bangladesh, saw
            their own families navigate the madness of the cattle market every year, and decided to
            do something about it.
          </p>

          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {founders.map((founder) => (
              <div key={founder.name} className="border-t border-border pt-5">
                <h3 className="font-display text-2xl">{founder.name}</h3>
                <p className="mt-1 text-xs uppercase tracking-wider text-gold">{founder.school}</p>
                <p className="mt-4 text-sm leading-7 text-muted-foreground">
                  {founder.name} {founder.text}
                </p>
              </div>
            ))}
          </div>

          <p className="mt-8 text-base leading-8 text-muted-foreground">
            We are not corporate executives. We are not a faceless tech company. We are three
            students who decided to build the platform our own families needed.
          </p>
        </section>

        <div className="mt-16 space-y-16">
          {articleSections.map((section) => (
            <section key={section.title}>
              <h2 className="font-display text-3xl text-balance sm:text-4xl">{section.title}</h2>
              <div className="mt-6 space-y-6 text-base leading-8 text-muted-foreground">
                {section.paragraphs.map((paragraph) => (
                  <p
                    key={paragraph}
                    className={
                      paragraph === "No travel. No crowds. No chaos. No compromise." ||
                      paragraph === "Our tagline is simple: No Haat. No Hassle. No Compromise."
                        ? "font-display text-2xl leading-snug text-foreground"
                        : undefined
                    }
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </article>

      <Footer />
      <FloatingWhatsApp />
    </main>
  );
}
