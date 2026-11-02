import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import ProductQuickView from "@/components/ProductQuickView";
import ProductFilters, { FilterState } from "@/components/ProductFilters";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, Grid3X3, LayoutGrid, Loader2, X } from "lucide-react";
import { useProducts } from "@/hooks/useProducts";

const categories = ["All", "Blazers", "Dresses", "Trousers", "Shirts", "Sweaters", "Jackets"];

const ShopPage = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [gridView, setGridView] = useState<"small" | "large">("large");
  const [quickViewProduct, setQuickViewProduct] = useState<any>(null);
  
  const { data: products, isLoading } = useProducts(selectedCategory);
  const navigate = useNavigate();

  // Calculate available filter options from products
  const { availableSizes, availableColors, maxPrice } = useMemo(() => {
    if (!products?.length) return { availableSizes: [], availableColors: [], maxPrice: 1000 };
    
    const sizesSet = new Set<string>();
    const colorsSet = new Set<string>();
    let max = 0;
    
    products.forEach(product => {
      product.sizes?.forEach(size => sizesSet.add(size));
      product.colors?.forEach(color => colorsSet.add(color));
      if (product.price > max) max = product.price;
    });
    
    return {
      availableSizes: Array.from(sizesSet).sort((a, b) => {
        const sizeOrder = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
        return sizeOrder.indexOf(a) - sizeOrder.indexOf(b);
      }),
      availableColors: Array.from(colorsSet).sort(),
      maxPrice: Math.ceil(max / 100) * 100
    };
  }, [products]);

  const [filters, setFilters] = useState<FilterState>({
    sizes: [],
    colors: [],
    priceRange: [0, 1000],
  });

  // Update price range when maxPrice changes
  useMemo(() => {
    if (maxPrice > 0 && filters.priceRange[1] === 1000) {
      setFilters(prev => ({ ...prev, priceRange: [0, maxPrice] }));
    }
  }, [maxPrice]);

  // Filter products
  const filteredProducts = useMemo(() => {
    if (!products) return [];
    
    return products.filter(product => {
      // Price filter
      if (product.price < filters.priceRange[0] || product.price > filters.priceRange[1]) {
        return false;
      }
      
      // Size filter
      if (filters.sizes.length > 0) {
        const hasMatchingSize = product.sizes?.some(size => filters.sizes.includes(size));
        if (!hasMatchingSize) return false;
      }
      
      // Color filter
      if (filters.colors.length > 0) {
        const hasMatchingColor = product.colors?.some(color => filters.colors.includes(color));
        if (!hasMatchingColor) return false;
      }
      
      return true;
    });
  }, [products, filters]);

  const removeFilter = (type: 'size' | 'color', value: string) => {
    if (type === 'size') {
      setFilters(prev => ({ ...prev, sizes: prev.sizes.filter(s => s !== value) }));
    } else {
      setFilters(prev => ({ ...prev, colors: prev.colors.filter(c => c !== value) }));
    }
  };

  const clearPriceFilter = () => {
    setFilters(prev => ({ ...prev, priceRange: [0, maxPrice] }));
  };

  const hasActiveFilters = filters.sizes.length > 0 || filters.colors.length > 0 || 
    (filters.priceRange[0] > 0 || filters.priceRange[1] < maxPrice);

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-24 md:pt-28">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="text-center mb-8">
            <h1 className="font-display text-4xl md:text-5xl font-medium mb-4">
              Shop Collection
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Discover pieces that fit perfectly. Every item comes with AI size recommendations.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 py-6 border-y border-border">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                    selectedCategory === cat
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-4">
              <ProductFilters
                filters={filters}
                onFiltersChange={setFilters}
                availableSizes={availableSizes}
                availableColors={availableColors}
                maxPrice={maxPrice}
              />
              <div className="flex items-center gap-2 border-l border-border pl-4">
                <button
                  onClick={() => setGridView("large")}
                  className={`p-2 rounded-lg transition-colors ${gridView === "large" ? "bg-secondary" : "hover:bg-muted"}`}
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setGridView("small")}
                  className={`p-2 rounded-lg transition-colors ${gridView === "small" ? "bg-secondary" : "hover:bg-muted"}`}
                >
                  <Grid3X3 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Active Filters */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 py-4">
              <span className="text-sm text-muted-foreground mr-2">Active filters:</span>
              {filters.sizes.map(size => (
                <Badge key={size} variant="secondary" className="gap-1 pr-1">
                  Size: {size}
                  <button onClick={() => removeFilter('size', size)} className="ml-1 hover:bg-muted rounded-full p-0.5">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
              {filters.colors.map(color => (
                <Badge key={color} variant="secondary" className="gap-1 pr-1 capitalize">
                  {color}
                  <button onClick={() => removeFilter('color', color)} className="ml-1 hover:bg-muted rounded-full p-0.5">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
              {(filters.priceRange[0] > 0 || filters.priceRange[1] < maxPrice) && (
                <Badge variant="secondary" className="gap-1 pr-1">
                  ${filters.priceRange[0]} - ${filters.priceRange[1]}
                  <button onClick={clearPriceFilter} className="ml-1 hover:bg-muted rounded-full p-0.5">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFilters({ sizes: [], colors: [], priceRange: [0, maxPrice] })}
                className="text-muted-foreground hover:text-foreground"
              >
                Clear all
              </Button>
            </div>
          )}

          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              Showing {filteredProducts.length} of {products?.length || 0} products
            </p>
          </div>

          {isLoading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-accent" />
            </div>
          )}

          {!isLoading && filteredProducts.length === 0 && (
            <div className="text-center py-20">
              <p className="text-lg text-muted-foreground mb-4">No products match your filters</p>
              <Button 
                variant="outline"
                onClick={() => setFilters({ sizes: [], colors: [], priceRange: [0, maxPrice] })}
              >
                Clear Filters
              </Button>
            </div>
          )}

          {!isLoading && filteredProducts.length > 0 && (
            <div className={`grid gap-6 md:gap-8 ${
              gridView === "large" ? "grid-cols-2 md:grid-cols-3" : "grid-cols-2 md:grid-cols-4"
            }`}>
              {filteredProducts.map((product) => (
                <div key={product._id} onClick={() => navigate(`/product/${product._id}`)} className="cursor-pointer">
                  <ProductCard 
                    product={product}
                    onQuickView={(p) => { setQuickViewProduct(p); }}
                    onAddToCart={(p) => { setQuickViewProduct(p); }}
                  />
                </div>
              ))}
            </div>
          )}

          {!isLoading && filteredProducts.length > 0 && filteredProducts.length >= 12 && (
            <div className="text-center py-12">
              <Button variant="outline" size="lg">
                Load More Products
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
