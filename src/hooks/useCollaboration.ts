import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ProjectMember {
  id: string;
  project_id: string;
  user_id: string;
  role: 'owner' | 'editor' | 'viewer';
  invited_by: string | null;
  created_at: string;
  updated_at: string;
  profile?: {
    username: string;
    display_name: string;
    avatar_url: string | null;
  };
}

export const useCollaboration = (projectId: string | null) => {
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!projectId) return;

    const fetchMembers = async () => {
      const { data, error } = await supabase
        .from('project_members')
        .select(`
          *,
          profile:profiles(username, display_name, avatar_url)
        `)
        .eq('project_id', projectId);

      if (error) {
        console.error('Error fetching members:', error);
        return;
      }

      setMembers(data as any);
    };

    fetchMembers();

    // Subscribe to real-time updates
    const channel = supabase
      .channel(`project_members:${projectId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'project_members',
          filter: `project_id=eq.${projectId}`,
        },
        () => {
          fetchMembers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId]);

  const inviteMember = async (email: string, role: 'editor' | 'viewer') => {
    if (!projectId) return;

    setLoading(true);
    try {
      // Find user by email
      const { data: userData } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', email)
        .single();

      if (!userData) {
        toast({
          title: 'User not found',
          description: 'No user found with that email',
          variant: 'destructive',
        });
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase.from('project_members').insert({
        project_id: projectId,
        user_id: userData.id,
        role,
        invited_by: user?.id,
      });

      if (error) throw error;

      toast({
        title: 'Member invited',
        description: 'User has been added to the project',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateMemberRole = async (memberId: string, role: 'editor' | 'viewer') => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('project_members')
        .update({ role })
        .eq('id', memberId);

      if (error) throw error;

      toast({
        title: 'Role updated',
        description: 'Member role has been updated',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const removeMember = async (memberId: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('project_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;

      toast({
        title: 'Member removed',
        description: 'User has been removed from the project',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    members,
    loading,
    inviteMember,
    updateMemberRole,
    removeMember,
  };
};
