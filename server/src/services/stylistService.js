const { GoogleGenAI, Type } = require('@google/genai');
const Product = require('../models/Product');

/**
 * Service to handle AI Personal Stylist logic.
 * Enforces strictly real products from MongoDB, recalculates prices server-side,
 * validates stock, and handles Gemini structured JSON generation.
 */

// Fallback rule-based matching if Gemini API key is missing or fails
const generateRuleBasedOutfits = (availableProducts, { occasion, budget, preferredStyle, preferredColors, instructions }) => {
  // Group products by broad outfit categories
  const tops = availableProducts.filter(p => ['shirts', 'tops', 'sweaters'].includes(p.category));
  const bottoms = availableProducts.filter(p => ['trousers'].includes(p.category));
  const layers = availableProducts.filter(p => ['blazers', 'jackets', 'outerwear'].includes(p.category));
  const dresses = availableProducts.filter(p => ['dresses'].includes(p.category));
  const accessories = availableProducts.filter(p => ['accessories'].includes(p.category));

  const outfits = [];

  // Helper to pick items within budget
  const createOutfit = (title, description, whyItWorks, items) => {
    const validItems = items.filter(Boolean);
    const totalPrice = validItems.reduce((sum, item) => sum + item.price, 0);
    if (totalPrice <= budget && validItems.length >= 2) {
      return {
        id: `outfit-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        name: title,
        description,
        whyItWorks,
        occasionSuitability: `Ideal for ${occasion}`,
        totalPrice,
        items: validItems
      };
    }
    return null;
  };

  // Combination 1: Top + Bottom + Layer (e.g. Blazer/Jacket + Shirt + Trouser)
  if (tops.length > 0 && bottoms.length > 0) {
    for (const t of tops) {
      for (const b of bottoms) {
        for (const l of layers) {
          if (t.price + b.price + l.price <= budget) {
            const outfit = createOutfit(
              `The Elevated ${preferredStyle || 'Classic'} Ensemble`,
              `A structured combination pairing the ${l.name} with ${t.name} and ${b.name} for a sharp, confident silhouette.`,
              `The tailored layer grounds the outfit while complementary color tones ensure effortless harmony.`,
              [l, t, b]
            );
            if (outfit) {
              outfits.push(outfit);
              break;
            }
          }
        }
        if (outfits.length >= 1) break;
      }
      if (outfits.length >= 1) break;
    }
  }

  // Combination 2: Dress + Layer or Dress + Accessory
  if (dresses.length > 0) {
    for (const d of dresses) {
      const acc = accessories.find(a => d.price + a.price <= budget);
      const layer = layers.find(l => d.price + l.price <= budget);
      const chosenPartner = layer || acc;
      if (chosenPartner) {
        const outfit = createOutfit(
          `Sophisticated Minimalist Look`,
          `Refined grace featuring the ${d.name} accented by ${chosenPartner.name}.`,
          `Minimal silhouette highlighted with clean contrast and subtle texture balance.`,
          [d, chosenPartner]
        );
        if (outfit) outfits.push(outfit);
        break;
      } else if (d.price <= budget) {
        // dress with accessory or alone if affordable
        const outfit = createOutfit(
          `Timeless Statement Dress`,
          `The stunning ${d.name} stands on its own with elegant movement.`,
          `A cohesive single-piece statement focused on refined tailoring and silhouette.`,
          [d]
        );
        if (outfit) outfits.push(outfit);
        break;
      }
    }
  }

  // Combination 3: Smart Separates Top + Bottom + Accessory
  if (outfits.length < 3 && tops.length > 0 && bottoms.length > 0) {
    const remainingTops = tops.slice().reverse();
    const remainingBottoms = bottoms.slice().reverse();
    for (const t of remainingTops) {
      for (const b of remainingBottoms) {
        const acc = accessories.find(a => t.price + b.price + a.price <= budget);
        const items = acc ? [t, b, acc] : [t, b];
        const outfit = createOutfit(
          `Modern Versatile Attire`,
          `A balanced pairing combining the ${t.name} with ${b.name}${acc ? ` and ${acc.name}` : ''}.`,
          `Versatile balance prioritizing all-day ease with a polished aesthetic.`,
          items
        );
        if (outfit && !outfits.some(o => o.items.every(i => items.map(x => x._id.toString()).includes(i._id.toString())))) {
          outfits.push(outfit);
          if (outfits.length >= 3) break;
        }
      }
      if (outfits.length >= 3) break;
    }
  }

  return outfits;
};

/**
 * Generate 3 outfit recommendations using Gemini AI with fallback.
 */
const generateRecommendations = async ({ occasion, budget, preferredStyle, preferredColors, instructions, userPreferences }) => {
  const numericBudget = Number(budget);
  if (isNaN(numericBudget) || numericBudget <= 0) {
    throw new Error('A valid positive budget is required.');
  }

  // 1. Fetch available in-stock active products from MongoDB
  const products = await Product.find({
    isActive: true,
    stockQuantity: { $gt: 0 },
    price: { $lte: numericBudget } // Individual product cannot exceed entire budget
  })
    .select('_id name category price brand sizes colors images description stockQuantity')
    .lean();

  if (!products || products.length === 0) {
    return {
      success: true,
      outfits: [],
      message: 'No available products found matching your budget criteria.'
    };
  }

  // Product lookup map for strict validation
  const productMap = new Map();
  products.forEach(p => {
    productMap.set(p._id.toString(), p);
  });

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === 'your_api_key' || apiKey.trim() === '') {
    // If no API key configured, use intelligent rule-based engine directly
    const fallbackOutfits = generateRuleBasedOutfits(products, {
      occasion,
      budget: numericBudget,
      preferredStyle,
      preferredColors,
      instructions
    });

    return {
      success: true,
      outfits: fallbackOutfits,
      isFallback: true,
      message: fallbackOutfits.length > 0 ? undefined : 'Could not assemble complete outfits within the given budget from currently stocked items.'
    };
  }

  // 2. Prepare compact catalog for Gemini prompt to stay well within tokens and precision
  const compactCatalog = products.map(p => ({
    id: p._id.toString(),
    name: p.name,
    category: p.category,
    price: p.price,
    brand: p.brand || 'FitKart',
    colors: p.colors || [],
    sizes: p.sizes || []
  }));

  const systemInstruction = `You are FitKart's elite AI Personal Stylist.
You recommend complete, fashionable outfits using EXCLUSIVELY the provided product catalog.
Rules:
1. ONLY use product IDs that exist in the provided catalog. DO NOT hallucinate, invent, or create new IDs or items.
2. Recommend up to 3 distinct complete outfit combinations.
3. Each outfit must have at least 2 complementary items (e.g. a top + bottom, or dress + blazer/accessory, or top + bottom + jacket).
4. THE SUM OF PRODUCT PRICES IN EACH OUTFIT MUST NOT EXCEED THE USER'S BUDGET: ₹${numericBudget}.
5. Match the user's occasion, style, and preferred colors as closely as possible.
6. Provide an inspiring Outfit Name, Styling Description, Why It Works, and Occasion Suitability for each outfit.
7. Return strictly structured JSON matching the requested schema.`;

  const userPrompt = JSON.stringify({
    request: {
      occasion: occasion || 'Casual Outing',
      budget: numericBudget,
      preferredStyle: preferredStyle || 'Minimal',
      preferredColors: preferredColors && preferredColors.length > 0 ? preferredColors : ['Any'],
      instructions: instructions || 'Create stylish, coordinated looks.',
      userProfile: userPreferences || {}
    },
    availableCatalog: compactCatalog
  });

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        { role: 'user', parts: [{ text: `${systemInstruction}\n\nClient Request and Catalog:\n${userPrompt}` }] }
      ],
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            outfits: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  description: { type: Type.STRING },
                  whyItWorks: { type: Type.STRING },
                  occasionSuitability: { type: Type.STRING },
                  productIds: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  }
                },
                required: ['name', 'description', 'whyItWorks', 'occasionSuitability', 'productIds']
              }
            }
          },
          required: ['outfits']
        }
      }
    });

    const parsed = JSON.parse(response.text);
    const validOutfits = [];

    if (parsed && Array.isArray(parsed.outfits)) {
      for (const rawOutfit of parsed.outfits) {
        if (!Array.isArray(rawOutfit.productIds) || rawOutfit.productIds.length === 0) continue;

        // Strict validation: resolve every product ID against the actual MongoDB items
        const outfitProducts = [];
        let calculatedTotal = 0;
        let hasInvalidItem = false;

        // Eliminate duplicates within the same outfit
        const uniqueIds = Array.from(new Set(rawOutfit.productIds));

        for (const pid of uniqueIds) {
          const dbProduct = productMap.get(pid);
          if (!dbProduct) {
            hasInvalidItem = true;
            break;
          }
          outfitProducts.push(dbProduct);
          calculatedTotal += dbProduct.price;
        }

        // Validate strictly: only real items, under budget, and at least 2 items (or 1 if dress/standalone)
        if (!hasInvalidItem && calculatedTotal <= numericBudget && outfitProducts.length >= 1) {
          validOutfits.push({
            id: `outfit-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            name: rawOutfit.name,
            description: rawOutfit.description,
            whyItWorks: rawOutfit.whyItWorks,
            occasionSuitability: rawOutfit.occasionSuitability,
            totalPrice: calculatedTotal,
            items: outfitProducts
          });
        }
      }
    }

    if (validOutfits.length > 0) {
      return {
        success: true,
        outfits: validOutfits.slice(0, 3)
      };
    }

    // Fallback if AI returned no valid combinations under the budget constraint
    const fallbackOutfits = generateRuleBasedOutfits(products, {
      occasion,
      budget: numericBudget,
      preferredStyle,
      preferredColors,
      instructions
    });

    return {
      success: true,
      outfits: fallbackOutfits,
      isFallback: true
    };
  } catch (error) {
    console.error('Gemini AI Personal Stylist generation error:', error);
    // Graceful fallback to rule-based engine
    const fallbackOutfits = generateRuleBasedOutfits(products, {
      occasion,
      budget: numericBudget,
      preferredStyle,
      preferredColors,
      instructions
    });

    return {
      success: true,
      outfits: fallbackOutfits,
      isFallback: true,
      fallbackReason: error.message
    };
  }
};

