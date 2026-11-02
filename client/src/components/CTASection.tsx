import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const CTASection = () => {
  return (
    <section className="py-20 md:py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-background to-accent/10" />
      <div className="absolute top-0 right-0 w-1/2 h-full opacity-30">
        <div className="absolute top-20 right-20 w-72 h-72 bg-accent/30 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-40 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-medium leading-tight mb-6">
            Ready to Transform Your
            <br />
            <span className="italic text-accent">Shopping Experience?</span>
          </h2>
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto mb-10">
            Join thousands of happy customers who never worry about sizing again. 
            Start your AI-powered fashion journey today.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/try-on">
              <Button variant="gold" size="xl" className="group">
                Start Free Trial
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link to="/shop">
              <Button variant="hero-outline" size="xl">
                Explore Collection
              </Button>
            </Link>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap items-center justify-center gap-8 mt-12 pt-8 border-t border-border">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-sm text-muted-foreground">No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-sm text-muted-foreground">Free size guarantee</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-sm text-muted-foreground">Privacy protected</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
