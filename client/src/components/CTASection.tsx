import { ArrowRight, Sparkles, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const CTASection = () => {
  return (
    <section className="py-20 md:py-28 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-accent/3 to-background" />

      {/* Decorative orbs */}
      <div className="absolute top-0 right-0 w-1/2 h-full overflow-hidden pointer-events-none">
        <div className="absolute top-12 right-16 w-80 h-80 bg-accent/20 rounded-full blur-[90px]" />
        <div className="absolute bottom-12 right-40 w-64 h-64 bg-accent/12 rounded-full blur-[70px]" />
      </div>

      <div className="absolute -bottom-10 -left-20 w-72 h-72 bg-accent/8 rounded-full blur-[80px] pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-accent/10 border border-accent/20 rounded-full text-accent text-xs font-semibold uppercase tracking-widest mb-7">
            <Sparkles className="w-3.5 h-3.5" />
            Get Started Today — It's Free
          </div>

          <h2 className="font-display text-4xl sm:text-5xl md:text-6xl font-medium leading-[1.08] mb-6">
            Ready to Transform Your
            <br />
            <span className="italic text-accent">Shopping Experience?</span>
          </h2>
          <p className="text-muted-foreground text-base md:text-lg max-w-xl mx-auto mb-10 leading-relaxed">
            Join thousands of happy customers who never worry about sizing again.
            Start your AI-powered fashion journey today — no credit card required.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/try-on">
              <Button variant="gold" size="xl" className="group shadow-gold gap-2">
                <Sparkles className="h-4 w-4" />
                Try Virtual Try-On
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link to="/stylist">
              <Button
                variant="outline"
                size="xl"
                className="gap-2 hover:border-accent/50 hover:bg-accent/5"
              >
                <Wand2 className="h-4 w-4 text-accent" />
                AI Personal Stylist
              </Button>
            </Link>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap items-center justify-center gap-6 mt-10 pt-8 border-t border-border/50">
            {[
              "No credit card required",
              "Free size guarantee",
              "Privacy protected",
              "Instant access",
            ].map((trust) => (
              <div key={trust} className="flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-xs text-muted-foreground font-medium">{trust}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
