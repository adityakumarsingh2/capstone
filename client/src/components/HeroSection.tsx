import { ArrowRight, Sparkles, Wand2, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Rich layered background */}
      <div className="absolute inset-0 bg-gradient-hero" />

      {/* Decorative orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-[600px] h-[600px] bg-accent/8 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 -left-48 w-[500px] h-[500px] bg-accent/6 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-primary/4 rounded-full blur-[90px]" />
      </div>

      {/* Subtle grid texture */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            "linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }}
      />

      <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
        <div className="grid lg:grid-cols-2 gap-14 lg:gap-20 items-center">
          {/* ── Left: Content ── */}
          <div className="text-center lg:text-left">
            {/* Badge pill */}
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 bg-accent/10 border border-accent/20 rounded-full text-accent text-xs font-semibold uppercase tracking-widest mb-7 animate-fade-up"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>AI-Powered Fashion Platform</span>
            </div>

            {/* Headline */}
            <h1
              className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-[80px] font-medium leading-[1.04] mb-6 animate-fade-up"
              style={{ animationDelay: "0.08s" }}
            >
              See It On{" "}
              <span className="italic text-accent">You</span>
              <br />
              <span className="text-gradient-muted">Before You Buy</span>
            </h1>

            <p
              className="text-base md:text-lg text-muted-foreground max-w-lg mx-auto lg:mx-0 mb-9 leading-relaxed animate-fade-up"
              style={{ animationDelay: "0.16s" }}
            >
              Upload your photo and experience the future of online shopping. Our AI creates a realistic preview of exactly how any outfit will look on you — with size-matched precision.
            </p>

            {/* CTAs */}
            <div
              className="flex flex-col sm:flex-row items-center gap-3 justify-center lg:justify-start animate-fade-up"
              style={{ animationDelay: "0.24s" }}
            >
              <Link to="/try-on">
                <Button variant="gold" size="xl" className="group shadow-gold">
                  <Sparkles className="h-4 w-4" />
                  Try It Free
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link to="/stylist">
                <Button
                  variant="outline"
                  size="xl"
                  className="border-border/70 hover:border-accent/50 hover:bg-accent/5 gap-2"
                >
                  <Wand2 className="h-4 w-4 text-accent" />
                  AI Stylist
                </Button>
              </Link>
              <Link to="/shop">
                <Button variant="ghost" size="xl" className="text-muted-foreground hover:text-foreground gap-1">
                  <ShoppingBag className="h-4 w-4" />
                  Explore
                </Button>
              </Link>
            </div>

            {/* Stats row */}
            <div
              className="flex items-center justify-center lg:justify-start gap-6 mt-12 pt-8 border-t border-border/60 animate-fade-up"
              style={{ animationDelay: "0.34s" }}
            >
              {[
                { value: "98%", label: "Size Accuracy" },
                { value: "50K+", label: "Happy Shoppers" },
                { value: "70%", label: "Fewer Returns" },
              ].map((stat, i) => (
                <div key={stat.label} className="flex items-stretch gap-6">
                  {i > 0 && <div className="w-px bg-border/80 self-stretch" />}
                  <div>
                    <p className="font-display text-3xl font-semibold text-gradient-gold leading-none mb-1">
                      {stat.value}
                    </p>
                    <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right: Visual ── */}
          <div className="relative animate-fade-up" style={{ animationDelay: "0.18s" }}>
            {/* Decorative frame */}
            <div className="relative aspect-[3/4] max-w-sm mx-auto">
              <div className="absolute -inset-3 bg-gradient-gold rounded-[2.5rem] opacity-15 blur-xl" />
              <div className="absolute inset-0 bg-gradient-to-br from-accent/15 to-transparent rounded-[2rem] transform rotate-2" />

              {/* Main image card */}
              <div className="relative h-full bg-card rounded-[2rem] shadow-lg overflow-hidden border border-border/40">
                <img
                  src="https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=900&auto=format&fit=crop"
                  alt="Fashion model showcasing virtual try-on"
                  className="w-full h-full object-cover object-top"
                />
                {/* Bottom overlay UI */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-5 pt-12">
                  <div className="glass-dark rounded-xl p-3.5 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center shrink-0">
                      <Sparkles className="h-4.5 w-4.5 text-accent-foreground" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-white">Perfect Fit Detected</p>
                      <p className="text-xs text-white/70">Size M recommended · 98% match</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating badge: AI Analysis */}
              <div
                className="absolute -top-5 -right-5 glass rounded-2xl shadow-elegant px-3.5 py-2.5 flex items-center gap-2 animate-float"
              >
                <div className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                  <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-xs font-semibold">AI Analysis Complete</span>
              </div>

              {/* Floating badge: Measurements */}
              <div
                className="absolute -bottom-5 -left-5 glass rounded-2xl shadow-elegant px-3.5 py-2.5 animate-float"
                style={{ animationDelay: "0.6s" }}
              >
                <p className="text-[11px] text-muted-foreground mb-0.5 font-medium">Body measurements</p>
                <p className="text-sm font-bold">Analysed in 2.3 s</p>
              </div>

              {/* Floating badge: Stylist */}
              <div
                className="absolute top-1/3 -left-8 glass rounded-2xl shadow-elegant px-3 py-2 animate-float"
                style={{ animationDelay: "1.1s" }}
              >
                <div className="flex items-center gap-1.5">
                  <Wand2 className="w-3.5 h-3.5 text-accent" />
                  <span className="text-xs font-semibold">AI Stylist</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
