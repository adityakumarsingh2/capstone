import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-subtle" />
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-10 w-72 h-72 bg-accent/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 py-12 md:py-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Content */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 rounded-full text-accent text-sm font-medium mb-6 animate-fade-up">
              <Sparkles className="h-4 w-4" />
              <span>AI-Powered Fashion Revolution</span>
            </div>
            
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-medium leading-[1.1] mb-6 animate-fade-up" style={{ animationDelay: "0.1s" }}>
              See It On{" "}
              <span className="italic text-accent">You</span>
              <br />
              Before You Buy
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 mb-8 animate-fade-up" style={{ animationDelay: "0.2s" }}>
              Upload your photo and experience the future of online shopping. Our AI creates a realistic preview of how any outfit will look on you.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start animate-fade-up" style={{ animationDelay: "0.3s" }}>
              <Link to="/try-on">
                <Button variant="gold" size="xl" className="group">
                  Try It Free
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link to="/shop">
                <Button variant="hero-outline" size="xl">
                  Explore Collection
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="flex items-center justify-center lg:justify-start gap-8 mt-12 pt-8 border-t border-border animate-fade-up" style={{ animationDelay: "0.4s" }}>
              <div>
                <p className="font-display text-3xl md:text-4xl font-semibold">98%</p>
                <p className="text-sm text-muted-foreground">Size Accuracy</p>
              </div>
              <div className="w-px h-12 bg-border" />
              <div>
                <p className="font-display text-3xl md:text-4xl font-semibold">50K+</p>
                <p className="text-sm text-muted-foreground">Happy Customers</p>
              </div>
              <div className="w-px h-12 bg-border" />
              <div>
                <p className="font-display text-3xl md:text-4xl font-semibold">70%</p>
                <p className="text-sm text-muted-foreground">Less Returns</p>
              </div>
            </div>
          </div>

          {/* Hero Visual */}
          <div className="relative animate-fade-up" style={{ animationDelay: "0.2s" }}>
            <div className="relative aspect-[4/5] max-w-md mx-auto">
              {/* Main Image Frame */}
              <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-transparent rounded-3xl transform rotate-3" />
              <div className="absolute inset-0 bg-card rounded-3xl shadow-elegant overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/10 to-transparent" />
                <img
                  src="https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=800&auto=format&fit=crop"
                  alt="Fashion model showcasing virtual try-on"
                  className="w-full h-full object-cover"
                />
                
                {/* Overlay UI Elements */}
                <div className="absolute bottom-4 left-4 right-4 bg-background/90 backdrop-blur-sm rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
                      <Sparkles className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Perfect Fit Detected</p>
                      <p className="text-xs text-muted-foreground">Size M recommended • 98% match</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 bg-background rounded-xl shadow-elegant p-3 animate-float">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium">AI Analysis Complete</span>
                </div>
              </div>

              <div className="absolute -bottom-4 -left-4 bg-background rounded-xl shadow-elegant p-3 animate-float" style={{ animationDelay: "0.5s" }}>
                <p className="text-xs text-muted-foreground mb-1">Body measurements</p>
                <p className="text-sm font-medium">Analyzed in 2.3s</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
