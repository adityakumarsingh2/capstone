import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Menu, X, ShoppingBag, User, Sparkles, LogOut, Heart, Wand2, ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, signOut } = useAuth();
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setIsOpen(false); }, [location.pathname]);

  const navLinks = [
    { name: "Shop", href: "/shop" },
    { name: "AI Stylist", href: "/stylist", highlight: true },
    { name: "Try On", href: "/try-on" },
    { name: "About", href: "/about" },
  ];

  const isActive = (href: string) =>
    location.pathname === href ||
    (href !== "/" && location.pathname.startsWith(href));

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-background/92 backdrop-blur-xl border-b border-border/70 shadow-xs"
          : "bg-transparent border-b border-transparent"
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-18">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group shrink-0">
            <div className="relative">
              <Sparkles className="h-5 w-5 text-accent transition-transform duration-500 group-hover:rotate-180 group-hover:scale-110" />
            </div>
            <span className="font-display text-xl md:text-2xl font-semibold tracking-tight">
              Fit<span className="text-accent">kart</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className={cn(
                  "relative px-3.5 py-2 text-sm font-medium rounded-lg transition-all duration-200",
                  isActive(link.href)
                    ? "text-foreground bg-accent/8"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60",
                  link.highlight && !isActive(link.href) && "text-accent hover:text-accent hover:bg-accent/8"
                )}
              >
                {link.highlight && (
                  <span className="absolute -top-1 -right-1 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-70" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-accent" />
                  </span>
                )}
                {link.name}
              </Link>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-1">
            {/* Wishlist */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/wishlist")}
              className={cn(
                "relative h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-muted/60",
                isActive("/wishlist") && "text-accent bg-accent/8"
              )}
            >
              <Heart className="h-4.5 w-4.5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-4 w-4 bg-accent text-accent-foreground text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm">
                  {wishlistCount > 9 ? "9+" : wishlistCount}
                </span>
              )}
            </Button>

            {/* Cart */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/cart")}
              className={cn(
                "relative h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-muted/60",
                isActive("/cart") && "text-accent bg-accent/8"
              )}
            >
              <ShoppingBag className="h-4.5 w-4.5" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-4 w-4 bg-accent text-accent-foreground text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm animate-scale-in">
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
            </Button>

            {/* User menu */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-1 h-9 gap-1.5 px-2.5 text-muted-foreground hover:text-foreground hover:bg-muted/60"
                  >
                    <div className="w-6 h-6 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center text-accent text-xs font-bold shrink-0">
                      {user.email?.[0]?.toUpperCase() || <User className="w-3 h-3" />}
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 opacity-60" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52 shadow-elegant">
                  <div className="px-2 py-2 mb-1">
                    <p className="text-xs font-medium text-foreground truncate">{user.fullName || "Account"}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/profile")} className="gap-2">
                    <User className="h-3.5 w-3.5" />
                    My Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/orders")} className="gap-2">
                    <ShoppingBag className="h-3.5 w-3.5" />
                    My Orders
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/wishlist")} className="gap-2">
                    <Heart className="h-3.5 w-3.5" />
                    Wishlist
                  </DropdownMenuItem>
                  {user.role === "admin" && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => navigate("/admin")} className="gap-2 text-accent">
                        Admin Dashboard
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="gap-2 text-destructive focus:text-destructive">
                    <LogOut className="h-3.5 w-3.5" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/auth")}
                className="h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-muted/60"
              >
                <User className="h-4.5 w-4.5" />
              </Button>
            )}

            {/* Primary CTA */}
            <div className="ml-2 pl-2 border-l border-border/70">
              {user ? (
                <Button
                  variant="gold"
                  size="sm"
                  onClick={() => navigate("/stylist")}
                  className="gap-1.5 shadow-gold/40"
                >
                  <Wand2 className="h-3.5 w-3.5" />
                  AI Stylist
                </Button>
              ) : (
                <Button variant="gold" size="sm" onClick={() => navigate("/auth")} className="shadow-gold/40">
                  Get Started
                </Button>
              )}
            </div>
          </div>

          {/* Mobile: Cart + Hamburger */}
          <div className="md:hidden flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/cart")}
              className="relative h-9 w-9 text-muted-foreground"
            >
              <ShoppingBag className="h-4.5 w-4.5" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-4 w-4 bg-accent text-accent-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg text-foreground hover:bg-muted/60 transition-colors"
              aria-label={isOpen ? "Close menu" : "Open menu"}
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={cn(
            "md:hidden overflow-hidden transition-all duration-300 ease-out",
            isOpen ? "max-h-[480px] pb-5" : "max-h-0"
          )}
        >
          <div className="flex flex-col pt-2 pb-3 border-t border-border/50 mt-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex items-center gap-2 px-3 py-3 rounded-xl text-base font-medium transition-colors",
                  isActive(link.href)
                    ? "text-foreground bg-accent/8"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                  link.highlight && !isActive(link.href) && "text-accent"
                )}
              >
                {link.highlight && <Wand2 className="w-4 h-4" />}
                {link.name}
              </Link>
            ))}

            <div className="flex items-center gap-3 pt-4 mt-2 border-t border-border/50">
              {user ? (
                <>
                  <Button
                    variant="outline"
                    className="flex-1 text-sm"
                    onClick={() => { setIsOpen(false); navigate("/profile"); }}
                  >
                    My Profile
                  </Button>
                  <Button
                    variant="gold"
                    className="flex-1 text-sm gap-1.5"
                    onClick={() => { setIsOpen(false); navigate("/stylist"); }}
                  >
                    <Wand2 className="w-3.5 h-3.5" />
                    AI Stylist
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    className="flex-1 text-sm"
                    onClick={() => { setIsOpen(false); navigate("/auth"); }}
                  >
                    Sign In
                  </Button>
                  <Button
                    variant="gold"
                    className="flex-1 text-sm"
                    onClick={() => { setIsOpen(false); navigate("/auth"); }}
                  >
                    Get Started
                  </Button>
                </>
              )}
            </div>

            {user && (
              <button
                onClick={() => { setIsOpen(false); handleSignOut(); }}
                className="mt-2 flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/8 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
