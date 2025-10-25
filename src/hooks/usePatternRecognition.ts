import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface CodingPattern {
  id: string;
  user_id: string;
  pattern_type: string;
  pattern_data: Record<string, any>;
  confidence_score: number;
  frequency: number;
  last_observed_at: string;
}

export interface PredictiveSuggestion {
  id: string;
  suggestion_type: string;
  suggestion_data: Record<string, any>;
  confidence_score: number;
  was_accepted: boolean | null;
  created_at: string;
}

export const usePatternRecognition = (projectId: string | null) => {
  const [patterns, setPatterns] = useState<CodingPattern[]>([]);
  const [suggestions, setSuggestions] = useState<PredictiveSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchPatterns();
    fetchSuggestions();

    // Subscribe to real-time suggestion updates
    const channel = supabase
      .channel(`suggestions:${projectId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'predictive_suggestions',
          filter: `project_id=eq.${projectId}`,
        },
        (payload) => {
          setSuggestions(prev => [payload.new as PredictiveSuggestion, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId]);

  const fetchPatterns = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_coding_patterns')
        .select('*')
        .order('confidence_score', { ascending: false });

      if (error) throw error;
      setPatterns(data as CodingPattern[]);
    } catch (error) {
      console.error('Error fetching patterns:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSuggestions = async () => {
    if (!projectId) return;

    try {
      const { data, error } = await supabase
        .from('predictive_suggestions')
        .select('*')
        .eq('project_id', projectId)
        .is('was_accepted', null)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setSuggestions(data as PredictiveSuggestion[]);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    }
  };

  const trackAction = useCallback(async (
    actionType: string,
    actionData: Record<string, any>
  ) => {
    if (!projectId) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/pattern-analyzer`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            actionType,
            actionData,
            projectId,
          }),
        }
      );

      if (response.ok) {
        const result = await response.json();
        if (result.patterns) {
          setPatterns(result.patterns);
        }
      }
    } catch (error) {
      console.error('Error tracking action:', error);
    }
  }, [projectId]);

  const acceptSuggestion = useCallback(async (suggestionId: string) => {
    try {
      const { error } = await supabase
        .from('predictive_suggestions')
        .update({
          was_accepted: true,
          accepted_at: new Date().toISOString(),
        })
        .eq('id', suggestionId);

      if (error) throw error;

      setSuggestions(prev => prev.filter(s => s.id !== suggestionId));
      toast({
        title: 'Suggestion Applied',
        description: 'The suggestion has been applied successfully',
      });
    } catch (error) {
      console.error('Error accepting suggestion:', error);
      toast({
        title: 'Error',
        description: 'Failed to apply suggestion',
        variant: 'destructive',
      });
    }
  }, [toast]);

  const rejectSuggestion = useCallback(async (suggestionId: string) => {
    try {
      const { error } = await supabase
        .from('predictive_suggestions')
        .update({ was_accepted: false })
        .eq('id', suggestionId);

      if (error) throw error;

      setSuggestions(prev => prev.filter(s => s.id !== suggestionId));
    } catch (error) {
      console.error('Error rejecting suggestion:', error);
    }
  }, []);

  return {
    patterns,
    suggestions,
    loading,
    trackAction,
    acceptSuggestion,
    rejectSuggestion,
    refreshPatterns: fetchPatterns,
    refreshSuggestions: fetchSuggestions,
  };
};
