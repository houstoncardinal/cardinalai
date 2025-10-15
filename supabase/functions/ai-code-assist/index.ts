import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { mode, code, language, context } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const systemPrompts: Record<string, string> = {
      explain: "You are a code explanation expert. Explain the provided code clearly and concisely, focusing on what it does and how it works.",
      refactor: "You are a code refactoring expert. Suggest improvements to make the code more efficient, readable, and maintainable. Provide the refactored code with brief explanations.",
      test: "You are a testing expert. Generate comprehensive unit tests for the provided code. Use appropriate testing frameworks and cover edge cases.",
      fix: "You are a debugging expert. Analyze the code and errors, identify issues, and provide fixed code with explanations of what was wrong.",
      chat: "You are an AI coding assistant. Help the developer with their question about the code. Be concise and practical."
    };

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { 
            role: "system", 
            content: systemPrompts[mode] || systemPrompts.chat
          },
          {
            role: "user",
            content: `Language: ${language}\n\n${context ? `Context: ${context}\n\n` : ""}Code:\n\`\`\`${language}\n${code}\n\`\`\``
          }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits to your workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const error = await response.text();
      console.error("AI gateway error:", response.status, error);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const result = data.choices[0]?.message?.content || "No response generated";

    return new Response(
      JSON.stringify({ result }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in ai-code-assist:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
