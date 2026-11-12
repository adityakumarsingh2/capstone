import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import ProductQuickView from "@/components/ProductQuickView";
import ProductFilters, { FilterState } from "@/components/ProductFilters";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronDown,
  Grid3X3,
  LayoutGrid,
  Loader2,
  X,
  Search,
  ArrowUpDown,
  Check,
  Sparkles,
} from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import { formatPrice } from "@/lib/formatCurrency";

const categories = [
  "All",
  "Blazers",
  "Dresses",
  "Trousers",
  "Shirts",
  "Tops",
  "Sweaters",
  "Jackets",
  "Outerwear",
  "Accessories",
];

type SortOption = "featured" | "price_asc" | "price_desc" | "rating" | "newest";

const ShopPage = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [gridView, setGridView] = useState<"small" | "large">("small");
  const [quickViewProduct, setQuickViewProduct] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("featured");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [visibleCount, setVisibleCount] = useState(12);

  const { data: products, isLoading } = useProducts(selectedCategory);
  const navigate = useNavigate();

  // Calculate available filter options from products
  const { availableSizes, availableColors, maxPrice } = useMemo(() => {
    if (!products?.length) {
      return { availableSizes: [], availableColors: [], maxPrice: 10000 };
    }

    const sizesSet = new Set<string>();
    const colorsSet = new Set<string>();
    let max = 0;

    products.forEach((product) => {
      product.sizes?.forEach((size) => sizesSet.add(size));
      product.colors?.forEach((color) => colorsSet.add(color));
      if (product.price > max) max = product.price;
    });

    const sizeOrder = ["XS", "S", "M", "L", "XL", "XXL", "28", "30", "32", "34", "36", "38", "One Size"];
    return {
      availableSizes: Array.from(sizesSet).sort((a, b) => {
        const ia = sizeOrder.indexOf(a);
        const ib = sizeOrder.indexOf(b);
        if (ia === -1 && ib === -1) return a.localeCompare(b);
        if (ia === -1) return 1;
        if (ib === -1) return -1;
        return ia - ib;
      }),
      availableColors: Array.from(colorsSet).sort(),
      maxPrice: Math.max(500, Math.ceil(max / 500) * 500),
    };
  }, [products]);

  const [filters, setFilters] = useState<FilterState>({
    sizes: [],
    colors: [],
    priceRange: [0, 10000],
  });

  // Sync maxPrice when category/products change
  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      priceRange: [0, maxPrice],
    }));
    setVisibleCount(12);
  }, [maxPrice, selectedCategory]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    if (!products) return [];
    const q = searchQuery.trim().toLowerCase();

    const filtered = products.filter((product) => {
      if (q) {
        const matchName = product.name.toLowerCase().includes(q);
        const matchBrand = (product.brand || "").toLowerCase().includes(q);
        const matchDesc = (product.description || "").toLowerCase().includes(q);
        if (!matchName && !matchBrand && !matchDesc) return false;
      }

      if (inStockOnly && (product.stockQuantity ?? 0) <= 0) {
        return false;
      }

      if (product.price < filters.priceRange[0] || product.price > filters.priceRange[1]) {
        return false;
      }

      if (filters.sizes.length > 0) {
        const hasMatchingSize = product.sizes?.some((size) => filters.sizes.includes(size));
        if (!hasMatchingSize) return false;
      }

      if (filters.colors.length > 0) {
        const hasMatchingColor = product.colors?.some((color) => filters.colors.includes(color));
        if (!hasMatchingColor) return false;
      }

      return true;
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === "price_asc") return a.price - b.price;
      if (sortBy === "price_desc") return b.price - a.price;
      if (sortBy === "rating") return (b.averageRating || 0) - (a.averageRating || 0);
      if (sortBy === "newest")
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      return (b.salesCount || 0) - (a.salesCount || 0);
    });
  }, [products, filters, searchQuery, sortBy, inStockOnly]);

  const visibleProducts = filteredProducts.slice(0, visibleCount);
  const hasMore = visibleCount < filteredProducts.length;

  const removeFilter = (type: "size" | "color", value: string) => {
    if (type === "size") {
      setFilters((prev) => ({ ...prev, sizes: prev.sizes.filter((s) => s !== value) }));
    } else {
      setFilters((prev) => ({ ...prev, colors: prev.colors.filter((c) => c !== value) }));
    }
  };

  const clearAllFilters = () => {
    setFilters({ sizes: [], colors: [], priceRange: [0, maxPrice] });
    setSearchQuery("");
    setInStockOnly(false);
  };

  const hasActiveFilters =
    filters.sizes.length > 0 ||
    filters.colors.length > 0 ||
    inStockOnly ||
    searchQuery.trim().length > 0 ||
    filters.priceRange[0] > 0 ||
    filters.priceRange[1] < maxPrice;

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-24 md:pt-28 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto py-6 md:py-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-medium uppercase tracking-wider mb-3">
              <Sparkles className="h-3.5 w-3.5" />
              Curated Apparel
            </span>
            <h1 className="font-display text-4xl md:text-5xl font-medium mb-3">
              Shop Collection
            </h1>
            <p className="text-muted-foreground text-base md:text-lg">
              Explore tailored essentials and statement pieces. Add directly to your bag or
              preview your fit with AI Virtual Try-On.
            </p>
          </div>

          {/* Categories Strip */}
          <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 border ${
                  selectedCategory === cat
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "bg-card text-muted-foreground border-border hover:text-foreground hover:border-foreground/30"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search, Sort & Filter Toolbar */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 py-4 border-y border-border">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by product, brand, or style..."
                className="pl-9 bg-card"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setInStockOnly((v) => !v)}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium border transition-colors ${
                  inStockOnly
                    ? "bg-accent/15 text-accent border-accent/40"
                    : "bg-background text-muted-foreground border-border hover:text-foreground"
                }`}
              >
                {inStockOnly && <Check className="h-3.5 w-3.5" />}
                In Stock Only
              </button>

              <ProductFilters
                filters={filters}
                onFiltersChange={setFilters}
                availableSizes={availableSizes}
                availableColors={availableColors}
                maxPrice={maxPrice}
              />

              <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                <SelectTrigger className="w-[175px] h-9 text-sm">
                  <ArrowUpDown className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured">Most Popular</SelectItem>
                  <SelectItem value="newest">Newest Arrivals</SelectItem>
                  <SelectItem value="price_asc">Price: Low to High</SelectItem>
                  <SelectItem value="price_desc">Price: High to Low</SelectItem>
                  <SelectItem value="rating">Top Rated</SelectItem>
                </SelectContent>
              </Select>

              <div className="hidden sm:flex items-center gap-1 border-l border-border pl-3">
                <button
                  onClick={() => setGridView("large")}
                  title="3-column view"
                  className={`p-2 rounded-lg transition-colors ${
                    gridView === "large" ? "bg-secondary" : "hover:bg-muted"
                  }`}
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setGridView("small")}
                  title="4-column view"
                  className={`p-2 rounded-lg transition-colors ${
                    gridView === "small" ? "bg-secondary" : "hover:bg-muted"
                  }`}
                >
                  <Grid3X3 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Active Filters */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 pt-4">
              <span className="text-xs text-muted-foreground mr-1">Active filters:</span>
              {searchQuery.trim() && (
                <Badge variant="secondary" className="gap-1 pr-1">
                  Search: "{searchQuery.trim()}"
                  <button
                    onClick={() => setSearchQuery("")}
                    className="ml-1 hover:bg-muted rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {inStockOnly && (
                <Badge variant="secondary" className="gap-1 pr-1">
                  In Stock
                  <button
                    onClick={() => setInStockOnly(false)}
                    className="ml-1 hover:bg-muted rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {filters.sizes.map((size) => (
                <Badge key={size} variant="secondary" className="gap-1 pr-1">
                  Size: {size}
                  <button
                    onClick={() => removeFilter("size", size)}
                    className="ml-1 hover:bg-muted rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
              {filters.colors.map((color) => (
                <Badge key={color} variant="secondary" className="gap-1 pr-1 capitalize">
                  {color}
                  <button
                    onClick={() => removeFilter("color", color)}
                    className="ml-1 hover:bg-muted rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
              {(filters.priceRange[0] > 0 || filters.priceRange[1] < maxPrice) && (
                <Badge variant="secondary" className="gap-1 pr-1">
                  {formatPrice(filters.priceRange[0])} – {formatPrice(filters.priceRange[1])}
                  <button
                    onClick={() => setFilters((prev) => ({ ...prev, priceRange: [0, maxPrice] }))}
                    className="ml-1 hover:bg-muted rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-xs text-muted-foreground hover:text-foreground h-7"
              >
                Clear all
              </Button>
            </div>
          )}

          {/* Results Count */}
          <div className="py-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing <span className="font-medium text-foreground">{visibleProducts.length}</span>{" "}
              of <span className="font-medium text-foreground">{filteredProducts.length}</span>{" "}
              products
            </p>
          </div>

          {isLoading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-accent" />
            </div>
          )}

          {!isLoading && filteredProducts.length === 0 && (
            <div className="text-center py-20 bg-card rounded-2xl border border-border">
              <p className="font-display text-xl mb-2">No matching products found</p>
              <p className="text-sm text-muted-foreground mb-5">
                Try adjusting your category, search query, or active filters.
              </p>
              <Button variant="outline" onClick={clearAllFilters}>
                Reset All Filters
              </Button>
            </div>
          )}

          {!isLoading && visibleProducts.length > 0 && (
            <div
              className={`grid gap-5 md:gap-6 ${
                gridView === "large"
                  ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                  : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
              }`}
            >
              {visibleProducts.map((product) => (
                <div
                  key={product._id}
                  onClick={() => navigate(`/product/${product._id}`)}
                  className="cursor-pointer"
                >
                  <ProductCard
                    product={product}
                    onQuickView={(p) => setQuickViewProduct(p)}
                    rating={product.averageRating}
                    reviewCount={product.reviewCount}
                  />
                </div>
              ))}
            </div>
          )}

          {!isLoading && hasMore && (
            <div className="text-center pt-10">
              <Button
                variant="outline"
                size="lg"
                onClick={() => setVisibleCount((prev) => prev + 12)}
              >
                Load More Products ({filteredProducts.length - visibleCount} remaining)
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </div>
          )}
        </div>
      </div>

      <ProductQuickView
        product={quickViewProduct}
        open={!!quickViewProduct}
        onOpenChange={(open) => !open && setQuickViewProduct(null)}
      />

      <Footer />
    </main>
  );
};

export default ShopPage;
