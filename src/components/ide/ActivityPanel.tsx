import { ScrollArea } from '@/components/ui/scroll-area';
import { useActivityLog } from '@/hooks/useActivityLog';
import { Activity, Clock, FileEdit, Users, Plus } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ActivityPanelProps {
  projectId: string | null;
}

export const ActivityPanel = ({ projectId }: ActivityPanelProps) => {
  const { activities, loading } = useActivityLog(projectId);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'file_create':
      case 'file_update':
        return <FileEdit className="h-4 w-4" />;
      case 'member_add':
      case 'member_remove':
        return <Users className="h-4 w-4" />;
      case 'project_create':
        return <Plus className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Activity Feed
        </h2>
      </div>

      <ScrollArea className="flex-1 p-4">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : activities.length === 0 ? (
          <div className="text-center py-8">
            <Activity className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-sm text-muted-foreground">No activity yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="p-3 rounded-lg bg-muted/50 border border-border/50 hover:border-primary/50 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-md bg-primary/10 text-primary mt-0.5">
                    {getActivityIcon(activity.activity_type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium">
                        {activity.profile?.display_name || 'Unknown User'}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        @{activity.profile?.username || 'unknown'}
                      </span>
                    </div>
                    <p className="text-sm text-foreground/90">
                      {activity.description}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(activity.created_at), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};
