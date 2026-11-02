import { useState, useCallback } from "react";
import { Upload, Camera, X, Sparkles, ArrowRight, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const VirtualTryOn = () => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragOut = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  }, []);

  const handleFile = (file: File) => {
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
        simulateAnalysis();
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  const simulateAnalysis = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      setAnalysisComplete(true);
    }, 3000);
  };

  const resetUpload = () => {
    setUploadedImage(null);
    setAnalysisComplete(false);
    setIsAnalyzing(false);
  };

  return (
    <section className="py-20 md:py-32 bg-gradient-subtle">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 md:mb-16">
            <span className="text-accent font-medium text-sm uppercase tracking-wider">Experience The Magic</span>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-medium mt-4 mb-6">
              Try Virtual Fitting Room
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Upload your photo and see how our AI-powered technology analyzes your body and creates perfect outfit previews.
            </p>
          </div>

          {/* Upload Area */}
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Left: Upload Zone */}
            <div
              className={cn(
                "relative rounded-2xl border-2 border-dashed transition-all duration-300 overflow-hidden",
                isDragging ? "border-accent bg-accent/5" : "border-border hover:border-accent/50",
                uploadedImage ? "bg-card" : "bg-background"
              )}
              onDragEnter={handleDragIn}
              onDragLeave={handleDragOut}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {uploadedImage ? (
                <div className="relative aspect-[3/4]">
                  <img
                    src={uploadedImage}
                    alt="Uploaded"
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Analysis Overlay */}
                  {isAnalyzing && (
                    <div className="absolute inset-0 bg-foreground/60 backdrop-blur-sm flex items-center justify-center">
                      <div className="text-center text-primary-foreground">
                        <div className="relative w-20 h-20 mx-auto mb-4">
                          <div className="absolute inset-0 border-4 border-accent/30 rounded-full" />
                          <div className="absolute inset-0 border-4 border-t-accent rounded-full animate-spin" />
                          <Sparkles className="absolute inset-0 m-auto h-8 w-8 text-accent" />
                        </div>
                        <p className="font-medium">Analyzing body measurements...</p>
                        <p className="text-sm text-primary-foreground/70 mt-2">This may take a few seconds</p>
                      </div>
                    </div>
                  )}

                  {/* Close Button */}
                  <button
                    onClick={resetUpload}
                    className="absolute top-4 right-4 w-10 h-10 rounded-full bg-background/90 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors shadow-md"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              ) : (
                <div className="aspect-[3/4] flex flex-col items-center justify-center p-8 text-center">
                  <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center mb-6">
                    <Upload className="h-10 w-10 text-accent" />
                  </div>
                  <h3 className="font-display text-xl font-medium mb-2">
                    Drop Your Photo Here
                  </h3>
                  <p className="text-muted-foreground mb-6 max-w-xs">
                    Upload a full-body photo for the best results. We support JPG, PNG formats.
                  </p>
                  <div className="flex items-center gap-3">
                    <label>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileInput}
                      />
                      <Button variant="gold" className="cursor-pointer" asChild>
                        <span>
                          <ImageIcon className="h-4 w-4 mr-2" />
                          Browse Files
                        </span>
                      </Button>
                    </label>
                    <span className="text-muted-foreground">or</span>
                    <Button variant="outline">
                      <Camera className="h-4 w-4 mr-2" />
                      Take Photo
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Right: Results/Info */}
            <div className="flex flex-col justify-center">
              {analysisComplete ? (
                <div className="space-y-6 animate-fade-up">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 rounded-full text-green-600 text-sm font-medium">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Analysis Complete
                  </div>

                  <h3 className="font-display text-2xl md:text-3xl font-medium">
                    Your Perfect Sizes
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: "Top Size", value: "M", confidence: "98%" },
                      { label: "Bottom Size", value: "32", confidence: "96%" },
                      { label: "Dress Size", value: "8", confidence: "97%" },
                      { label: "Shoe Size", value: "42 EU", confidence: "94%" },
                    ].map((size) => (
                      <div key={size.label} className="bg-card rounded-xl p-4 border border-border">
                        <p className="text-sm text-muted-foreground mb-1">{size.label}</p>
                        <p className="font-display text-2xl font-semibold">{size.value}</p>
                        <p className="text-xs text-accent mt-1">{size.confidence} confidence</p>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4">
                    <Button variant="gold" size="lg" className="w-full group">
                      Browse Outfits in Your Size
                      <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-8">
                  <div>
                    <h3 className="font-display text-2xl md:text-3xl font-medium mb-4">
                      How It Works
                    </h3>
                    <p className="text-muted-foreground">
                      Our advanced AI technology analyzes your body proportions from a single photo 
                      to provide accurate size recommendations across all brands.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {[
                      "AI detects body landmarks and measurements",
                      "Cross-references with 1000+ brand size charts",
                      "Generates personalized size recommendations",
                      "Creates realistic virtual try-on previews",
                    ].map((step, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs font-medium text-accent">{index + 1}</span>
                        </div>
                        <p className="text-foreground">{step}</p>
                      </div>
                    ))}
                  </div>

                  <div className="bg-accent/10 rounded-xl p-4 border border-accent/20">
                    <p className="text-sm text-muted-foreground">
                      <strong className="text-foreground">Privacy First:</strong> Your photos are processed securely and never stored permanently.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VirtualTryOn;
