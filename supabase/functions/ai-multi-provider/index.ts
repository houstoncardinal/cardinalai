import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, provider, mode = 'chat' } = await req.json();
    
    const authHeader = req.headers.get('Authorization')!;
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Not authenticated');
    }

    // Fetch user's active API key for the provider
    const { data: keyData, error: keyError } = await supabase
      .from('user_api_keys')
      .select('api_key, provider')
      .eq('user_id', user.id)
      .eq('provider', provider)
      .eq('is_active', true)
      .maybeSingle();

    if (keyError) throw keyError;

    let apiKey: string;
    let apiUrl: string;
    let requestBody: any;
    
    // Handle Lovable AI provider
    if (provider === 'lovable') {
      apiKey = Deno.env.get('LOVABLE_API_KEY') || '';
      apiUrl = 'https://ai.gateway.lovable.dev/v1/chat/completions';
      requestBody = {
        model: 'google/gemini-2.5-flash',
        messages,
        stream: true,
      };
    } else {
      if (!keyData) {
        throw new Error(`No active API key found for provider: ${provider}`);
      }
      apiKey = keyData.api_key;

      // Configure based on provider
      switch (provider) {
        case 'anthropic':
          apiUrl = 'https://api.anthropic.com/v1/messages';
          requestBody = {
            model: 'claude-sonnet-4-5',
            max_tokens: 4096,
            messages,
            stream: true,
          };
          break;
        
        case 'openai':
          apiUrl = 'https://api.openai.com/v1/chat/completions';
          requestBody = {
            model: 'gpt-5-mini-2025-08-07',
            messages,
            stream: true,
          };
          break;
        
        case 'google':
          apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:streamGenerateContent';
          requestBody = {
            contents: messages.map((msg: any) => ({
              role: msg.role === 'assistant' ? 'model' : 'user',
              parts: [{ text: msg.content }]
            }))
          };
          break;
        
        case 'perplexity':
          apiUrl = 'https://api.perplexity.ai/chat/completions';
          requestBody = {
            model: 'llama-3.1-sonar-small-128k-online',
            messages,
            stream: true,
          };
          break;
        
        default:
          throw new Error(`Unsupported provider: ${provider}`);
      }
    }

    // Make the request
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (provider === 'anthropic') {
      headers['x-api-key'] = apiKey;
      headers['anthropic-version'] = '2023-06-01';
    } else if (provider === 'google') {
      apiUrl = `${apiUrl}?key=${apiKey}`;
    } else {
      headers['Authorization'] = `Bearer ${apiKey}`;
    }

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), 
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Payment required. Please check your API credits.' }), 
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error(`${provider} API error:`, response.status, errorText);
      throw new Error(`${provider} API error: ${response.status}`);
    }

    // Return the stream
    return new Response(response.body, {
      headers: { ...corsHeaders, 'Content-Type': 'text/event-stream' },
    });

  } catch (error) {
    console.error('Error in ai-multi-provider:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
