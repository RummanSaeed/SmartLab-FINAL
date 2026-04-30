import { HeroSection } from "@/components/hero-section";
import { StatsSection } from "@/components/stats-section";
import { CapabilitiesSection } from "@/components/capabilities-section";
import { PartnersSection } from "@/components/partners-section";
import { ExperienceSection } from "@/components/experience-section";
import { RoadmapSection } from "@/components/roadmap-section";
import { ShowcaseSection } from "@/components/showcase-section";
import { CTASection } from "@/components/cta-section";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/navbar";

export default function Home() {
  return (
    <main className="min-h-screen bg-background overflow-x-hidden">
      <Navbar />
      <HeroSection />
      <StatsSection />
      <CapabilitiesSection />
      <PartnersSection />
      <ExperienceSection />
      <RoadmapSection />
      <ShowcaseSection />
      <CTASection />
      <Footer />
    </main>
  );
}