import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Activity {
  id: string;
  project_id: string;
  user_id: string;
  activity_type: string;
  description: string;
  metadata: Record<string, any>;
  created_at: string;
  profile?: {
    username: string;
    display_name: string;
    avatar_url: string | null;
  };
}

export const useActivityLog = (projectId: string | null) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!projectId) return;

    const fetchActivities = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('project_activity_log')
        .select(`
          *,
          profile:profiles(username, display_name, avatar_url)
        `)
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching activities:', error);
        setLoading(false);
        return;
      }

      setActivities(data as any);
      setLoading(false);
    };

    fetchActivities();

    // Subscribe to real-time updates
    const channel = supabase
      .channel(`activity_log:${projectId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'project_activity_log',
          filter: `project_id=eq.${projectId}`,
        },
        () => {
          fetchActivities();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId]);

  const logActivity = useCallback(async (
    activityType: string,
    description: string,
    metadata: Record<string, any> = {}
  ) => {
    if (!projectId) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from('project_activity_log').insert({
        project_id: projectId,
        user_id: user.id,
        activity_type: activityType,
        description,
        metadata,
      });
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  }, [projectId]);

  return {
    activities,
    loading,
    logActivity,
  };
};
