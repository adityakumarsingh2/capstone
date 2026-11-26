import {
  TrendingDown, Truck, Leaf, RotateCcw, Shield, Users, ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const benefits = [
  {
    icon: TrendingDown,
    title: "70% Fewer Returns",
    description: "Accurate virtual try-on means customers get it right the first time, every time.",
    stat: "70%",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
  {
    icon: Truck,
    title: "Reduced Logistics",
    description: "Fewer returns mean fewer delivery trips and significantly lower operational costs.",
    stat: "45%",
    color: "text-blue-400",
    bg: "bg-blue-400/10",
  },
  {
    icon: Leaf,
    title: "Eco-Friendly Shopping",
    description: "Less shipping and returns means a measurably smaller carbon footprint.",
    stat: "60%",
    color: "text-green-400",
    bg: "bg-green-400/10",
  },
  {
    icon: Shield,
    title: "Size Guarantee",
    description: "Our AI-powered sizing is so accurate, we stand behind every recommendation.",
    stat: "98%",
    color: "text-accent",
    bg: "bg-accent/10",
  },
  {
    icon: Users,
    title: "Inclusive Fashion",
    description: "Works for every body type, size, gender, and age group without compromise.",
    stat: "All",
    color: "text-purple-400",
    bg: "bg-purple-400/10",
  },
  {
    icon: RotateCcw,
    title: "Hassle-Free",
    description: "No more ordering multiple sizes or dealing with tedious return processes.",
    stat: "100%",
    color: "text-orange-400",
    bg: "bg-orange-400/10",
  },
];

const BenefitsSection = () => {
  return (
    <section className="py-20 md:py-28 bg-primary text-primary-foreground overflow-hidden relative">
      {/* Decorative orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-accent/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/8 rounded-full blur-[100px]" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14 md:mb-18">
          <div className="flex items-center justify-center gap-2.5 mb-3">
            <div className="section-divider" />
            <span className="text-accent font-semibold text-xs uppercase tracking-widest">
              Why Choose Us
            </span>
            <div className="section-divider" />
          </div>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-medium mt-3 mb-5 leading-tight">
            Benefits That Matter to Everyone
          </h2>
          <p className="text-primary-foreground/65 text-base md:text-lg leading-relaxed">
            From shoppers to businesses to the environment — everyone benefits from AI-powered fashion.
          </p>
        </div>

        {/* Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {benefits.map((benefit) => (
            <div
              key={benefit.title}
              className="group relative bg-primary-foreground/5 hover:bg-primary-foreground/9 rounded-2xl p-7 border border-primary-foreground/8 hover:border-accent/35 transition-all duration-300"
            >
              {/* Stat */}
              <div className="absolute top-6 right-6">
                <span className={`font-display text-4xl font-bold ${benefit.color} opacity-80`}>
                  {benefit.stat}
                </span>
              </div>

              {/* Icon */}
              <div
                className={`w-11 h-11 rounded-xl ${benefit.bg} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}
              >
                <benefit.icon className={`h-5 w-5 ${benefit.color}`} />
              </div>

              {/* Content */}
              <h3 className="font-display text-lg font-semibold mb-2.5">{benefit.title}</h3>
              <p className="text-primary-foreground/60 text-sm leading-relaxed">{benefit.description}</p>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-14 text-center">
          <Link to="/shop">
            <Button
              variant="gold"
              size="lg"
              className="gap-2 shadow-gold group"
            >
              Start Shopping Now
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
