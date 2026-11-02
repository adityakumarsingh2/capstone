import { Link } from "react-router-dom";
import { Sparkles, Instagram, Twitter, Facebook, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

const Footer = () => {
  const footerLinks = {
    Shop: ["Women", "Men", "New Arrivals", "Sale", "Collections"],
    Company: ["About Us", "Careers", "Press", "Sustainability"],
    Support: ["Help Center", "Size Guide", "Shipping", "Returns"],
    Legal: ["Privacy Policy", "Terms of Service", "Cookie Policy"],
  };

  return (
    <footer className="bg-primary text-primary-foreground">
      {/* Newsletter Section */}
      <div className="border-b border-primary-foreground/10">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <div className="max-w-xl mx-auto text-center">
            <h3 className="font-display text-2xl md:text-3xl mb-4">
              Join the Fashion Revolution
            </h3>
            <p className="text-primary-foreground/70 mb-6">
              Get exclusive access to new collections, AI styling tips, and special offers.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-md bg-primary-foreground/10 border border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50 focus:outline-none focus:ring-2 focus:ring-accent"
              />
              <Button variant="gold" size="lg">
                Subscribe
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 md:gap-12">
          {/* Brand */}
          <div className="col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <Sparkles className="h-6 w-6 text-accent" />
              <span className="font-display text-2xl font-semibold">
                Outfit<span className="text-accent">AI</span>
              </span>
            </Link>
            <p className="text-primary-foreground/70 text-sm mb-6 max-w-xs">
              Revolutionizing online fashion with AI-powered virtual try-on technology.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="text-primary-foreground/70 hover:text-accent transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-primary-foreground/70 hover:text-accent transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-primary-foreground/70 hover:text-accent transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-primary-foreground/70 hover:text-accent transition-colors">
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider">
                {title}
              </h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-primary-foreground/70 hover:text-primary-foreground text-sm transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-primary-foreground/10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-primary-foreground/60">
            <p>© 2024 Outfit AI. All rights reserved.</p>
            <p>Made with AI, designed for humans.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
