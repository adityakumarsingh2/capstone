import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import HowItWorks from "@/components/HowItWorks";
import FeaturedProducts from "@/components/FeaturedProducts";
import VirtualTryOn from "@/components/VirtualTryOn";
import BenefitsSection from "@/components/BenefitsSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <main className="min-h-screen">
      <Navbar />
      <HeroSection />
      <HowItWorks />
      <FeaturedProducts />
      <VirtualTryOn />
      <BenefitsSection />
      <CTASection />
      <Footer />
    </main>
  );
};

export default Index;
