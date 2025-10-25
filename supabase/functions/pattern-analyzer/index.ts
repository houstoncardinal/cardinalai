import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { actionType, actionData, projectId } = await req.json();

    // Analyze action and update patterns
    const patterns = await analyzeAction(user.id, projectId, actionType, actionData, supabase);

    // Generate predictive suggestions based on patterns
    const suggestions = await generateSuggestions(user.id, projectId, patterns, supabase);

    return new Response(JSON.stringify({ patterns, suggestions }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in pattern-analyzer:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function analyzeAction(
  userId: string,
  projectId: string,
  actionType: string,
  actionData: any,
  supabase: any
) {
  // Detect pattern type based on action
  let patternType: string | null = null;
  let patternData: any = {};

  switch (actionType) {
    case 'file_open':
      patternType = 'workflow_sequence';
      patternData = { action: 'file_open', file: actionData.fileName };
      break;
    case 'code_edit':
      if (actionData.language) {
        patternType = 'language_preference';
        patternData = { language: actionData.language };
      }
      break;
    case 'framework_usage':
      patternType = 'framework_usage';
      patternData = { framework: actionData.framework };
      break;
  }

  if (patternType) {
    // Upsert pattern
    const { data: existing } = await supabase
      .from('user_coding_patterns')
      .select('*')
      .eq('user_id', userId)
      .eq('pattern_type', patternType)
      .eq('pattern_data', patternData)
      .maybeSingle();

    if (existing) {
      await supabase
        .from('user_coding_patterns')
        .update({
          frequency: existing.frequency + 1,
          confidence_score: Math.min(existing.confidence_score + 0.05, 1.0),
          last_observed_at: new Date().toISOString(),
        })
        .eq('id', existing.id);
    } else {
      await supabase
        .from('user_coding_patterns')
        .insert({
          user_id: userId,
          pattern_type: patternType,
          pattern_data: patternData,
          confidence_score: 0.3,
          frequency: 1,
        });
    }
  }

  // Fetch all patterns for user
  const { data: patterns } = await supabase
    .from('user_coding_patterns')
    .select('*')
    .eq('user_id', userId)
    .order('confidence_score', { ascending: false });

  return patterns || [];
}

async function generateSuggestions(
  userId: string,
  projectId: string,
  patterns: any[],
  supabase: any
) {
  const suggestions = [];

  // Fetch recent workflow sequences
  const { data: workflows } = await supabase
    .from('workflow_sequences')
    .select('*')
    .eq('user_id', userId)
    .eq('project_id', projectId)
    .order('frequency', { ascending: false })
    .limit(5);

  // Suggest next likely action based on workflows
  if (workflows && workflows.length > 0) {
    const topWorkflow = workflows[0];
    suggestions.push({
      user_id: userId,
      project_id: projectId,
      suggestion_type: 'next_action',
      suggestion_data: {
        description: 'Based on your workflow patterns',
        action: topWorkflow.action_sequence[0],
      },
      confidence_score: 0.7,
    });
  }

  // Suggest refactoring based on patterns
  const codeStylePatterns = patterns.filter(p => p.pattern_type === 'code_style');
  if (codeStylePatterns.length > 0) {
    suggestions.push({
      user_id: userId,
      project_id: projectId,
      suggestion_type: 'refactoring',
      suggestion_data: {
        description: 'Consider refactoring to match your preferred code style',
        style: codeStylePatterns[0].pattern_data,
      },
      confidence_score: 0.6,
    });
  }

  // Insert suggestions
  if (suggestions.length > 0) {
    await supabase.from('predictive_suggestions').insert(suggestions);
  }

  return suggestions;
}
