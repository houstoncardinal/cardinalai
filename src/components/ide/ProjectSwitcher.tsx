import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ChevronDown, Plus, FolderOpen, Loader2, Users } from "lucide-react";
import { cloudFileSystem, CloudProject } from "@/lib/cloudFileSystem";
import { useToast } from "@/hooks/use-toast";
import { ProjectSharingDialog } from "./ProjectSharingDialog";
import { useAnalytics } from "@/hooks/useAnalytics";

interface ProjectSwitcherProps {
  currentProject: CloudProject | null;
  onProjectChange: (project: CloudProject) => void;
}

export function ProjectSwitcher({ currentProject, onProjectChange }: ProjectSwitcherProps) {
  const [projects, setProjects] = useState<CloudProject[]>([]);
  const [loading, setLoading] = useState(false);
  const [showNewProject, setShowNewProject] = useState(false);
  const [sharingOpen, setSharingOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDescription, setNewProjectDescription] = useState("");
  const { toast } = useToast();
  const { trackProjectCreate, trackProjectOpen } = useAnalytics();

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const data = await cloudFileSystem.getProjects();
      setProjects(data);
      
      // Set first project as current if none selected
      if (!currentProject && data.length > 0) {
        onProjectChange(data[0]);
      }
    } catch (error) {
      toast({
        title: "Error loading projects",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) {
      toast({
        title: "Project name required",
        description: "Please enter a name for your project",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const project = await cloudFileSystem.createProject(
        newProjectName,
        newProjectDescription
      );
      
      if (project) {
        setProjects([project, ...projects]);
        onProjectChange(project);
        trackProjectCreate(project.id);
        setShowNewProject(false);
        setNewProjectName("");
        setNewProjectDescription("");
        
        toast({
          title: "Project created",
          description: "Your new project is ready",
        });
      }
    } catch (error) {
      toast({
        title: "Error creating project",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="justify-between min-w-[200px] glass-panel"
          >
            <div className="flex items-center gap-2">
              <FolderOpen className="w-4 h-4" />
              <span className="truncate">
                {currentProject?.name || "Select Project"}
              </span>
            </div>
            <ChevronDown className="w-4 h-4 ml-2" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-[250px]">
          <DropdownMenuLabel>Your Projects</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {loading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-4 h-4 animate-spin" />
            </div>
          ) : projects.length === 0 ? (
            <div className="px-2 py-4 text-sm text-muted-foreground text-center">
              No projects yet
            </div>
          ) : (
            projects.map((project) => (
              <DropdownMenuItem
                key={project.id}
                onClick={() => {
                  onProjectChange(project);
                  trackProjectOpen(project.id);
                }}
                className={currentProject?.id === project.id ? "bg-accent" : ""}
              >
                <FolderOpen className="w-4 h-4 mr-2" />
                <span className="truncate">{project.name}</span>
              </DropdownMenuItem>
            ))
          )}
          
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setShowNewProject(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </DropdownMenuItem>
          
          {currentProject && (
            <DropdownMenuItem onClick={() => setSharingOpen(true)}>
              <Users className="w-4 h-4 mr-2" />
              Share Project
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showNewProject} onOpenChange={setShowNewProject}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
            <DialogDescription>
              Start a new project in your cloud workspace
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="project-name">Project Name</Label>
              <Input
                id="project-name"
                placeholder="My Awesome Project"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="project-description">Description (Optional)</Label>
              <Textarea
                id="project-description"
                placeholder="What's this project about?"
                value={newProjectDescription}
                onChange={(e) => setNewProjectDescription(e.target.value)}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowNewProject(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button onClick={handleCreateProject} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Project"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      <ProjectSharingDialog
        open={sharingOpen}
        onOpenChange={setSharingOpen}
        projectId={currentProject?.id || null}
      />
    </>
  );
}