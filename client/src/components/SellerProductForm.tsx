import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import api from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Upload, X, Loader2, Plus } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

const CATEGORIES = ["tops", "bottoms", "dresses", "outerwear", "blazers", "shirts", "trousers", "sweaters", "jackets", "accessories"];
const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "28", "30", "32", "34", "36", "38"];
const COLORS = ["Black", "White", "Navy", "Gray", "Beige", "Brown", "Red", "Blue", "Green", "Pink", "Charcoal", "Khaki", "Olive", "Cream", "Camel"];

interface SellerProductFormProps {
  onSuccess?: () => void;
}

const SellerProductForm = ({ onSuccess }: SellerProductFormProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [brand, setBrand] = useState("");
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [stockQuantity, setStockQuantity] = useState("10");
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImages(prev => [...prev, ...files]);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const toggleSize = (size: string) => {
    setSelectedSizes(prev => prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]);
  };

  const toggleColor = (color: string) => {
    setSelectedColors(prev => prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price || !category || selectedSizes.length === 0) {
      toast.error("Please fill in all required fields");
      return;
    }
    if (!user || user.role !== 'admin') {
      toast.error("Admin access required to add products");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description);
      formData.append("price", price);
      formData.append("category", category);
      formData.append("brand", brand);
      formData.append("stockQuantity", stockQuantity);
      selectedSizes.forEach(s => formData.append("sizes", s));
      selectedColors.forEach(c => formData.append("colors", c));
      images.forEach(img => formData.append("images", img));

      await api.post("/products", formData, { headers: { "Content-Type": "multipart/form-data" } });

      toast.success("Product added successfully!");
      queryClient.invalidateQueries({ queryKey: ["products"] });
      
      // Reset form
      setName(""); setDescription(""); setPrice(""); setCategory(""); setBrand(""); setStockQuantity("10");
      setSelectedSizes([]); setSelectedColors([]); setImages([]); setImagePreviews([]);
      onSuccess?.();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to add product");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Product Name *</Label>
          <Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder="Enter product name" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="brand">Brand</Label>
          <Input id="brand" value={brand} onChange={e => setBrand(e.target.value)} placeholder="Brand name" />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" value={description} onChange={e => setDescription(e.target.value)} placeholder="Product description..." rows={3} />
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price">Price (₹) *</Label>
          <Input id="price" type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="0.00" min="0" step="0.01" required />
        </div>
        <div className="space-y-2">
          <Label>Category *</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
            <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="stock">Stock Quantity</Label>
          <Input id="stock" type="number" value={stockQuantity} onChange={e => setStockQuantity(e.target.value)} min="0" />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Sizes * <span className="text-xs text-muted-foreground">(select all that apply)</span></Label>
        <div className="flex flex-wrap gap-2">
          {SIZES.map(size => (
            <button type="button" key={size} onClick={() => toggleSize(size)}
              className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${selectedSizes.includes(size) ? 'border-accent bg-accent/10 text-accent' : 'border-border hover:border-accent/50'}`}>
              {size}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Colors <span className="text-xs text-muted-foreground">(select all that apply)</span></Label>
        <div className="flex flex-wrap gap-2">
          {COLORS.map(color => (
            <button type="button" key={color} onClick={() => toggleColor(color)}
              className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${selectedColors.includes(color) ? 'border-accent bg-accent/10 text-accent' : 'border-border hover:border-accent/50'}`}>
              {color}
            </button>
          ))}
        </div>
      </div>

      {/* Images */}
      <div className="space-y-2">
        <Label>Product Images</Label>
        <div className="flex flex-wrap gap-3">
          {imagePreviews.map((preview, i) => (
            <div key={i} className="relative w-24 h-32 rounded-lg overflow-hidden bg-muted">
              <img src={preview} alt="" className="w-full h-full object-cover" />
              <button type="button" onClick={() => removeImage(i)}
                className="absolute top-1 right-1 w-6 h-6 rounded-full bg-background/80 flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground transition-colors">
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          <label className="w-24 h-32 rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-accent/50 transition-colors">
            <Upload className="h-6 w-6 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Add Image</span>
            <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} multiple />
          </label>
        </div>
      </div>

      <Button type="submit" variant="gold" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Adding Product...</> : <><Plus className="h-4 w-4 mr-2" />Add Product</>}
      </Button>
    </form>
  );
};

export default SellerProductForm;
