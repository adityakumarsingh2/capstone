import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { Sparkles, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { z } from 'zod';

const emailSchema = z.string().email('Please enter a valid email address');
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');

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
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};
    
    try {
      emailSchema.parse(email);
    } catch (e) {
      if (e instanceof z.ZodError) {
        newErrors.email = e.errors[0].message;
      }
    }

    try {
      passwordSchema.parse(password);
    } catch (e) {
      if (e instanceof z.ZodError) {
        newErrors.password = e.errors[0].message;
      }
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
          if (error.message.includes('already registered')) {
            toast.error('This email is already registered. Please sign in instead.');
          } else {
            toast.error(error.message);
          }
        } else {
          toast.success('Account created successfully! Welcome to Outfit AI.');
          navigate('/');
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes('Invalid login')) {
            toast.error('Invalid email or password. Please try again.');
          } else {
            toast.error(error.message);
          }
        } else {
          toast.success('Welcome back!');
          navigate('/');
        }
      }
    } catch (error) {
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex flex-col justify-center px-8 md:px-16 lg:px-24 py-12">
        <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-12">
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        <div className="max-w-md w-full">
          <Link to="/" className="flex items-center gap-2 mb-8">
            <Sparkles className="h-8 w-8 text-accent" />
            <span className="font-display text-2xl font-semibold">
              Outfit<span className="text-accent">AI</span>
            </span>
          </Link>

          <h1 className="font-display text-3xl md:text-4xl font-medium mb-2">
            {isSignUp ? 'Create an account' : 'Welcome back'}
          </h1>
          <p className="text-muted-foreground mb-8">
            {isSignUp 
              ? 'Start your personalized fashion journey with AI-powered styling.'
              : 'Sign in to access your wardrobe and recommendations.'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Enter your name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="h-12"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErrors(prev => ({ ...prev, email: undefined }));
                }}
                className={`h-12 ${errors.email ? 'border-destructive' : ''}`}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrors(prev => ({ ...prev, password: undefined }));
                  }}
                  className={`h-12 pr-10 ${errors.password ? 'border-destructive' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password}</p>
              )}
            </div>

            <Button 
              type="submit" 
              variant="gold" 
              className="w-full h-12 text-base"
              disabled={isLoading}
            >
              {isLoading ? 'Please wait...' : isSignUp ? 'Create Account' : 'Sign In'}
            </Button>
          </form>

          <p className="mt-8 text-center text-muted-foreground">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setErrors({});
              }}
              className="text-accent hover:underline font-medium"
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        </div>
      </div>

      {/* Right Side - Image */}
      <div className="hidden lg:block flex-1 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-primary/10" />
        <img
          src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&auto=format&fit=crop"
          alt="Fashion"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
        <div className="absolute bottom-12 left-12 right-12 text-white">
          <h2 className="font-display text-3xl font-medium mb-4">
            Your Perfect Fit, Powered by AI
          </h2>
          <p className="text-white/80">
            Upload your photo and instantly see how any outfit looks on you. 
            No more guessing sizes or returns.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
