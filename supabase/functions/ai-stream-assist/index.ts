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
    const { messages, mode, code, language, context } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Enhanced system prompts with advanced logic
    const systemPrompts: Record<string, string> = {
      architect: `You are the Architect - a visionary AI that designs elegant, scalable code structures. 
      You think in systems, patterns, and architectures. When designing code:
      - Consider modularity, reusability, and maintainability
      - Use modern best practices and design patterns
      - Think about performance and scalability
      - Provide clear explanations of architectural decisions
      - Generate complete, production-ready code with proper error handling
      Current context: ${context || 'New project'}`,
      
      debugger: `You are the Debugger - a methodical AI that identifies and fixes issues with precision.
      You analyze code systematically and provide solutions. When debugging:
      - Identify root causes, not just symptoms
      - Explain the issue clearly and why it occurs
      - Provide multiple solution approaches when applicable
      - Include preventive measures for the future
      - Generate fixed code with explanations
      Current context: ${context || 'No context'}`,
      
      mentor: `You are the Mentor - a supportive AI that teaches programming concepts with clarity.
      You break down complex topics into understandable pieces. When mentoring:
      - Use analogies and real-world examples
      - Progress from simple to complex concepts
      - Encourage best practices and clean code
      - Provide code examples with detailed explanations
      - Answer questions with patience and depth
      Current context: ${context || 'General learning'}`,
      
      composer: `You are the Composer - an artistic AI that refactors and beautifies code.
      You make code elegant, readable, and performant. When composing:
      - Improve code clarity and readability
      - Optimize performance where possible
      - Apply consistent formatting and naming conventions
      - Add helpful comments and documentation
      - Preserve functionality while enhancing quality
      Current context: ${context || 'Code refactoring'}`,
      
      chat: `You are a helpful AI assistant specialized in software development.
      You provide accurate, concise answers to programming questions. When responding:
      - Be direct and practical
      - Provide code examples when relevant
      - Explain concepts clearly
      - Suggest best practices
      - Consider the user's skill level and context
      Current context: ${context || 'General assistance'}`
    };

    const systemPrompt = systemPrompts[mode as keyof typeof systemPrompts] || systemPrompts.chat;

    // Build messages array with system prompt and context
    const fullMessages = [
      { role: 'system', content: systemPrompt },
      ...messages
    ];

    // Add current code context if available
    if (code && language) {
      fullMessages.push({
        role: 'system',
        content: `Current file context:\nLanguage: ${language}\nCode:\n\`\`\`${language}\n${code}\n\`\`\``
      });
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: fullMessages,
        stream: true,
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'Payment required. Please add credits to your workspace.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      return new Response(JSON.stringify({ error: 'AI gateway error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Return the stream directly
    return new Response(response.body, {
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Error in ai-stream-assist:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});