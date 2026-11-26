import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Sparkles, 
  RotateCw, 
  ShoppingBag, 
  ExternalLink, 
  Check, 
  Tag, 
  Info, 
  CheckCircle2, 
  RefreshCw 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { formatPrice } from "@/lib/formatCurrency";
import { getImageUrl } from "@/lib/api";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { OutfitRecommendation, StylistProduct } from "@/hooks/useStylist";

interface OutfitCardProps {
  outfit: OutfitRecommendation;
  budget: number;
  occasion: string;
  preferredStyle: string;
  onReplaceItem: (currentItem: StylistProduct, remainingItems: StylistProduct[]) => Promise<any>;
  isReplacingItem: boolean;
  replacingItemId: string | null;
}

export const OutfitCard = ({
  outfit,
  budget,
  occasion,
  preferredStyle,
  onReplaceItem,
  isReplacingItem,
  replacingItemId,
}: OutfitCardProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  // Selected size & color configuration for each product in outfit
  // key: productId -> { size: string, color: string }
  const [itemSelections, setItemSelections] = useState<Record<string, { size: string; color: string }>>(() => {
    const initial: Record<string, { size: string; color: string }> = {};
    outfit.items.forEach((item) => {
      initial[item._id] = {
        size: item.sizes && item.sizes.length > 0 ? item.sizes[0] : "Free",
        color: item.colors && item.colors.length > 0 ? item.colors[0] : "",
      };
    });
    return initial;
  });

  const [isAddingAll, setIsAddingAll] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);

  const handleSelectionChange = (productId: string, field: "size" | "color", value: string) => {
    setItemSelections((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [field]: value,
      },
    }));
  };

  const handleAddSingleItem = async (item: StylistProduct) => {
    if (!user) {
      toast.info("Please sign in to add items to your cart.");
      navigate("/auth");
      return;
    }

    const sel = itemSelections[item._id] || {
      size: item.sizes?.[0] || "Free",
      color: item.colors?.[0] || "",
    };

    if (!sel.size) {
      toast.error(`Please pick a size for ${item.name}`);
      return;
    }

    try {
      await addToCart.mutateAsync({
        productId: item._id,
        size: sel.size,
        color: sel.color || undefined,
        quantity: 1,
      });
    } catch (err) {
      // toast handled in hook
    }
  };

  const handleAddEntireOutfit = async () => {
    if (!user) {
      toast.info("Please sign in to add your outfit to the cart.");
      navigate("/auth");
      return;
    }

    // Verify all items have sizes selected
    for (const item of outfit.items) {
      const sel = itemSelections[item._id];
      if (!sel || !sel.size) {
        toast.error(`Please select a size for ${item.name}`);
        setShowConfigModal(true);
        return;
      }
    }

    setIsAddingAll(true);
    let successCount = 0;

    try {
      for (const item of outfit.items) {
        const sel = itemSelections[item._id];
        await addToCart.mutateAsync({
          productId: item._id,
          size: sel.size,
          color: sel.color || undefined,
          quantity: 1,
        });
        successCount++;
      }
      toast.success(`All ${successCount} outfit pieces added to your cart!`);
      setShowConfigModal(false);
    } catch (err: any) {
      toast.error(`Added ${successCount} of ${outfit.items.length} items. Some could not be added.`);
    } finally {
      setIsAddingAll(false);
    }
  };

  const budgetDelta = budget - outfit.totalPrice;

  return (
    <div className="bg-card border border-border/80 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col">
      {/* Header Banner */}
      <div className="p-5 md:p-6 border-b border-border/60 bg-muted/20">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-accent/10 text-accent">
              <Sparkles className="w-4 h-4" />
            </span>
            <h3 className="text-xl font-semibold tracking-tight text-foreground">{outfit.name}</h3>
          </div>
          <Badge variant="outline" className="text-xs font-medium px-2.5 py-1 bg-background/50 border-accent/30 text-accent">
            {outfit.occasionSuitability}
          </Badge>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed mb-3">
          {outfit.description}
        </p>

        {/* Why it works */}
        <div className="bg-background/80 rounded-xl p-3 border border-border/40 text-xs text-muted-foreground flex items-start gap-2.5">
          <Info className="w-4 h-4 text-accent shrink-0 mt-0.5" />
          <div>
            <strong className="text-foreground font-medium">Why this works: </strong>
            {outfit.whyItWorks}
          </div>
        </div>
      </div>

      {/* Outfit Items List */}
      <div className="p-5 md:p-6 flex-1 flex flex-col gap-4">
        <h4 className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
          Ensemble Pieces ({outfit.items.length})
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {outfit.items.map((item) => {
            const isReplacingThis = isReplacingItem && replacingItemId === item._id;
            const currentSelection = itemSelections[item._id] || {
              size: item.sizes?.[0] || "Free",
              color: item.colors?.[0] || "",
            };

            return (
              <div
                key={item._id}
                className="group relative bg-background border border-border rounded-xl p-3 flex flex-col justify-between hover:border-accent/40 transition-colors"
              >
                <div>
                  {/* Product Image */}
                  <div className="relative aspect-[4/5] rounded-lg overflow-hidden bg-muted/30 mb-3">
                    <img
                      src={getImageUrl(item.images?.[0])}
                      alt={item.name}
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                    />
                    <Badge className="absolute top-2 left-2 text-[10px] uppercase font-semibold bg-background/80 backdrop-blur-sm text-foreground hover:bg-background/90">
                      {item.category}
                    </Badge>
                  </div>

                  {/* Brand & Name */}
                  <div className="mb-2">
                    <span className="text-[11px] font-medium text-accent uppercase tracking-wider block">
                      {item.brand || "FitKart"}
                    </span>
                    <h5 className="text-sm font-medium line-clamp-1 text-foreground" title={item.name}>
                      {item.name}
                    </h5>
                    <span className="text-sm font-semibold text-foreground mt-0.5 block">
                      {formatPrice(item.price)}
                    </span>
                  </div>

                  {/* Size & Color Selectors */}
                  <div className="space-y-2 pt-2 border-t border-border/40 text-xs">
                    {item.sizes && item.sizes.length > 0 && (
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-muted-foreground text-[11px]">Size:</span>
                        <div className="flex flex-wrap gap-1 justify-end">
                          {item.sizes.map((s) => (
                            <button
                              key={s}
                              type="button"
                              onClick={() => handleSelectionChange(item._id, "size", s)}
                              className={`px-1.5 py-0.5 rounded text-[11px] font-medium transition-colors ${
                                currentSelection.size === s
                                  ? "bg-accent text-accent-foreground shadow-sm"
                                  : "bg-muted/50 text-muted-foreground hover:bg-muted"
                              }`}
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {item.colors && item.colors.length > 0 && (
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-muted-foreground text-[11px]">Color:</span>
                        <div className="flex flex-wrap gap-1 justify-end">
                          {item.colors.slice(0, 3).map((c) => (
                            <button
                              key={c}
                              type="button"
                              onClick={() => handleSelectionChange(item._id, "color", c)}
                              className={`px-1.5 py-0.5 rounded text-[10px] transition-colors ${
                                currentSelection.color === c
                                  ? "border border-accent font-medium text-foreground bg-accent/10"
                                  : "text-muted-foreground hover:text-foreground"
                              }`}
                            >
                              {c}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions: View Product, Replace Item, Add to Cart */}
                <div className="mt-4 pt-3 border-t border-border/50 flex flex-col gap-1.5">
                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-xs h-8 gap-1"
                      asChild
                    >
                      <Link to={`/product/${item._id}`} target="_blank">
                        <span>Details</span>
                        <ExternalLink className="w-3 h-3 text-muted-foreground" />
                      </Link>
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={isReplacingThis || isReplacingItem}
                      onClick={() => {
                        const remaining = outfit.items.filter((i) => i._id !== item._id);
                        onReplaceItem(item, remaining);
                      }}
                      className="text-xs h-8 px-2.5 text-muted-foreground hover:text-foreground gap-1"
                      title="Replace this item with a compatible match"
                    >
                      <RefreshCw className={`w-3 h-3 ${isReplacingThis ? "animate-spin text-accent" : ""}`} />
                      <span className="hidden sm:inline">Swap</span>
                    </Button>
                  </div>

                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleAddSingleItem(item)}
                    className="w-full text-xs h-8 gap-1.5 font-medium"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Add Item</span>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Outfit Summary and Add All Action */}
      <div className="p-5 md:p-6 border-t border-border/70 bg-muted/10 mt-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-xs uppercase tracking-wider text-muted-foreground">Total Outfit Price:</span>
            <span className="text-xl font-bold text-foreground">
              {formatPrice(outfit.totalPrice)}
            </span>
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">
            {budgetDelta >= 0 ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                Within budget (₹{budgetDelta.toLocaleString("en-IN")} remaining)
              </span>
            ) : (
              <span className="text-destructive font-medium">
                Exceeds budget by ₹{Math.abs(budgetDelta).toLocaleString("en-IN")}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            size="lg"
            className="w-full sm:w-auto gap-2 bg-accent text-accent-foreground hover:bg-accent/90 font-medium shadow-md"
            onClick={handleAddEntireOutfit}
            disabled={isAddingAll}
          >
            {isAddingAll ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Adding Outfit...</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4" />
                <span>Add Complete Outfit to Cart</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Variant Selection Dialog if needed */}
      <Dialog open={showConfigModal} onOpenChange={setShowConfigModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Sizes & Colors</DialogTitle>
            <DialogDescription>
              Please pick your preferred sizes for all pieces in this ensemble before adding to your cart.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {outfit.items.map((item) => {
              const sel = itemSelections[item._id] || {
                size: item.sizes?.[0] || "Free",
                color: item.colors?.[0] || "",
              };
              return (
                <div key={item._id} className="p-3 border rounded-lg bg-card/60 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={getImageUrl(item.images?.[0])}
                      alt={item.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div>
                      <p className="text-xs font-semibold line-clamp-1">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{formatPrice(item.price)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {item.sizes && item.sizes.length > 0 && (
                      <select
                        value={sel.size}
                        onChange={(e) => handleSelectionChange(item._id, "size", e.target.value)}
                        className="text-xs border rounded px-2 py-1 bg-background"
                      >
                        {item.sizes.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfigModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddEntireOutfit} disabled={isAddingAll} className="gap-2">
              <Check className="w-4 h-4" />
              <span>Confirm & Add All</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
