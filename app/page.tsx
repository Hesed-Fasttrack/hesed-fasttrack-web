import { CtaSection } from "./_components/cta-section";
import { Footer } from "./_components/footer";
import { Header } from "./_components/header";
import { Hero } from "./_components/hero";
import { HowItWorksSection } from "./_components/how-it-works-section";
import { ServicesSection } from "./_components/services-section";
import { WhySection } from "./_components/why-section";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <Hero />
        <ServicesSection />
        <HowItWorksSection />
        <WhySection />
        <CtaSection />
      </main>
      <Footer />
    </div>
  );
}
