import { Link } from "react-router-dom";
import { Heart, ShoppingBag, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/formatCurrency";

interface Product {
  id: number;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  isNew?: boolean;
}

const products: Product[] = [
  {
    id: 1,
    name: "Tailored Wool Blazer",
    brand: "Modern Classics",
    price: 3499,
    originalPrice: 4499,
    image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=700&auto=format&fit=crop",
    category: "Outerwear",
    isNew: true,
  },
  {
    id: 2,
    name: "Silk Evening Dress",
    brand: "Elegance",
    price: 4599,
    image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=700&auto=format&fit=crop",
    category: "Dresses",
  },
  {
    id: 3,
    name: "Premium Cotton Shirt",
    brand: "Essential",
    price: 1299,
    image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=700&auto=format&fit=crop",
    category: "Tops",
    isNew: true,
  },
  {
    id: 4,
    name: "High-Waist Trousers",
    brand: "Modern Classics",
    price: 1899,
    originalPrice: 2499,
    image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=700&auto=format&fit=crop",
    category: "Bottoms",
  },
  {
    id: 5,
    name: "Cashmere Sweater",
    brand: "Luxe Knit",
    price: 3499,
    image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=700&auto=format&fit=crop",
    category: "Knitwear",
  },
  {
    id: 6,
    name: "Linen Summer Blazer",
    brand: "FitKart Atelier",
    price: 2799,
    image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=700&auto=format&fit=crop",
    category: "Outerwear",
    isNew: true,
  },
];

const FeaturedProductCard = ({ product }: { product: Product }) => {
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  return (
    <div className="group relative bg-card rounded-2xl border border-border/60 overflow-hidden shadow-card hover:shadow-elegant hover:border-accent/30 transition-all duration-400 flex flex-col">
      {/* Image */}
      <div className="relative aspect-[3/4] overflow-hidden bg-muted/40">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-108"
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.isNew && (
            <Badge className="bg-accent text-accent-foreground text-[10px] font-semibold uppercase tracking-wide px-2.5">
              New
            </Badge>
          )}
          {discount && (
            <Badge variant="destructive" className="text-[10px] font-semibold">
              -{discount}%
            </Badge>
          )}
        </div>

        {/* Wishlist button */}
        <button className="absolute top-3 right-3 w-8 h-8 rounded-full bg-background/85 backdrop-blur-sm border border-border/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-background hover:border-accent/40 hover:scale-110">
          <Heart className="h-3.5 w-3.5 text-muted-foreground hover:text-accent transition-colors" />
        </button>

        {/* CTA overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-3 flex gap-2 opacity-0 group-hover:opacity-100 translate-y-3 group-hover:translate-y-0 transition-all duration-300">
          <Button variant="gold" size="sm" className="flex-1 gap-1.5 shadow-sm text-xs font-semibold">
            <ShoppingBag className="h-3.5 w-3.5" />
            Add to Cart
          </Button>
          <Link to="/shop">
            <Button
              variant="secondary"
              size="icon"
              className="h-8 w-8 bg-background/90 hover:bg-background border border-border/40 shrink-0"
            >
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <p className="text-[11px] text-accent uppercase tracking-widest font-semibold mb-1">
          {product.brand}
        </p>
        <h3 className="font-medium text-sm leading-snug mb-2.5 group-hover:text-accent transition-colors line-clamp-1">
          {product.name}
        </h3>
        <div className="flex items-center gap-2">
          <span className="font-bold text-base">{formatPrice(product.price)}</span>
          {product.originalPrice && (
            <span className="text-xs text-muted-foreground line-through">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

const FeaturedProducts = () => {
  return (
    <section className="py-20 md:py-28 bg-gradient-subtle">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12 md:mb-14">
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="section-divider" />
              <span className="text-accent font-semibold text-xs uppercase tracking-widest">
                Curated For You
              </span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-medium">
              Featured Collection
            </h2>
          </div>
          <Link to="/shop">
            <Button
              variant="outline"
              className="gap-2 border-border hover:border-accent/50 hover:bg-accent/5 group text-sm"
            >
              View All Products
              <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Button>
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-5">
          {products.map((product) => (
            <FeaturedProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
