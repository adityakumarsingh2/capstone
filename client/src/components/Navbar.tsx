import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, ShoppingBag, User, Search, Sparkles, LogOut, Heart } from "lucide-react";
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
  const { user, signOut } = useAuth();
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const navigate = useNavigate();

  const navLinks = [
    { name: "Shop", href: "/shop" },
    { name: "Try On", href: "/try-on" },
    { name: "How It Works", href: "/#how-it-works" },
    { name: "About", href: "/about" },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="relative">
              <Sparkles className="h-6 w-6 text-accent transition-transform duration-300 group-hover:rotate-12" />
            </div>
            <span className="font-display text-xl md:text-2xl font-semibold tracking-tight">
              Outfit<span className="text-accent">AI</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200 relative group"
              >
                {link.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
              <Search className="h-5 w-5" />
            </Button>
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem className="text-sm text-muted-foreground">
                    {user.email}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    My Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/orders')}>
                    My Orders
                  </DropdownMenuItem>
                  {user.role === 'admin' && (
                    <DropdownMenuItem onClick={() => navigate('/admin')}>
                      Admin Dashboard
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-muted-foreground hover:text-foreground"
                onClick={() => navigate('/auth')}
              >
                <User className="h-5 w-5" />
              </Button>
            )}

            <Button 
              variant="ghost" 
              size="icon" 
              className="text-muted-foreground hover:text-foreground relative"
              onClick={() => navigate('/wishlist')}
            >
              <Heart className="h-5 w-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-accent text-accent-foreground text-xs rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Button>

            <Button 
              variant="ghost" 
              size="icon" 
              className="text-muted-foreground hover:text-foreground relative"
              onClick={() => navigate('/cart')}
            >
              <ShoppingBag className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-accent text-accent-foreground text-xs rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Button>

            {user ? (
              <Button variant="gold" size="sm" onClick={() => navigate('/try-on')}>
                Try On
              </Button>
            ) : (
              <Button variant="gold" size="sm" onClick={() => navigate('/auth')}>
                Get Started
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-foreground"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        <div
          className={cn(
            "md:hidden overflow-hidden transition-all duration-300 ease-out",
            isOpen ? "max-h-96 pb-6" : "max-h-0"
          )}
        >
          <div className="flex flex-col gap-4 pt-4">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                onClick={() => setIsOpen(false)}
                className="text-lg font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.name}
              </Link>
            ))}
            <div className="flex items-center gap-4 pt-4 border-t border-border">
              {user ? (
                <>
                  <Button variant="outline" className="flex-1" onClick={handleSignOut}>
                    Sign Out
                  </Button>
                  <Button variant="gold" className="flex-1" onClick={() => { setIsOpen(false); navigate('/try-on'); }}>
                    Try On
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" className="flex-1" onClick={() => { setIsOpen(false); navigate('/auth'); }}>
                    Sign In
                  </Button>
                  <Button variant="gold" className="flex-1" onClick={() => { setIsOpen(false); navigate('/auth'); }}>
                    Get Started
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
