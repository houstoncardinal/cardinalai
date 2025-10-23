import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CollaboratorPresence {
  userId: string;
  username: string;
  currentFile?: string;
  cursorPosition?: { line: number; column: number };
  online_at: string;
}

export const useRealtimeCollaboration = (projectId: string | null) => {
  const { toast } = useToast();

  useEffect(() => {
    if (!projectId) return;

    // Subscribe to file changes
    const fileChannel = supabase
      .channel(`project_files:${projectId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'project_files',
          filter: `project_id=eq.${projectId}`,
        },
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            toast({
              title: 'File updated',
              description: `${payload.new.file_name} was modified by another user`,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(fileChannel);
    };
  }, [projectId, toast]);

  const trackPresence = useCallback(async (currentFile?: string) => {
    if (!projectId) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', user.id)
      .single();

    const roomChannel = supabase.channel(`project:${projectId}`);

    roomChannel
      .on('presence', { event: 'sync' }, () => {
        const state = roomChannel.presenceState();
        console.log('Collaborators:', state);
      })
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        newPresences.forEach((presence: any) => {
          toast({
            title: 'User joined',
            description: `${presence.username} is now editing`,
          });
        });
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        leftPresences.forEach((presence: any) => {
          toast({
            title: 'User left',
            description: `${presence.username} stopped editing`,
          });
        });
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await roomChannel.track({
            userId: user.id,
            username: profile?.username || 'Unknown',
            currentFile,
            online_at: new Date().toISOString(),
          });
        }
      });

    return () => {
      supabase.removeChannel(roomChannel);
    };
  }, [projectId, toast]);

  return {
    trackPresence,
  };
};
