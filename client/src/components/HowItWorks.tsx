import { Link } from "react-router-dom";
import {
  Search,
  Sparkles,
  ShoppingBag,
  Truck,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const steps = [
  {
    step: "01",
    icon: Search,
    title: "Browse & Pick Your Style",
    subtitle: "Discover curated collections",
    description:
      "Explore apparel by category, price, and size. Filter effortlessly to find pieces that match your everyday wardrobe or special occasions.",
    highlights: ["Smart category & size filters", "Detailed product & fabric views"],
  },
  {
    step: "02",
    icon: Sparkles,
    title: "Check Your Fit & Try On",
    subtitle: "Confidence before you buy",
    description:
      "Use your saved body measurements for instant size guidance and preview outfits with our AI Virtual Try-On before adding to your bag.",
    highlights: ["Personalized size recommendations", "Realistic virtual outfit previews"],
  },
  {
    step: "03",
    icon: ShoppingBag,
    title: "Place Your Order",
    subtitle: "Fast, transparent checkout",
    description:
      "Review your bag, select a saved delivery address, and confirm your order in just a few clicks with clear pricing and instant confirmation.",
    highlights: ["Saved address book support", "Instant order confirmation"],
  },
  {
    step: "04",
    icon: Truck,
    title: "Track to Your Doorstep",
    subtitle: "Live order milestones",
    description:
      "Follow every stage from packing and dispatch to out-for-delivery in your profile dashboard, with easy cancellation before shipment.",
    highlights: ["Step-by-step live tracking", "Hassle-free order management"],
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-20 md:py-28 bg-card border-y border-border/60">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 md:mb-20">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent font-medium text-xs uppercase tracking-wider">
            How It Works
          </span>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-medium mt-4 mb-5">
            From Discovery to Doorstep in Four Simple Steps
          </h2>
          <p className="text-muted-foreground text-base md:text-lg leading-relaxed">
            Shopping online shouldn’t feel like guesswork. FitKart guides you from finding the
            right style and verifying your fit to tracking your delivery in real time.
          </p>
        </div>

        {/* Sequential Steps Grid */}
        <div className="relative grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {/* Desktop horizontal connector */}
          <div
            aria-hidden="true"
            className="hidden lg:block absolute top-14 left-[12%] right-[12%] h-px bg-gradient-to-r from-border via-accent/40 to-border z-0"
          />

          {steps.map((item) => (
            <div key={item.step} className="group relative z-10 flex flex-col">
              <div className="relative bg-background rounded-2xl p-7 border border-border/80 shadow-elegant hover-lift h-full flex flex-col">
                {/* Top Row: Icon + Step Pill */}
                <div className="flex items-center justify-between mb-6">
                  <div className="w-13 h-13 p-3.5 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center group-hover:bg-accent group-hover:text-accent-foreground transition-colors duration-300">
                    <item.icon className="h-6 w-6 text-accent group-hover:text-accent-foreground transition-colors duration-300" />
                  </div>
                  <span className="font-display text-2xl font-semibold text-muted-foreground/40 group-hover:text-accent/70 transition-colors">
                    {item.step}
                  </span>
                </div>

                {/* Content */}
                <p className="text-xs font-medium uppercase tracking-wider text-accent mb-1">
                  {item.subtitle}
                </p>
                <h3 className="font-display text-xl font-medium mb-3">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-5 flex-1">
                  {item.description}
                </p>

                {/* Step Highlights */}
                <ul className="space-y-2 pt-4 border-t border-border/70">
                  {item.highlights.map((highlight) => (
                    <li
                      key={highlight}
                      className="flex items-center gap-2 text-xs text-muted-foreground"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 text-accent shrink-0" />
                      <span>{highlight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-14 text-center flex flex-wrap items-center justify-center gap-4">
          <Button variant="gold" size="lg" asChild>
            <Link to="/shop">
              Start Browsing
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link to="/try-on">Try Virtual Try-On</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
