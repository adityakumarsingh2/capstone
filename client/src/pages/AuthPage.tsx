import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { Sparkles, Eye, EyeOff, ArrowLeft, Wand2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';

const emailSchema = z.string().email('Please enter a valid email address');
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');

const featureHighlights = [
  { icon: Sparkles, text: "AI-powered virtual try-on" },
  { icon: Wand2, text: "Personal AI stylist recommendations" },
  { icon: CheckCircle2, text: "98% size accuracy guarantee" },
];

const AuthPage = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const { signUp, signIn, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate('/');
  }, [user, navigate]);

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};
    try { emailSchema.parse(email); } catch (e) {
      if (e instanceof z.ZodError) newErrors.email = e.errors[0].message;
    }
    try { passwordSchema.parse(password); } catch (e) {
      if (e instanceof z.ZodError) newErrors.password = e.errors[0].message;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      if (isSignUp) {
        const { error } = await signUp(email, password, fullName);
        if (error) {
          toast.error(error.message.includes('already registered')
            ? 'This email is already registered. Please sign in.'
            : error.message);
        } else {
          toast.success('Account created! Welcome to Fitkart.');
          navigate('/');
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          toast.error(error.message.includes('Invalid login')
            ? 'Invalid email or password. Please try again.'
            : error.message);
        } else {
          toast.success('Welcome back!');
          navigate('/');
        }
      }
    } catch {
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* ── Left: Form ── */}
      <div className="flex-1 flex flex-col justify-center px-6 md:px-14 lg:px-20 py-10 relative">
        {/* Faint background texture */}
        <div className="absolute inset-0 bg-gradient-subtle pointer-events-none" />
        <div className="absolute top-0 right-0 w-72 h-72 bg-accent/6 rounded-full blur-[80px] pointer-events-none" />

        <div className="relative z-10 max-w-sm w-full mx-auto lg:mx-0">
          {/* Back link */}
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-10 group"
          >
            <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
            Back to home
          </Link>

          {/* Logo */}
          <Link to="/" className="inline-flex items-center gap-2 mb-9">
            <Sparkles className="h-6 w-6 text-accent" />
            <span className="font-display text-2xl font-semibold">
              Fit<span className="text-accent">kart</span>
            </span>
          </Link>

          {/* Heading */}
          <div className="mb-8">
            <h1 className="font-display text-3xl md:text-4xl font-medium mb-2">
              {isSignUp ? 'Create an account' : 'Welcome back'}
            </h1>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {isSignUp
                ? 'Start your personalized fashion journey with AI-powered styling.'
                : 'Sign in to access your wardrobe and AI recommendations.'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {isSignUp && (
              <div className="space-y-1.5">
                <Label htmlFor="fullName" className="text-xs font-semibold uppercase tracking-wide">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="h-11 rounded-xl border-border/80 focus:border-accent/60 transition-colors"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wide">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setErrors(p => ({ ...p, email: undefined })); }}
                className={`h-11 rounded-xl border-border/80 focus:border-accent/60 transition-colors ${errors.email ? 'border-destructive' : ''}`}
              />
              {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wide">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder={isSignUp ? 'Min 6 characters' : 'Your password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setErrors(p => ({ ...p, password: undefined })); }}
                  className={`h-11 pr-10 rounded-xl border-border/80 focus:border-accent/60 transition-colors ${errors.password ? 'border-destructive' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
            </div>

            <Button
              type="submit"
              variant="gold"
              className="w-full h-11 text-sm font-semibold rounded-xl shadow-gold/30 mt-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-accent-foreground/30 border-t-accent-foreground rounded-full animate-spin" />
                  Please wait...
                </span>
              ) : isSignUp ? 'Create Account' : 'Sign In'}
            </Button>
          </form>

          {/* Toggle */}
          <p className="mt-7 text-center text-sm text-muted-foreground">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              onClick={() => { setIsSignUp(!isSignUp); setErrors({}); }}
              className="text-accent hover:text-accent/80 font-semibold transition-colors"
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        </div>
      </div>

      {/* ── Right: Visual panel ── */}
      <div className="hidden lg:block flex-1 relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1000&auto=format&fit=crop"
          alt="Fashion"
          className="w-full h-full object-cover"
        />
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/70 via-primary/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-transparent" />

        {/* Content */}
        <div className="absolute inset-0 flex flex-col justify-end p-14">
          <Link to="/" className="inline-flex items-center gap-2 mb-auto mt-10">
            <Sparkles className="h-5 w-5 text-accent" />
            <span className="font-display text-xl font-semibold text-white">
              Fit<span className="text-accent">kart</span>
            </span>
          </Link>

          <div>
            <h2 className="font-display text-3xl md:text-4xl font-medium text-white mb-4 leading-snug">
              Your Perfect Fit,
              <br />
              <span className="italic text-accent">Powered by AI</span>
            </h2>
            <p className="text-white/70 text-sm leading-relaxed mb-8 max-w-xs">
              Upload your photo and instantly see how any outfit looks on you. No more guessing sizes or surprise returns.
            </p>

            <div className="space-y-3">
              {featureHighlights.map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-accent/20 border border-accent/30 flex items-center justify-center shrink-0">
                    <Icon className="w-3.5 h-3.5 text-accent" />
                  </div>
                  <span className="text-sm text-white/80 font-medium">{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
