import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useStylist, StylistProduct } from "@/hooks/useStylist";
import { OutfitCard } from "@/components/OutfitCard";
import { 
  Sparkles, 
  Wand2, 
  RotateCcw, 
  SlidersHorizontal, 
  Check, 
  IndianRupee, 
  Layers, 
  Palette, 
  Compass, 
  AlertCircle 
} from "lucide-react";
import { toast } from "sonner";

const OCCASIONS = [
  "College / University",
  "Office / Business",
  "Casual Outing",
  "Date Night",
  "Party",
  "Wedding / Festive",
  "Travel",
  "Gym / Sports",
  "Other",
];

const STYLES = [
  "Minimal",
  "Casual",
  "Streetwear",
  "Formal",
  "Smart Casual",
  "Sporty",
  "Old Money",
  "Trendy",
  "Ethnic / Traditional",
];

const COLORS = [
  "Black",
  "White",
  "Beige",
  "Blue",
  "Grey",
  "Brown",
  "Pastel",
  "No Preference",
];

const BUDGET_PRESETS = [3000, 5000, 8000, 12000, 15000];

const StylistPage = () => {
  const { user } = useAuth();
  const { profile } = useProfile();

  const [occasion, setOccasion] = useState<string>("Casual Outing");
  const [budget, setBudget] = useState<number>(5000);
  const [customBudget, setCustomBudget] = useState<string>("5000");
  const [preferredStyle, setPreferredStyle] = useState<string>("Minimal");
  const [selectedColors, setSelectedColors] = useState<string[]>(["No Preference"]);
  const [instructions, setInstructions] = useState<string>("");

  const {
    outfits,
    isGenerating,
    isReplacing,
    replacingItemId,
    getRecommendations,
    replaceItem,
  } = useStylist();

  // Populate user preferences if logged in
  useEffect(() => {
    if (profile?.stylePreferences && profile.stylePreferences.length > 0) {
      const matched = STYLES.find((s) =>
        profile.stylePreferences.some((p: string) => p.toLowerCase().includes(s.toLowerCase()))
      );
      if (matched) {
        setPreferredStyle(matched);
      }
    }
  }, [profile]);

  const handleBudgetChange = (value: number) => {
    setBudget(value);
    setCustomBudget(value.toString());
  };

  const handleCustomBudgetBlur = () => {
    const parsed = parseInt(customBudget, 10);
    if (!isNaN(parsed) && parsed > 500) {
      setBudget(parsed);
    } else {
      setCustomBudget(budget.toString());
    }
  };

  const handleColorToggle = (color: string) => {
    if (color === "No Preference") {
      setSelectedColors(["No Preference"]);
      return;
    }

    const filtered = selectedColors.filter((c) => c !== "No Preference");
    if (filtered.includes(color)) {
      const next = filtered.filter((c) => c !== color);
      setSelectedColors(next.length > 0 ? next : ["No Preference"]);
    } else {
      setSelectedColors([...filtered, color]);
    }
  };

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!budget || budget <= 0) {
      toast.error("Please enter a valid budget in INR.");
      return;
    }

    try {
      await getRecommendations({
        occasion,
        budget,
        preferredStyle,
        preferredColors: selectedColors.includes("No Preference") ? [] : selectedColors,
        instructions: instructions.trim() || undefined,
      });

      // Smooth scroll down to recommendations
      setTimeout(() => {
        const el = document.getElementById("recommendations-section");
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 200);
    } catch (err) {
      // toast is handled in hook
    }
  };

  const handleReplaceItemInOutfit = async (
    outfitId: string,
    currentItem: StylistProduct,
    remainingItems: StylistProduct[]
  ) => {
    await replaceItem({
      outfitId,
      currentItem,
      remainingItems,
      budget,
      occasion,
      preferredStyle,
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-accent selection:text-accent-foreground">
      <Navbar />

      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Header Section */}
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-semibold tracking-wide uppercase mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Fashion Concierge</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-display font-bold tracking-tight text-foreground mb-3">
              Your Personal AI Stylist
            </h1>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              Curate complete, coordinated looks powered by Google Gemini, tailored directly from real, in-stock products in FitKart's catalog.
            </p>
          </div>

          {/* Configuration Form Card */}
          <div className="bg-card border border-border rounded-2xl shadow-sm p-6 md:p-8 mb-12">
            <form onSubmit={handleGenerate} className="space-y-8">
              {/* Occasion Selection */}
              <div>
                <label className="text-xs uppercase tracking-wider font-semibold text-muted-foreground block mb-3 flex items-center gap-2">
                  <Compass className="w-4 h-4 text-accent" />
                  <span>1. Choose Occasion</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {OCCASIONS.map((occ) => (
                    <button
                      type="button"
                      key={occ}
                      onClick={() => setOccasion(occ)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all duration-200 border ${
                        occasion === occ
                          ? "bg-primary text-primary-foreground border-primary shadow-sm"
                          : "bg-muted/40 text-muted-foreground hover:bg-muted border-transparent"
                      }`}
                    >
                      {occ}
                    </button>
                  ))}
                </div>
              </div>

              {/* Budget Range & Presets */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs uppercase tracking-wider font-semibold text-muted-foreground flex items-center gap-2">
                    <IndianRupee className="w-4 h-4 text-accent" />
                    <span>2. Budget Limit (INR)</span>
                  </label>
                  <span className="text-xs text-muted-foreground">
                    Strict ceiling: AI never exceeds this total
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                  <div className="flex items-center gap-2">
                    {BUDGET_PRESETS.map((p) => (
                      <button
                        type="button"
                        key={p}
                        onClick={() => handleBudgetChange(p)}
                        className={`flex-1 py-2 px-2.5 rounded-lg text-xs font-medium border text-center transition-all ${
                          budget === p
                            ? "border-accent bg-accent/10 text-accent font-semibold"
                            : "border-border text-muted-foreground hover:border-accent/40"
                        }`}
                      >
                        ₹{p.toLocaleString("en-IN")}
                      </button>
                    ))}
                  </div>

                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">
                      ₹
                    </span>
                    <Input
                      type="number"
                      min={500}
                      max={100000}
                      step={100}
                      value={customBudget}
                      onChange={(e) => setCustomBudget(e.target.value)}
                      onBlur={handleCustomBudgetBlur}
                      placeholder="Custom Budget in INR"
                      className="pl-7 pr-3 h-10 text-sm font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Preferred Style */}
              <div>
                <label className="text-xs uppercase tracking-wider font-semibold text-muted-foreground block mb-3 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-accent" />
                  <span>3. Preferred Aesthetic & Style</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {STYLES.map((st) => (
                    <button
                      type="button"
                      key={st}
                      onClick={() => setPreferredStyle(st)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all duration-200 border ${
                        preferredStyle === st
                          ? "bg-accent text-accent-foreground border-accent shadow-sm"
                          : "bg-muted/40 text-muted-foreground hover:bg-muted border-transparent"
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Preferred Colors */}
              <div>
                <label className="text-xs uppercase tracking-wider font-semibold text-muted-foreground block mb-3 flex items-center gap-2">
                  <Palette className="w-4 h-4 text-accent" />
                  <span>4. Color Palette (Multiple)</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {COLORS.map((col) => {
                    const isSelected = selectedColors.includes(col);
                    return (
                      <button
                        type="button"
                        key={col}
                        onClick={() => handleColorToggle(col)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 border ${
                          isSelected
                            ? "bg-foreground text-background border-foreground font-semibold"
                            : "bg-muted/40 text-muted-foreground hover:bg-muted border-transparent"
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3" />}
                        <span>{col}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Natural Instructions */}
              <div>
                <label className="text-xs uppercase tracking-wider font-semibold text-muted-foreground block mb-2">
                  5. Additional Styling Notes (Optional)
                </label>
                <Textarea
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="e.g. I need an outfit for a college farewell party. I prefer a classy, minimal look with neutral colors and breathable fabrics."
                  rows={3}
                  className="resize-none text-sm leading-relaxed"
                />
              </div>

              {/* Generate Action Button */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-xs text-muted-foreground">
                  {user ? (
                    <span className="text-accent font-medium">✓ Logged in as {user.email} (Profile preferences linked)</span>
                  ) : (
                    <span>Tip: Sign in to personalize with your fit & style profile.</span>
                  )}
                </p>

                <Button
                  type="submit"
                  disabled={isGenerating}
                  size="lg"
                  className="w-full sm:w-auto px-8 gap-2 bg-accent text-accent-foreground hover:bg-accent/90 font-medium shadow-md transition-all"
                >
                  {isGenerating ? (
                    <>
                      <RotateCcw className="w-4 h-4 animate-spin" />
                      <span>Styling Ensemble with AI...</span>
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4" />
                      <span>Generate Stylist Outfits</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>

          {/* Results Section */}
          <div id="recommendations-section">
            {isGenerating && (
              <div className="py-16 text-center space-y-4">
                <div className="relative inline-flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full border-4 border-accent/20 border-t-accent animate-spin" />
                  <Sparkles className="w-6 h-6 text-accent absolute" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">Consulting your AI Stylist...</h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  Cross-referencing FitKart's real-time inventory to compose complementary outfits strictly under ₹{budget.toLocaleString("en-IN")}.
                </p>
              </div>
            )}

            {!isGenerating && outfits.length > 0 && (
              <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight text-foreground">
                      Recommended Outfits
                    </h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Showing {outfits.length} complete curated look{outfits.length > 1 ? "s" : ""} using real FitKart catalog products.
                    </p>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleGenerate()}
                    disabled={isGenerating}
                    className="gap-2 text-xs"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Regenerate Recommendations</span>
                  </Button>
                </div>

                <div className="grid grid-cols-1 gap-8">
                  {outfits.map((outfit) => (
                    <OutfitCard
                      key={outfit.id}
                      outfit={outfit}
                      budget={budget}
                      occasion={occasion}
                      preferredStyle={preferredStyle}
                      onReplaceItem={(currentItem, remainingItems) =>
                        handleReplaceItemInOutfit(outfit.id, currentItem, remainingItems)
                      }
                      isReplacingItem={isReplacing}
                      replacingItemId={replacingItemId}
                    />
                  ))}
                </div>
              </div>
            )}

            {!isGenerating && outfits.length === 0 && (
              <div className="text-center py-12 px-4 border border-dashed border-border rounded-2xl bg-muted/20">
                <Sparkles className="w-10 h-10 text-muted-foreground/50 mx-auto mb-3" />
                <h4 className="text-base font-semibold text-foreground mb-1">
                  Ready to discover your next signature outfit?
                </h4>
                <p className="text-xs text-muted-foreground max-w-md mx-auto mb-5">
                  Select your occasion, define your budget ceiling, and let our AI Stylist craft personalized outfit combinations from verified in-stock items.
                </p>
                <Button
                  onClick={() => handleGenerate()}
                  className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
                >
                  <Wand2 className="w-4 h-4" />
                  <span>Get My First Look</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default StylistPage;
