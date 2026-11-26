import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface StylistProduct {
  _id: string;
  name: string;
  price: number;
  category: string;
  brand: string;
  sizes: string[];
  colors: string[];
  images: string[];
  description?: string;
  stockQuantity: number;
}

export interface OutfitRecommendation {
  id: string;
  name: string;
  description: string;
  whyItWorks: string;
  occasionSuitability: string;
  totalPrice: number;
  items: StylistProduct[];
}

export interface RecommendParams {
  occasion: string;
  budget: number;
  preferredStyle: string;
  preferredColors: string[];
  instructions?: string;
}

export const useStylist = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [outfits, setOutfits] = useState<OutfitRecommendation[]>([]);
  const [replacingItemId, setReplacingItemId] = useState<string | null>(null);

  const recommendMutation = useMutation({
    mutationFn: async (params: RecommendParams) => {
      const { data } = await api.post("/stylist/recommend", params);
      return data;
    },
    onSuccess: (data) => {
      if (data.success && Array.isArray(data.outfits)) {
        setOutfits(data.outfits);
        if (data.outfits.length === 0) {
          toast.info(data.message || "No complete outfits could be generated with the given budget.");
        } else {
          toast.success(`Curated ${data.outfits.length} complete outfit combinations!`);
        }
      } else {
        toast.error(data.message || "Failed to generate recommendations.");
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || error.message || "Error generating styling recommendations.");
    },
  });

  const replaceItemMutation = useMutation({
    mutationFn: async ({
      outfitId,
      currentItem,
      remainingItems,
      budget,
      occasion,
      preferredStyle,
    }: {
      outfitId: string;
      currentItem: StylistProduct;
      remainingItems: StylistProduct[];
      budget: number;
      occasion: string;
      preferredStyle: string;
    }) => {
      setReplacingItemId(currentItem._id);
      const { data } = await api.post("/stylist/replace-item", {
        currentItem,
        remainingItems,
        budget,
        occasion,
        preferredStyle,
      });
      return { outfitId, ...data };
    },
    onSuccess: (data) => {
      setReplacingItemId(null);
      if (data.success && data.replacement) {
        setOutfits((prev) =>
          prev.map((outfit) => {
            if (outfit.id !== data.outfitId) return outfit;
            const updatedItems = outfit.items.map((item) =>
              item._id === data.replacement._id || item._id === data.replacement._id
                ? data.replacement
                : item
            );
            // Replace the item that matches the previous target
            const replacedItems = outfit.items.map((item) => {
              if (item._id === (data as any).currentItem?._id || item._id === replacingItemId) {
                return data.replacement;
              }
              return item;
            });

            // Recalculate total price precisely
            const newTotal = replacedItems.reduce((acc, curr) => acc + curr.price, 0);

            return {
              ...outfit,
              items: replacedItems,
              totalPrice: newTotal,
            };
          })
        );
        toast.success(`Item replaced with ${data.replacement.name}!`);
      } else {
        toast.info(data.message || "Could not find an alternate replacement item.");
      }
    },
    onError: (error: any) => {
      setReplacingItemId(null);
      toast.error(error.response?.data?.message || error.message || "Failed to replace item.");
    },
  });

  return {
    outfits,
    setOutfits,
    isGenerating: recommendMutation.isPending,
    isReplacing: replaceItemMutation.isPending,
    replacingItemId,
    getRecommendations: recommendMutation.mutateAsync,
    replaceItem: replaceItemMutation.mutateAsync,
  };
};
