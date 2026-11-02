import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CartItem {
  id: string;
  product_id: string;
  size: string;
  color: string | null;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
    images: string[] | null;
    brand: string | null;
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeSecretKey) {
      console.error("STRIPE_SECRET_KEY not found");
      throw new Error("Stripe is not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    
    // Get auth header to verify user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error("User auth error:", userError);
      throw new Error("Unauthorized");
    }

    console.log("Authenticated user:", user.id);

    const { items, successUrl, cancelUrl } = await req.json();
    
    if (!items || items.length === 0) {
      throw new Error("No items in cart");
    }

    console.log("Creating checkout for items:", items.length);

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2023-10-16",
    });

    // Create line items for Stripe
    const lineItems = items.map((item: CartItem) => ({
      price_data: {
        currency: "inr",
        product_data: {
          name: item.product.name,
          description: `Size: ${item.size}${item.color ? `, Color: ${item.color}` : ""}`,
          images: item.product.images?.slice(0, 1) || [],
        },
        unit_amount: Math.round(item.product.price * 100), // Convert to paise
      },
      quantity: item.quantity,
    }));

    // Create Stripe Checkout Session
    // Note: For India-based Stripe accounts, billing/shipping address is required for export transactions
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: successUrl || `${req.headers.get("origin")}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${req.headers.get("origin")}/checkout/cancel`,
      customer_email: user.email,
      billing_address_collection: "required",
      shipping_address_collection: {
        allowed_countries: ["US", "CA", "GB", "AU", "DE", "FR", "IT", "ES", "NL", "BE", "AT", "CH", "SE", "NO", "DK", "FI", "IE", "PT", "PL", "CZ", "HU", "RO", "BG", "HR", "SK", "SI", "LT", "LV", "EE", "MT", "CY", "LU", "GR", "JP", "KR", "SG", "HK", "TW", "MY", "TH", "PH", "ID", "VN", "IN", "AE", "SA", "QA", "KW", "BH", "OM", "ZA", "NG", "KE", "EG", "MX", "BR", "AR", "CL", "CO", "PE", "NZ"],
      },
      metadata: {
        user_id: user.id,
      },
    });

    console.log("Stripe session created:", session.id);

    // Create order in database with pending status
    const orderItems = items.map((item: CartItem) => ({
      product_id: item.product_id,
      product_name: item.product.name,
      size: item.size,
      color: item.color,
      quantity: item.quantity,
      price: item.product.price,
    }));

    const totalAmount = items.reduce(
      (sum: number, item: CartItem) => sum + item.product.price * item.quantity,
      0
    );

    const { error: orderError } = await supabase.from("orders").insert({
      user_id: user.id,
      items: orderItems,
      total_amount: totalAmount,
      status: "pending",
    });

    if (orderError) {
      console.error("Error creating order:", orderError);
      // Don't throw, still redirect to Stripe
    }

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An error occurred";
    console.error("Checkout error:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
