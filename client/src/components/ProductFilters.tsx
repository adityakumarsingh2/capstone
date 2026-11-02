import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Filter, X } from "lucide-react";

export interface FilterState {
  sizes: string[];
  colors: string[];
  priceRange: [number, number];
}

interface ProductFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  availableSizes: string[];
  availableColors: string[];
  maxPrice: number;
}

const colorDisplayNames: Record<string, string> = {
  black: "Black",
  white: "White",
  navy: "Navy",
  gray: "Gray",
  beige: "Beige",
  brown: "Brown",
  cream: "Cream",
  charcoal: "Charcoal",
  burgundy: "Burgundy",
  olive: "Olive",
  camel: "Camel",
  khaki: "Khaki",
};

const colorSwatches: Record<string, string> = {
  black: "hsl(0 0% 10%)",
  white: "hsl(0 0% 95%)",
  navy: "hsl(220 60% 25%)",
  gray: "hsl(0 0% 50%)",
  beige: "hsl(40 30% 75%)",
  brown: "hsl(25 40% 35%)",
  cream: "hsl(45 40% 88%)",
  charcoal: "hsl(0 0% 25%)",
  burgundy: "hsl(345 60% 30%)",
  olive: "hsl(80 30% 35%)",
  camel: "hsl(35 45% 55%)",
  khaki: "hsl(45 35% 55%)",
};

const ProductFilters = ({
  filters,
  onFiltersChange,
  availableSizes,
  availableColors,
  maxPrice,
}: ProductFiltersProps) => {
  const [open, setOpen] = useState(false);

  const activeFiltersCount = 
    filters.sizes.length + 
    filters.colors.length + 
    (filters.priceRange[0] > 0 || filters.priceRange[1] < maxPrice ? 1 : 0);

  const toggleSize = (size: string) => {
    const newSizes = filters.sizes.includes(size)
      ? filters.sizes.filter(s => s !== size)
      : [...filters.sizes, size];
    onFiltersChange({ ...filters, sizes: newSizes });
  };

  const toggleColor = (color: string) => {
    const newColors = filters.colors.includes(color)
      ? filters.colors.filter(c => c !== color)
      : [...filters.colors, color];
    onFiltersChange({ ...filters, colors: newColors });
  };

  const handlePriceChange = (value: number[]) => {
    onFiltersChange({ ...filters, priceRange: [value[0], value[1]] });
  };

  const clearAllFilters = () => {
    onFiltersChange({ sizes: [], colors: [], priceRange: [0, maxPrice] });
  };

  const FiltersContent = () => (
    <div className="space-y-6">
      {/* Price Range */}
      <div>
        <h3 className="font-medium mb-4">Price Range</h3>
        <div className="px-2">
          <Slider
            value={[filters.priceRange[0], filters.priceRange[1]]}
            min={0}
            max={maxPrice}
            step={10}
            onValueChange={handlePriceChange}
            className="mb-4"
          />
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>${filters.priceRange[0]}</span>
            <span>${filters.priceRange[1]}</span>
          </div>
        </div>
      </div>

      <Separator />

      {/* Sizes */}
      <div>
        <h3 className="font-medium mb-4">Size</h3>
        <div className="flex flex-wrap gap-2">
          {availableSizes.map((size) => (
            <button
              key={size}
              onClick={() => toggleSize(size)}
              className={`px-3 py-2 text-sm font-medium rounded-md border transition-all ${
                filters.sizes.includes(size)
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background text-foreground border-border hover:border-primary"
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      <Separator />

      {/* Colors */}
      <div>
        <h3 className="font-medium mb-4">Color</h3>
        <div className="grid grid-cols-2 gap-3">
          {availableColors.map((color) => (
            <label
              key={color}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <Checkbox
                checked={filters.colors.includes(color)}
                onCheckedChange={() => toggleColor(color)}
              />
              <div
                className="w-5 h-5 rounded-full border border-border"
                style={{ backgroundColor: colorSwatches[color] || "hsl(var(--muted))" }}
              />
              <span className="text-sm group-hover:text-primary transition-colors">
                {colorDisplayNames[color] || color}
              </span>
            </label>
          ))}
        </div>
      </div>

      {activeFiltersCount > 0 && (
        <>
          <Separator />
          <Button
            variant="outline"
            onClick={clearAllFilters}
            className="w-full"
          >
            <X className="h-4 w-4 mr-2" />
            Clear All Filters
          </Button>
        </>
      )}
    </div>
  );

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="relative">
          <Filter className="h-4 w-4 mr-2" />
          Filters
          {activeFiltersCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-accent text-accent-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center font-medium">
              {activeFiltersCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[320px] sm:w-[380px]">
        <SheetHeader>
          <SheetTitle className="font-display text-xl">Filter Products</SheetTitle>
        </SheetHeader>
        <div className="mt-6">
          <FiltersContent />
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ProductFilters;
