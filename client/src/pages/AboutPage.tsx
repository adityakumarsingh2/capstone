import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  Ruler,
  ShieldCheck,
  Truck,
  HeartHandshake,
  Leaf,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

const pillars = [
  {
    icon: Sparkles,
    title: "AI Virtual Try-On",
    description:
      "Preview garments on your own proportions before placing an order, turning online browsing into a confident fitting-room experience.",
  },
  {
    icon: Ruler,
    title: "Measurement-Driven Fit",
    description:
      "Save your height, weight, and detailed body measurements once to receive tailored size recommendations across our catalog.",
  },
  {
    icon: ShieldCheck,
    title: "Curated Quality",
    description:
      "Every piece in our collection is selected for fabric durability, clean tailoring, and everyday versatility.",
  },
  {
    icon: Truck,
    title: "Transparent Fulfillment",
    description:
      "From order confirmation to doorstep arrival, follow every milestone in real time with clear status updates and easy order management.",
  },
];

const commitments = [
  {
    icon: HeartHandshake,
    title: "Customer-First Shopping",
    description:
      "Clear pricing, saved address management, and straightforward order cancellation before dispatch put you in complete control.",
  },
  {
    icon: Leaf,
    title: "Fewer Returns, Less Waste",
    description:
      "Better fit guidance before checkout means fewer sizing mismatches, fewer unnecessary return shipments, and a lighter environmental footprint.",
  },
];

const AboutPage = () => {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-20 md:pt-24">
        {/* Hero Section */}
        <section className="py-16 md:py-24 bg-gradient-subtle border-b border-border/60">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent font-medium text-xs uppercase tracking-wider mb-5">
                About FitKart
              </span>
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight mb-6">
                Fashion Built Around{" "}
                <span className="italic text-accent">Your Exact Fit</span>
              </h1>
              <p className="text-muted-foreground text-lg md:text-xl leading-relaxed">
                FitKart combines curated apparel, intelligent body-measurement guidance, and
                virtual try-on technology so you can shop online with certainty—and receive
                every order smoothly at your doorstep.
              </p>
            </div>
          </div>
        </section>

        {/* Purpose & Vision */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <div className="space-y-6">
                <span className="text-accent font-medium text-xs uppercase tracking-wider">
                  Our Purpose & Vision
                </span>
                <h2 className="font-display text-3xl md:text-4xl font-medium leading-tight">
                  Removing the Guesswork from Online Apparel Shopping
                </h2>
                <p className="text-muted-foreground text-base md:text-lg leading-relaxed">
                  Online shopping offers endless choice, yet sizing charts remain inconsistent
                  and hard to trust. FitKart was built to bridge that gap—giving shoppers
                  practical tools to visualize outfits and match garments to their real
                  measurements before they buy.
                </p>
                <p className="text-muted-foreground text-base md:text-lg leading-relaxed">
                  Our vision is a wardrobe experience where every order feels intentional:
                  clear fit insights, seamless checkout with saved preferences, and reliable
                  end-to-end delivery tracking.
                </p>

                <div className="grid sm:grid-cols-2 gap-3 pt-2">
                  {[
                    "Personalized size profiles",
                    "Interactive virtual try-on",
                    "Saved addresses & fast checkout",
                    "Real-time order milestone tracking",
                  ].map((point) => (
                    <div key={point} className="flex items-center gap-2.5 text-sm font-medium">
                      <CheckCircle2 className="h-4 w-4 text-accent shrink-0" />
                      <span>{point}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative">
                <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-card border border-border shadow-elegant">
                  <img
                    src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=900&auto=format&fit=crop"
                    alt="FitKart curated fashion studio"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="mt-4 sm:mt-0 sm:absolute sm:-bottom-6 sm:-left-6 bg-background border border-border rounded-xl shadow-elegant p-5 max-w-xs">
                  <p className="font-display text-2xl font-semibold text-accent mb-1">
                    Fit-First Design
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Every feature—from body measurement profiles to live order tracking—is
                    crafted for clarity and confidence.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Key Features & Benefits */}
        <section className="py-16 md:py-24 bg-card border-y border-border/60">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <span className="text-accent font-medium text-xs uppercase tracking-wider">
                Why FitKart
              </span>
              <h2 className="font-display text-3xl md:text-4xl font-medium mt-3 mb-4">
                Designed for Every Step of Your Journey
              </h2>
              <p className="text-muted-foreground">
                From discovering your next favorite outfit to managing deliveries from your
                profile dashboard.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {pillars.map((item) => (
                <div
                  key={item.title}
                  className="bg-background rounded-2xl p-7 border border-border/80 hover-lift flex flex-col"
                >
                  <div className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center mb-5">
                    <item.icon className="h-6 w-6 text-accent" />
                  </div>
                  <h3 className="font-display text-xl font-medium mb-2.5">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Customer Commitment */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="grid md:grid-cols-2 gap-8">
              {commitments.map((item) => (
                <div
                  key={item.title}
                  className="bg-card rounded-2xl p-8 border border-border flex items-start gap-5"
                >
                  <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                    <item.icon className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-display text-xl font-medium mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA Banner */}
            <div className="mt-14 rounded-2xl bg-card border border-border p-8 md:p-12 text-center">
              <h2 className="font-display text-2xl md:text-3xl font-medium mb-3">
                Ready to Experience Better-Fitting Fashion?
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto mb-7">
                Browse our latest collection, set up your body measurements in your profile, or
                test out the AI Virtual Try-On studio.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Button variant="gold" size="lg" asChild>
                  <Link to="/shop">
                    Explore Shop
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link to="/try-on">Launch Virtual Try-On</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </main>
  );
};

export default AboutPage;
