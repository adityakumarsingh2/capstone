import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Sparkles, Target, Users, Leaf } from "lucide-react";

const AboutPage = () => {
  return (
    <main className="min-h-screen">
      <Navbar />
      
      <div className="pt-24 md:pt-28">
        {/* Hero */}
        <section className="py-16 md:py-24 bg-gradient-subtle">
          <div className="container mx-auto px-4 text-center">
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-medium mb-6">
              Redefining How the World
              <br />
              <span className="italic text-accent">Shops for Fashion</span>
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl max-w-3xl mx-auto">
              We believe everyone deserves to feel confident in their clothing choices. 
              Our AI technology makes that possible by eliminating the guesswork from online shopping.
            </p>
          </div>
        </section>

        {/* Mission */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              <div>
                <span className="text-accent font-medium text-sm uppercase tracking-wider">Our Mission</span>
                <h2 className="font-display text-3xl md:text-4xl font-medium mt-4 mb-6">
                  Making Perfect Fit Accessible to Everyone
                </h2>
                <p className="text-muted-foreground text-lg mb-6">
                  Founded in 2024, Outfit AI emerged from a simple frustration: why is it so hard to 
                  find clothes that fit when shopping online? We set out to solve this problem using 
                  cutting-edge artificial intelligence.
                </p>
                <p className="text-muted-foreground text-lg">
                  Our technology analyzes body measurements from a single photo and creates realistic 
                  virtual try-ons, helping shoppers see exactly how clothes will look before they buy. 
                  This isn't just convenient—it's revolutionary.
                </p>
              </div>
              <div className="relative">
                <div className="aspect-square rounded-2xl overflow-hidden bg-card">
                  <img
                    src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&auto=format&fit=crop"
                    alt="Fashion studio"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-6 -left-6 bg-background rounded-xl shadow-elegant p-6 max-w-xs">
                  <p className="font-display text-4xl font-bold text-accent mb-2">70%</p>
                  <p className="text-muted-foreground">Reduction in return rates for our partner brands</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-16 md:py-24 bg-card">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-accent font-medium text-sm uppercase tracking-wider">Our Values</span>
              <h2 className="font-display text-3xl md:text-4xl font-medium mt-4 mb-6">
                What Drives Us Forward
              </h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  icon: Sparkles,
                  title: "Innovation First",
                  description: "We push the boundaries of what's possible with AI and fashion technology.",
                },
                {
                  icon: Users,
                  title: "Inclusive by Design",
                  description: "Our technology works for all body types, sizes, ages, and genders.",
                },
                {
                  icon: Target,
                  title: "Accuracy Obsessed",
                  description: "We won't rest until our size predictions are 100% accurate.",
                },
                {
                  icon: Leaf,
                  title: "Sustainability Focused",
                  description: "By reducing returns, we're helping reduce fashion's environmental impact.",
                },
              ].map((value) => (
                <div key={value.title} className="bg-background rounded-xl p-8 hover-lift">
                  <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-6">
                    <value.icon className="h-6 w-6 text-accent" />
                  </div>
                  <h3 className="font-display text-xl font-medium mb-3">{value.title}</h3>
                  <p className="text-muted-foreground">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-accent font-medium text-sm uppercase tracking-wider">Our Team</span>
              <h2 className="font-display text-3xl md:text-4xl font-medium mt-4 mb-6">
                The Minds Behind the Magic
              </h2>
              <p className="text-muted-foreground text-lg">
                A diverse team of AI researchers, fashion experts, and engineers united by 
                a passion for solving real problems.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {[
                {
                  name: "Sarah Chen",
                  role: "CEO & Co-Founder",
                  image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop",
                },
                {
                  name: "Marcus Johnson",
                  role: "CTO & Co-Founder",
                  image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop",
                },
                {
                  name: "Elena Rodriguez",
                  role: "Head of AI",
                  image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop",
                },
              ].map((member) => (
                <div key={member.name} className="text-center group">
                  <div className="aspect-square rounded-2xl overflow-hidden mb-4 bg-muted">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <h3 className="font-display text-xl font-medium">{member.name}</h3>
                  <p className="text-muted-foreground">{member.role}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </main>
  );
};

export default AboutPage;
