import { useState, useRef, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useProfile, BodyMeasurements } from "@/hooks/useProfile";
import { useProduct, useProducts } from "@/hooks/useProducts";
import { getImageUrl } from "@/lib/api";
import { toast } from "sonner";
import { 
  Upload, 
  Camera, 
  Sparkles, 
  Loader2, 
  Check, 
  X,
  ChevronLeft,
  ChevronRight,
  Scale
} from "lucide-react";
import WeightHeightDialog from "@/components/WeightHeightDialog";
import { getRecommendedSize, SizeRecommendation } from "@/lib/sizeRecommendation";

interface BodyAnalysis {
  bodyType: string;
  estimatedSize: string;
  heightCategory: string;
  shoulderWidth: string;
  recommendations: string[];
  confidence: number;
  fitNotes: string;
}

const TryOnPage = () => {
  const [searchParams] = useSearchParams();
  const productId = searchParams.get('product');
  const navigate = useNavigate();
  
  const { user, loading: authLoading } = useAuth();
  const { profile, isLoading: profileLoading, updateProfile } = useProfile();
  const { data: selectedProduct } = useProduct(productId || '');
  const { data: products } = useProducts();
  
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<BodyAnalysis | null>(null);
  const [currentProductIndex, setCurrentProductIndex] = useState(0);
  const [showMeasurementsDialog, setShowMeasurementsDialog] = useState(false);
  const [sizeRecommendation, setSizeRecommendation] = useState<SizeRecommendation | null>(null);
  const [showRecommendations, setShowRecommendations] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get body measurements from profile
  const bodyMeasurements = profile?.bodyMeasurements as BodyMeasurements | null;
  const hasValidMeasurements = bodyMeasurements?.weight && bodyMeasurements?.height;

  // Check if measurements are needed when profile loads
  useEffect(() => {
    if (!profileLoading && profile && !hasValidMeasurements) {
      setShowMeasurementsDialog(true);
    }
  }, [profile, profileLoading, hasValidMeasurements]);

  // Calculate size recommendation when measurements exist and user clicks button
  const handleGetRecommendations = () => {
    if (hasValidMeasurements && bodyMeasurements) {
      const recommendation = getRecommendedSize({
        weight: bodyMeasurements.weight!,
        height: bodyMeasurements.height!,
      });
      setSizeRecommendation(recommendation);
      setShowRecommendations(true);
    } else {
      setShowMeasurementsDialog(true);
    }
  };

  const handleSaveMeasurements = async (weight: number, height: number) => {
    await updateProfile.mutateAsync({
      bodyMeasurements: { weight, height },
    });
    setShowMeasurementsDialog(false);
    toast.success('Measurements saved to your profile!');
  };

  useEffect(() => {
    if (!authLoading && !user) {
      toast.error("Please sign in to use the virtual try-on feature");
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Image size should be less than 10MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
        setAnalysis(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeBody = async () => {
    if (!uploadedImage || !user) return;
    
    setIsAnalyzing(true);
    try {
      // Simulated AI analysis (replace with real API when available)
      await new Promise(resolve => setTimeout(resolve, 2000));
      const simulatedAnalysis: BodyAnalysis = {
        bodyType: 'Athletic',
        estimatedSize: bodyMeasurements ? (bodyMeasurements.weight! > 80 ? 'XL' : bodyMeasurements.weight! > 70 ? 'L' : bodyMeasurements.weight! > 60 ? 'M' : 'S') : 'M',
        heightCategory: bodyMeasurements?.height ? (bodyMeasurements.height > 180 ? 'Tall' : bodyMeasurements.height > 170 ? 'Average' : 'Petite') : 'Average',
        shoulderWidth: 'Medium',
        recommendations: [
          'Fitted styles will complement your body type',
          'Consider structured pieces for a polished look',
          'V-neck tops create a flattering silhouette',
        ],
        confidence: 85,
        fitNotes: 'Based on your measurements, we recommend focusing on well-fitted garments that highlight your proportions.',
      };
      setAnalysis(simulatedAnalysis);
      toast.success("Analysis complete! See your personalized recommendations.");
    } catch (error: any) {
      console.error('Analysis error:', error);
      toast.error(error.message || "Failed to analyze. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const currentProduct = selectedProduct || products?.[currentProductIndex];

  const nextProduct = () => {
    if (products && currentProductIndex < products.length - 1) {
      setCurrentProductIndex(prev => prev + 1);
    }
  };

  const prevProduct = () => {
    if (currentProductIndex > 0) {
      setCurrentProductIndex(prev => prev - 1);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <main className="min-h-screen">
      <Navbar />
      
      {/* Measurements Dialog */}
      <WeightHeightDialog
        open={showMeasurementsDialog}
        onSave={handleSaveMeasurements}
        initialWeight={bodyMeasurements?.weight}
        initialHeight={bodyMeasurements?.height}
      />
      <div className="pt-24 md:pt-28 pb-20">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent mb-6">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-medium">AI-Powered Virtual Try-On</span>
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-medium mb-4">
              See How It Looks On You
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Upload your photo and our AI will analyze your body type to recommend the perfect size and show you how the outfit will look.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Left Side - Photo Upload */}
            <div className="space-y-6">
              <div className="bg-card rounded-2xl border border-border p-6">
                <h2 className="font-display text-xl font-medium mb-4">Your Photo</h2>
                
                {uploadedImage ? (
                  <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-muted">
                    <img 
                      src={uploadedImage} 
                      alt="Uploaded" 
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => {
                        setUploadedImage(null);
                        setAnalysis(null);
                      }}
                      className="absolute top-4 right-4 p-2 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                ) : (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-[3/4] rounded-xl border-2 border-dashed border-border hover:border-accent/50 transition-colors cursor-pointer flex flex-col items-center justify-center gap-4 bg-muted/30"
                  >
                    <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center">
                      <Upload className="h-8 w-8 text-accent" />
                    </div>
                    <div className="text-center">
                      <p className="font-medium">Upload your photo</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        PNG, JPG up to 10MB
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Camera className="h-4 w-4 mr-2" />
                      Choose Photo
                    </Button>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                {uploadedImage && !analysis && (
                  <Button 
                    variant="gold" 
                    className="w-full mt-4" 
                    onClick={analyzeBody}
                    disabled={isAnalyzing}
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Analyze My Body Type
                      </>
                    )}
                  </Button>
                )}
              </div>

              {/* Get Recommendations Button */}
              {hasValidMeasurements && !showRecommendations && (
                <Button 
                  variant="gold" 
                  className="w-full"
                  onClick={handleGetRecommendations}
                >
                  <Scale className="h-4 w-4 mr-2" />
                  Get Size Recommendations
                </Button>
              )}

              {/* Your Measurements Card - Shows after clicking button */}
              {showRecommendations && sizeRecommendation && (
                <div className="bg-card rounded-2xl border border-border p-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                        <Scale className="h-5 w-5 text-accent" />
                      </div>
                      <div>
                        <h3 className="font-medium">Your Measurements</h3>
                        <p className="text-sm text-muted-foreground">
                          {bodyMeasurements?.weight} kg • {bodyMeasurements?.height} cm
                        </p>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setShowMeasurementsDialog(true)}
                    >
                      Update
                    </Button>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 rounded-xl bg-accent/10 text-center">
                      <p className="text-xs text-muted-foreground">Suggested Size</p>
                      <p className="font-bold text-accent text-lg">{sizeRecommendation.size}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-muted/50 text-center">
                      <p className="text-xs text-muted-foreground">Body Frame</p>
                      <p className="font-medium capitalize">{sizeRecommendation.bodyFrame}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-muted/50 text-center">
                      <p className="text-xs text-muted-foreground">Best Fit</p>
                      <p className="font-medium capitalize">{sizeRecommendation.fitType}</p>
                    </div>
                  </div>

                  {sizeRecommendation.fittingTips.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-border">
                      <h4 className="text-sm font-medium mb-2">Personalized Tips</h4>
                      <ul className="space-y-1.5">
                        {sizeRecommendation.fittingTips.slice(0, 3).map((tip, i) => (
                          <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                            <Check className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Analysis Results */}
              {analysis && (
                <div className="bg-card rounded-2xl border border-border p-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                      <Check className="h-5 w-5 text-green-500" />
                    </div>
                    <div>
                      <h3 className="font-medium">Analysis Complete</h3>
                      <p className="text-sm text-muted-foreground">{analysis.confidence}% confidence</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-muted/50">
                      <p className="text-sm text-muted-foreground">Body Type</p>
                      <p className="font-medium capitalize">{analysis.bodyType}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-accent/10">
                      <p className="text-sm text-muted-foreground">Recommended Size</p>
                      <p className="font-medium text-accent text-lg">{analysis.estimatedSize}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-muted/50">
                      <p className="text-sm text-muted-foreground">Height Category</p>
                      <p className="font-medium capitalize">{analysis.heightCategory}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-muted/50">
                      <p className="text-sm text-muted-foreground">Shoulder Width</p>
                      <p className="font-medium capitalize">{analysis.shoulderWidth}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Fit Notes</h4>
                    <p className="text-sm text-muted-foreground">{analysis.fitNotes}</p>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Style Recommendations</h4>
                    <ul className="space-y-2">
                      {analysis.recommendations.map((rec, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                          <Check className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {/* Right Side - Product Selection */}
            <div className="space-y-6">
              <div className="bg-card rounded-2xl border border-border p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-display text-xl font-medium">Try This On</h2>
                  {!selectedProduct && products && products.length > 1 && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={prevProduct}
                        disabled={currentProductIndex === 0}
                        className="p-2 rounded-full hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <span className="text-sm text-muted-foreground">
                        {currentProductIndex + 1} / {products.length}
                      </span>
                      <button
                        onClick={nextProduct}
                        disabled={currentProductIndex === products.length - 1}
                        className="p-2 rounded-full hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </div>
                  )}
                </div>

                {currentProduct ? (
                  <div className="space-y-4">
                    <div className="aspect-[3/4] rounded-xl overflow-hidden bg-muted">
                      <img 
                        src={getImageUrl(currentProduct.images?.[0]) || "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=500"} 
                        alt={currentProduct.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{currentProduct.brand}</p>
                      <h3 className="font-medium text-lg">{currentProduct.name}</h3>
                      <p className="font-semibold text-accent text-xl mt-1">
                        ₹{Number(currentProduct.price).toFixed(0)}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium mb-2">Available Sizes</p>
                      <div className="flex flex-wrap gap-2">
                        {currentProduct.sizes?.map((size) => {
                          const isRecommended = showRecommendations && (analysis?.estimatedSize === size || 
                            (sizeRecommendation?.size === size && !analysis));
                          return (
                            <span 
                              key={size}
                              className={`px-3 py-1.5 rounded-lg text-sm border ${
                                isRecommended
                                  ? 'border-accent bg-accent/10 text-accent font-medium' 
                                  : 'border-border'
                              }`}
                            >
                              {size}
                              {isRecommended && (
                                <span className="ml-1 text-xs">✓ Recommended</span>
                              )}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    {(analysis || sizeRecommendation) && (
                      <Button 
                        variant="gold" 
                        className="w-full"
                        onClick={() => navigate(`/shop`)}
                      >
                        Add Size {analysis?.estimatedSize || sizeRecommendation?.size} to Cart
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="aspect-[3/4] rounded-xl border-2 border-dashed border-border flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-muted-foreground">No products available</p>
                      <Button variant="outline" className="mt-4" onClick={() => navigate('/shop')}>
                        Browse Shop
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Tips */}
              <div className="bg-muted/30 rounded-2xl p-6">
                <h3 className="font-medium mb-4">Tips for Best Results</h3>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-accent/10 text-accent flex items-center justify-center text-xs flex-shrink-0">1</span>
                    Stand in a well-lit area facing the camera directly
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-accent/10 text-accent flex items-center justify-center text-xs flex-shrink-0">2</span>
                    Wear fitted clothing to help the AI detect your body shape
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-accent/10 text-accent flex items-center justify-center text-xs flex-shrink-0">3</span>
                    Include your full body from head to toe in the frame
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
};

export default TryOnPage;
