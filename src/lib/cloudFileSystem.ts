import { supabase } from "@/integrations/supabase/client";

export interface CloudFile {
  id: string;
  project_id: string;
  file_path: string;
  file_name: string;
  file_type: "file" | "folder";
  content: string | null;
  language: string | null;
  storage_path: string | null;
  parent_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface CloudProject {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  is_public: boolean;
  metadata: any;
  created_at: string;
  updated_at: string;
}

export class CloudFileSystemManager {
  async createProject(name: string, description?: string): Promise<CloudProject | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from("projects")
      .insert({
        user_id: user.id,
        name,
        description,
      })
      .select()
      .single();

    if (error) throw error;
    return data as CloudProject;
  }

  async getProjects(): Promise<CloudProject[]> {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("updated_at", { ascending: false });

    if (error) throw error;
    return (data || []) as CloudProject[];
  }

  async getProject(projectId: string): Promise<CloudProject | null> {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("id", projectId)
      .single();

    if (error) throw error;
    return data as CloudProject;
  }

  async updateProject(projectId: string, updates: Partial<CloudProject>): Promise<void> {
    const { error } = await supabase
      .from("projects")
      .update(updates)
      .eq("id", projectId);

    if (error) throw error;
  }

  async deleteProject(projectId: string): Promise<void> {
    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("id", projectId);

    if (error) throw error;
  }

  async createFile(
    projectId: string,
    fileName: string,
    fileType: "file" | "folder",
    content?: string,
    language?: string,
    parentId?: string
  ): Promise<CloudFile | null> {
    const filePath = parentId
      ? `${parentId}/${fileName}`
      : fileName;

    const { data, error } = await supabase
      .from("project_files")
      .insert({
        project_id: projectId,
        file_path: filePath,
        file_name: fileName,
        file_type: fileType,
        content,
        language,
        parent_id: parentId,
      })
      .select()
      .single();

    if (error) throw error;
    return data as CloudFile;
  }

  async updateFile(fileId: string, updates: Partial<CloudFile>): Promise<void> {
    const { error } = await supabase
      .from("project_files")
      .update(updates)
      .eq("id", fileId);

    if (error) throw error;
  }

  async deleteFile(fileId: string): Promise<void> {
    const { error } = await supabase
      .from("project_files")
      .delete()
      .eq("id", fileId);

    if (error) throw error;
  }

  async getProjectFiles(projectId: string): Promise<CloudFile[]> {
    const { data, error } = await supabase
      .from("project_files")
      .select("*")
      .eq("project_id", projectId)
      .order("file_type", { ascending: false })
      .order("file_name", { ascending: true });

    if (error) throw error;
    return (data || []) as CloudFile[];
  }

  async uploadFileToStorage(
    projectId: string,
    fileName: string,
    content: string
  ): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const filePath = `${user.id}/${projectId}/${fileName}`;
    const blob = new Blob([content], { type: "text/plain" });

    const { error } = await supabase.storage
      .from("project-files")
      .upload(filePath, blob, { upsert: true });

    if (error) throw error;
    return filePath;
  }

  async downloadFileFromStorage(storagePath: string): Promise<string> {
    const { data, error } = await supabase.storage
      .from("project-files")
      .download(storagePath);

    if (error) throw error;
    return await data.text();
  }

  async syncToCloud(projectId: string, files: any[]): Promise<void> {
    // Batch sync files to cloud
    const filePromises = files.map(async (file) => {
      if (file.type === "file" && file.content) {
        const storagePath = await this.uploadFileToStorage(
          projectId,
          file.name,
          file.content
        );

        return this.createFile(
          projectId,
          file.name,
          "file",
          file.content,
          file.language,
          file.parentId
        );
      } else if (file.type === "folder") {
        return this.createFile(
          projectId,
          file.name,
          "folder",
          undefined,
          undefined,
          file.parentId
        );
      }
    });

    await Promise.all(filePromises);
  }
}

export const cloudFileSystem = new CloudFileSystemManager();