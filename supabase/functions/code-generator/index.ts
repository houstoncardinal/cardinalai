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
    const { prompt, framework } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const frameworkTemplates: Record<string, { ext: string; lang: string; system: string }> = {
      react: {
        ext: 'tsx',
        lang: 'typescript',
        system: 'You are an expert React + TypeScript developer. Generate clean, modern, production-ready React components using TypeScript, Tailwind CSS, and best practices. Include proper types, props interfaces, and comments. Make code reusable and maintainable.'
      },
      vue: {
        ext: 'vue',
        lang: 'vue',
        system: 'You are an expert Vue 3 developer. Generate clean, modern Vue 3 components using Composition API, TypeScript, and best practices. Use <script setup> syntax and include proper types.'
      },
      angular: {
        ext: 'ts',
        lang: 'typescript',
        system: 'You are an expert Angular developer. Generate clean, modern Angular components using TypeScript, RxJS, and best practices. Follow Angular style guide and include proper decorators and types.'
      },
      node: {
        ext: 'ts',
        lang: 'typescript',
        system: 'You are an expert Node.js backend developer. Generate clean, modern Node.js API code using TypeScript, Express, and best practices. Include proper error handling, validation, and types.'
      },
      python: {
        ext: 'py',
        lang: 'python',
        system: 'You are an expert Python developer. Generate clean, modern Python code following PEP 8 standards. Include proper type hints, docstrings, and error handling.'
      }
    };

    const template = frameworkTemplates[framework] || frameworkTemplates.react;

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
            content: template.system
          },
          {
            role: "user",
            content: `Generate code for: ${prompt}\n\nProvide ONLY the code, no explanations. The code should be complete and ready to use.`
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
    const code = data.choices[0]?.message?.content || "// No code generated";

    // Clean up code blocks if AI wrapped it
    const cleanCode = code
      .replace(/```[\w]*\n/g, '')
      .replace(/```$/g, '')
      .trim();

    // Generate appropriate filename
    const componentName = prompt
      .split(' ')
      .filter((word: string) => word.length > 0)
      .slice(0, 3)
      .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('');

    return new Response(
      JSON.stringify({ 
        code: cleanCode,
        fileName: `${componentName || 'Component'}.${template.ext}`,
        language: template.lang
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in code-generator:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
