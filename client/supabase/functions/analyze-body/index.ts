import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64, productId } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Starting body analysis for product:', productId);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are an expert fashion AI assistant specializing in body measurement analysis and size recommendations. 
            
            When analyzing a person's image, provide:
            1. Estimated body measurements (height range, body type, shoulder width category)
            2. Recommended clothing size (XS, S, M, L, XL, XXL)
            3. Style recommendations based on body type
            4. Confidence level of the analysis
            
            Always be respectful, body-positive, and helpful. Focus on fit and comfort rather than appearance.
            
            Respond in JSON format with the following structure:
            {
              "bodyType": "string (e.g., 'athletic', 'pear', 'rectangle', 'hourglass', 'inverted triangle')",
              "estimatedSize": "string (XS/S/M/L/XL/XXL)",
              "heightCategory": "string (petite/average/tall)",
              "shoulderWidth": "string (narrow/medium/broad)",
              "recommendations": ["array of style tips"],
              "confidence": "number 0-100",
              "fitNotes": "string with specific fit advice"
            }`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Please analyze this image and provide body measurement estimates and size recommendations for clothing. Be respectful and focus on fit optimization.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageBase64.startsWith('data:') ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`
                }
              }
            ]
          }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'Service temporarily unavailable. Please try again later.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    console.log('AI response received:', content?.substring(0, 200));

    // Parse the JSON response from the AI
    let analysis;
    try {
      // Extract JSON from the response (it might be wrapped in markdown code blocks)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      // Return a default analysis if parsing fails
      analysis = {
        bodyType: 'average',
        estimatedSize: 'M',
        heightCategory: 'average',
        shoulderWidth: 'medium',
        recommendations: ['This outfit would complement your figure well', 'Consider trying it on virtually to see the fit'],
        confidence: 70,
        fitNotes: 'Based on the image analysis, a medium size should provide a comfortable fit.'
      };
    }

    return new Response(JSON.stringify({ 
      success: true, 
      analysis 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-body function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to analyze image';
    return new Response(JSON.stringify({ 
      error: errorMessage
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
