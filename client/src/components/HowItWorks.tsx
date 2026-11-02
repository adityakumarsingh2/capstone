import { Camera, Ruler, Sparkles, Shirt, ArrowRight } from "lucide-react";

const features = [
  {
    icon: Camera,
    title: "Upload Your Photo",
    description: "Simply take or upload a full-body photo. Our AI needs just one image to understand your unique proportions.",
    step: "01",
  },
  {
    icon: Ruler,
    title: "AI Body Analysis",
    description: "Advanced machine learning algorithms analyze your body shape, measurements, and proportions in seconds.",
    step: "02",
  },
  {
    icon: Shirt,
    title: "Virtual Try-On",
    description: "See exactly how any outfit will look on you with photorealistic AI-generated previews.",
    step: "03",
  },
  {
    icon: Sparkles,
    title: "Perfect Recommendations",
    description: "Get personalized size suggestions and style recommendations tailored to your body and preferences.",
    step: "04",
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-20 md:py-32 bg-card">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 md:mb-20">
          <span className="text-accent font-medium text-sm uppercase tracking-wider">How It Works</span>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-medium mt-4 mb-6">
            Four Steps to Your Perfect Fit
          </h2>
          <p className="text-muted-foreground text-lg">
            Our revolutionary AI technology makes finding your perfect size and style effortless.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group relative"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Connection Line */}
              {index < features.length - 1 && (
                <div className="hidden lg:block absolute top-16 left-full w-full h-px bg-border z-0">
                  <ArrowRight className="absolute right-0 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              )}

              <div className="relative bg-background rounded-2xl p-8 shadow-elegant hover-lift h-full">
                {/* Step Number */}
                <span className="absolute top-4 right-4 font-display text-4xl font-bold text-muted/50">
                  {feature.step}
                </span>

                {/* Icon */}
                <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center mb-6 group-hover:bg-accent/20 transition-colors">
                  <feature.icon className="h-7 w-7 text-accent" />
                </div>

                {/* Content */}
                <h3 className="font-display text-xl font-medium mb-3">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
