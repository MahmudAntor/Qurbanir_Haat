import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Hero } from "@/components/site/Hero";
import { Catalog } from "@/components/site/Catalog";
import { HowItWorks } from "@/components/site/HowItWorks";
import { YieldCalculator } from "@/components/site/YieldCalculator";
import { FloatingWhatsApp, Footer } from "@/components/site/Footer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      {
        title: "Qurbanir Haat - Premium Qurbani Cattle, Hand-picked & Delivered",
      },
      {
        name: "description",
        content:
          "Hand-picked, vet-certified Qurbani cattle for Eid-ul-Adha. 60+ healthy bulls with full transparency, video previews and doorstep delivery across Bangladesh.",
      },
      {
        property: "og:title",
        content: "Qurbanir Haat - Premium Qurbani Cattle",
      },
      {
        property: "og:description",
        content: "Vet-certified bulls, transparent stats, doorstep delivery.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <Hero />
      <Catalog />
      <HowItWorks />
      <YieldCalculator />
      <Footer />
      <FloatingWhatsApp />
    </main>
  );
}
