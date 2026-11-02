import { Heart, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
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
    image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&auto=format&fit=crop",
    category: "Outerwear",
    isNew: true,
  },
  {
    id: 2,
    name: "Silk Evening Dress",
    brand: "Elegance",
    price: 4599,
    image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&auto=format&fit=crop",
    category: "Dresses",
  },
  {
    id: 3,
    name: "Premium Cotton Shirt",
    brand: "Essential",
    price: 1299,
    image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&auto=format&fit=crop",
    category: "Tops",
    isNew: true,
  },
  {
    id: 4,
    name: "High-Waist Trousers",
    brand: "Modern Classics",
    price: 1899,
    originalPrice: 2499,
    image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=600&auto=format&fit=crop",
    category: "Bottoms",
  },
  {
    id: 5,
    name: "Cashmere Sweater",
    brand: "Luxe Knit",
    price: 3499,
    image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&auto=format&fit=crop",
    category: "Knitwear",
  },
  {
    id: 6,
    name: "Leather Midi Skirt",
    brand: "Edge",
    price: 2799,
    image: "https://images.unsplash.com/photo-1583496661160-fb5886a0uj7a?w=600&auto=format&fit=crop",
    category: "Bottoms",
    isNew: true,
  },
];

const ProductCard = ({ product }: { product: Product }) => {
  return (
    <div className="group relative">
      {/* Image Container */}
      <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-muted mb-4">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/10 transition-colors duration-300" />
        
        {/* Quick Actions */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button className="w-10 h-10 rounded-full bg-background/90 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors shadow-md">
            <Heart className="h-5 w-5 text-foreground" />
          </button>
        </div>

        {/* Try On Button */}
        <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
          <Button variant="gold" className="w-full">
            Virtual Try-On
          </Button>
        </div>

        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {product.isNew && (
            <span className="px-3 py-1 bg-accent text-accent-foreground text-xs font-medium rounded-full">
              New
            </span>
          )}
          {product.originalPrice && (
            <span className="px-3 py-1 bg-destructive text-destructive-foreground text-xs font-medium rounded-full">
              Sale
            </span>
          )}
        </div>
      </div>

      {/* Product Info */}
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
          {product.brand}
        </p>
        <h3 className="font-medium mb-2 group-hover:text-accent transition-colors">
          {product.name}
        </h3>
        <div className="flex items-center gap-2">
          <span className="font-semibold">{formatPrice(product.price)}</span>
          {product.originalPrice && (
            <span className="text-sm text-muted-foreground line-through">
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
    <section className="py-20 md:py-32">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12 md:mb-16">
          <div>
            <span className="text-accent font-medium text-sm uppercase tracking-wider">Curated For You</span>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-medium mt-4">
              Featured Collection
            </h2>
          </div>
          <Link to="/shop">
            <Button variant="minimal" className="text-base">
              View All Products
            </Button>
          </Link>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
