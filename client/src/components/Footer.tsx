import { Link } from "react-router-dom";
import {
  Sparkles, Instagram, Twitter, Facebook, Mail, ArrowRight, Wand2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const Footer = () => {
  const footerLinks = {
    Shop: [
      { label: "Women", href: "/shop" },
      { label: "Men", href: "/shop" },
      { label: "New Arrivals", href: "/shop" },
      { label: "Collections", href: "/shop" },
    ],
    Features: [
      { label: "AI Personal Stylist", href: "/stylist" },
      { label: "Virtual Try-On", href: "/try-on" },
      { label: "Size Guide", href: "/about" },
      { label: "About Us", href: "/about" },
    ],
    Account: [
      { label: "My Profile", href: "/profile" },
      { label: "My Orders", href: "/orders" },
      { label: "Wishlist", href: "/wishlist" },
      { label: "Cart", href: "/cart" },
    ],
    Legal: [
      { label: "Privacy Policy", href: "#" },
      { label: "Terms of Service", href: "#" },
      { label: "Cookie Policy", href: "#" },
    ],
  };

  const socialLinks = [
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Facebook, href: "#", label: "Facebook" },
    { icon: Mail, href: "#", label: "Email" },
  ];

  return (
    <footer className="bg-primary text-primary-foreground">
      {/* AI Stylist Banner */}
      <div className="border-b border-primary-foreground/8">
        <div className="container mx-auto px-4 py-10 md:py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-10">
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                <Wand2 className="h-4 w-4 text-accent" />
                <span className="text-accent text-xs font-semibold uppercase tracking-widest">New Feature</span>
              </div>
              <h3 className="font-display text-xl md:text-2xl font-medium mb-1">
                Meet Your AI Personal Stylist
              </h3>
              <p className="text-primary-foreground/60 text-sm max-w-sm">
                Get complete outfit recommendations powered by Gemini AI, using real in-stock FitKart products.
              </p>
            </div>
            <Link to="/stylist" className="shrink-0">
              <Button variant="gold" size="lg" className="gap-2 shadow-gold group">
                Try AI Stylist
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Newsletter Section */}
      <div className="border-b border-primary-foreground/8">
        <div className="container mx-auto px-4 py-10 md:py-12">
          <div className="max-w-lg mx-auto text-center">
            <h3 className="font-display text-xl md:text-2xl mb-2">Join the Fashion Revolution</h3>
            <p className="text-primary-foreground/60 text-sm mb-6">
              Get exclusive access to new collections, AI styling tips, and special offers.
            </p>
            <div className="flex flex-col sm:flex-row gap-2.5">
              <input
                type="email"
                placeholder="Your email address"
                className="flex-1 px-4 py-2.5 rounded-xl bg-primary-foreground/8 border border-primary-foreground/15 text-primary-foreground placeholder:text-primary-foreground/40 focus:outline-none focus:ring-2 focus:ring-accent/50 text-sm transition-all"
              />
              <Button variant="gold" size="sm" className="px-5 font-medium shrink-0">
                Subscribe
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12 md:py-14">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 md:gap-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="inline-flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-accent" />
              <span className="font-display text-xl font-semibold">
                Fit<span className="text-accent">kart</span>
              </span>
            </Link>
            <p className="text-primary-foreground/55 text-sm mb-6 leading-relaxed max-w-xs">
              Revolutionizing online fashion with AI-powered virtual try-on and personal styling.
            </p>
            <div className="flex items-center gap-3">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-8 h-8 rounded-lg bg-primary-foreground/8 border border-primary-foreground/12 flex items-center justify-center text-primary-foreground/55 hover:text-accent hover:border-accent/40 hover:bg-accent/10 transition-all duration-200"
                >
                  <Icon className="h-3.5 w-3.5" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-semibold mb-4 text-xs uppercase tracking-widest text-primary-foreground/80">
                {title}
              </h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-primary-foreground/50 hover:text-primary-foreground text-sm transition-colors duration-200 link-underline"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-primary-foreground/8">
        <div className="container mx-auto px-4 py-5">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-primary-foreground/40">
            <p>© 2026 Fitkart. All rights reserved.</p>
            <p className="flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-accent/70" />
              Made with AI, designed for humans.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
