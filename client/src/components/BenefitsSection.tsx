import { TrendingDown, Truck, Leaf, RotateCcw, Shield, Users } from "lucide-react";

const benefits = [
  {
    icon: TrendingDown,
    title: "70% Fewer Returns",
    description: "Accurate virtual try-on means customers get it right the first time.",
    stat: "70%",
  },
  {
    icon: Truck,
    title: "Reduced Logistics Costs",
    description: "Less returns mean fewer delivery trips and lower operational costs.",
    stat: "45%",
  },
  {
    icon: Leaf,
    title: "Eco-Friendly Shopping",
    description: "Reduced shipping and returns means a smaller carbon footprint.",
    stat: "60%",
  },
  {
    icon: Shield,
    title: "Size Guarantee",
    description: "Our AI-powered sizing is so accurate, we guarantee the fit.",
    stat: "98%",
  },
  {
    icon: Users,
    title: "Inclusive Fashion",
    description: "Works for all body types, sizes, genders, and age groups.",
    stat: "All",
  },
  {
    icon: RotateCcw,
    title: "Hassle-Free Experience",
    description: "No more ordering multiple sizes or dealing with complex returns.",
    stat: "100%",
  },
];

const BenefitsSection = () => {
  return (
    <section className="py-20 md:py-32 bg-primary text-primary-foreground overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 md:mb-20">
          <span className="text-accent font-medium text-sm uppercase tracking-wider">Why Choose Us</span>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-medium mt-4 mb-6">
            Benefits That Matter
          </h2>
          <p className="text-primary-foreground/70 text-lg">
            From customers to businesses to the environment – everyone wins with AI-powered fashion.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <div
              key={benefit.title}
              className="group relative bg-primary-foreground/5 rounded-2xl p-8 border border-primary-foreground/10 hover:border-accent/50 transition-all duration-300"
            >
              {/* Stat */}
              <div className="absolute top-6 right-6">
                <span className="font-display text-4xl font-bold text-accent/80">
                  {benefit.stat}
                </span>
              </div>

              {/* Icon */}
              <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <benefit.icon className="h-6 w-6 text-accent" />
              </div>

              {/* Content */}
              <h3 className="font-display text-xl font-medium mb-3">
                {benefit.title}
              </h3>
              <p className="text-primary-foreground/70">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