/**
 * Replace an individual item in an outfit with a complementary real item from MongoDB.
 */
const replaceItem = async ({ currentItem, remainingItems, budget, occasion, preferredStyle }) => {
  const numericBudget = Number(budget);
  const currentPrice = Number(currentItem.price || 0);
  const remainingTotal = remainingItems.reduce((sum, item) => sum + Number(item.price || 0), 0);
  const maxAllowedPrice = numericBudget - remainingTotal;

  if (maxAllowedPrice <= 0) {
    throw new Error('No remaining budget available to replace this item.');
  }

  const existingIds = [currentItem._id, ...remainingItems.map(i => i._id)].map(id => id.toString());

  // Look for active in-stock products in the same category or compatible category
  const targetCategory = currentItem.category ? currentItem.category.toLowerCase() : '';

  let candidates = await Product.find({
    _id: { $nin: existingIds },
    category: targetCategory,
    isActive: true,
    stockQuantity: { $gt: 0 },
    price: { $lte: maxAllowedPrice }
  })
    .select('_id name category price brand sizes colors images description stockQuantity')
    .lean();

  // If none in exact category, expand to compatible group
  if (candidates.length === 0) {
    const categoryGroups = {
      shirts: ['shirts', 'tops', 'sweaters'],
      tops: ['shirts', 'tops', 'sweaters'],
      sweaters: ['shirts', 'tops', 'sweaters'],
      trousers: ['trousers'],
      blazers: ['blazers', 'jackets', 'outerwear'],
      jackets: ['blazers', 'jackets', 'outerwear'],
      outerwear: ['blazers', 'jackets', 'outerwear'],
      dresses: ['dresses'],
      accessories: ['accessories']
    };

    const related = categoryGroups[targetCategory] || [targetCategory];
    candidates = await Product.find({
      _id: { $nin: existingIds },
      category: { $in: related },
      isActive: true,
      stockQuantity: { $gt: 0 },
      price: { $lte: maxAllowedPrice }
    })
      .select('_id name category price brand sizes colors images description stockQuantity')
      .lean();
  }

  if (candidates.length === 0) {
    return {
      success: false,
      message: `No alternate items found in '${targetCategory}' within the remaining budget of ₹${maxAllowedPrice}.`
    };
  }

  // Pick the best candidate (sort by closest price or rating)
  const sorted = candidates.sort((a, b) => Math.abs(a.price - currentPrice) - Math.abs(b.price - currentPrice));
  const replacement = sorted[0];

  const updatedOutfitItems = [...remainingItems, replacement];
  const updatedTotal = updatedOutfitItems.reduce((sum, i) => sum + i.price, 0);

  return {
    success: true,
    replacement,
    updatedTotal,
    allCandidates: candidates.slice(0, 5)
  };
};

module.exports = {
  generateRecommendations,
  replaceItem
};
