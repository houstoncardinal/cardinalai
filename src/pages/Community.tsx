import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, MessageSquare, Heart, User, Send } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { CommunityPost } from "@/integrations/supabase/types/community";

const Community = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [author, setAuthor] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPosts();
    
    // Subscribe to real-time updates
    const channel = supabase
      .channel('community_posts')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'community_posts'
        },
        () => {
          loadPosts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadPosts = async () => {
    const { data, error } = await supabase
      .from('community_posts' as any)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading posts:', error);
    } else {
      setPosts((data as CommunityPost[]) || []);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content || !author) {
      toast({
        title: "Missing fields",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    const { error } = await supabase
      .from('community_posts' as any)
      .insert([{ title, content, author, likes: 0 }]);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to create post",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: "Post created successfully"
      });
      setTitle("");
      setContent("");
      setAuthor("");
    }
    setLoading(false);
  };

  const handleLike = async (postId: string, currentLikes: number) => {
    const { error } = await supabase
      .from('community_posts' as any)
      .update({ likes: currentLikes + 1 })
      .eq('id', postId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to like post",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 glass-panel border-b border-border/40">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate("/")} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Button>
          <Button onClick={() => navigate("/ide")}>
            Launch IDE
          </Button>
        </div>
      </nav>

      <div className="pt-24 pb-12 px-6">
        <div className="container mx-auto max-w-4xl">
          {/* Header */}
          <div className="text-center mb-12 space-y-4 animate-fade-in-up">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent">
              PathwayAI Community
            </h1>
            <p className="text-xl text-muted-foreground">
              Share ideas, get feedback, and connect with developers worldwide
            </p>
          </div>

          {/* Create Post */}
          <Card className="mb-8 metal-panel">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Share Your Thoughts
              </CardTitle>
              <CardDescription>
                Post questions, showcase projects, or share insights
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  placeholder="Your name"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="bg-background/50"
                />
                <Input
                  placeholder="Post title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-background/50"
                />
                <Textarea
                  placeholder="What's on your mind?"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={4}
                  className="bg-background/50"
                />
                <Button type="submit" disabled={loading} className="w-full shadow-elegant">
                  <Send className="w-4 h-4 mr-2" />
                  Post to Community
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Posts Feed */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Community Feed</h2>
              <Badge variant="secondary">{posts.length} posts</Badge>
            </div>

            {posts.length === 0 ? (
              <Card className="glass-panel text-center py-12">
                <CardContent>
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    No posts yet. Be the first to share!
                  </p>
                </CardContent>
              </Card>
            ) : (
              posts.map((post) => (
                <Card key={post.id} className="glass-panel hover:shadow-elegant smooth-transition">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2">{post.title}</CardTitle>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <User className="w-4 h-4" />
                          <span>{post.author}</span>
                          <span>•</span>
                          <span>{new Date(post.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4 leading-relaxed whitespace-pre-wrap">
                      {post.content}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleLike(post.id, post.likes)}
                      className="gap-2"
                    >
                      <Heart className="w-4 h-4" />
                      {post.likes} {post.likes === 1 ? 'like' : 'likes'}
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Community;