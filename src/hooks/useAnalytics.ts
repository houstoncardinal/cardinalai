import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

let sessionId: string | null = null;

export const useAnalytics = () => {
  useEffect(() => {
    // Generate session ID on mount
    if (!sessionId) {
      sessionId = uuidv4();
    }
  }, []);

  const trackEvent = useCallback(async (
    eventType: string,
    eventData: Record<string, any> = {},
    projectId?: string
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from('user_analytics').insert({
        user_id: user.id,
        event_type: eventType,
        event_data: eventData,
        project_id: projectId || null,
        session_id: sessionId,
      });
    } catch (error) {
      console.error('Error tracking event:', error);
    }
  }, []);

  const trackPageView = useCallback((page: string, projectId?: string) => {
    trackEvent('page_view', { page }, projectId);
  }, [trackEvent]);

  const trackFileOpen = useCallback((fileName: string, projectId?: string) => {
    trackEvent('file_open', { fileName }, projectId);
  }, [trackEvent]);

  const trackFileSave = useCallback((fileName: string, projectId?: string) => {
    trackEvent('file_save', { fileName }, projectId);
  }, [trackEvent]);

  const trackProjectCreate = useCallback((projectId: string) => {
    trackEvent('project_create', {}, projectId);
  }, [trackEvent]);

  const trackProjectOpen = useCallback((projectId: string) => {
    trackEvent('project_open', {}, projectId);
  }, [trackEvent]);

  const trackAiQuery = useCallback((query: string, projectId?: string) => {
    trackEvent('ai_query', { query }, projectId);
  }, [trackEvent]);

  return {
    trackEvent,
    trackPageView,
    trackFileOpen,
    trackFileSave,
    trackProjectCreate,
    trackProjectOpen,
    trackAiQuery,
  };
};
