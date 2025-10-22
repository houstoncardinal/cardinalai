// Temporary types for community_posts table until types are regenerated
export interface CommunityPost {
  id: string;
  title: string;
  content: string;
  author: string;
  likes: number;
  created_at: string;
  updated_at: string;
}

export interface CommunityPostInsert {
  title: string;
  content: string;
  author: string;
  likes?: number;
}

export interface CommunityPostUpdate {
  title?: string;
  content?: string;
  author?: string;
  likes?: number;
  updated_at?: string;
}
