import { useCallback, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface KnowledgeNode {
  id: string;
  user_id: string;
  project_id: string;
  node_type: 'file' | 'function' | 'class' | 'concept' | 'pattern' | 'dependency';
  name: string;
  description?: string;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface KnowledgeEdge {
  id: string;
  source_node_id: string;
  target_node_id: string;
  relationship_type: string;
  weight: number;
  metadata: Record<string, any>;
}

export const useKnowledgeGraph = (projectId: string | null) => {
  const [nodes, setNodes] = useState<KnowledgeNode[]>([]);
  const [edges, setEdges] = useState<KnowledgeEdge[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchKnowledgeGraph = useCallback(async () => {
    if (!projectId) return;

    setLoading(true);
    try {
      const [nodesResult, edgesResult] = await Promise.all([
        supabase
          .from('knowledge_graph_nodes')
          .select('*')
          .eq('project_id', projectId),
        supabase
          .from('knowledge_graph_edges')
          .select('*')
      ]);

      if (nodesResult.error) throw nodesResult.error;
      if (edgesResult.error) throw edgesResult.error;

      setNodes(nodesResult.data as KnowledgeNode[]);
      setEdges(edgesResult.data as KnowledgeEdge[]);
    } catch (error) {
      console.error('Error fetching knowledge graph:', error);
      toast({
        title: 'Error',
        description: 'Failed to load knowledge graph',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [projectId, toast]);

  const addNode = useCallback(async (
    nodeType: KnowledgeNode['node_type'],
    name: string,
    description?: string,
    metadata: Record<string, any> = {}
  ) => {
    if (!projectId) return null;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('knowledge_graph_nodes')
        .insert({
          user_id: user.id,
          project_id: projectId,
          node_type: nodeType,
          name,
          description,
          metadata,
        })
        .select()
        .single();

      if (error) throw error;

      setNodes(prev => [...prev, data as KnowledgeNode]);
      return data as KnowledgeNode;
    } catch (error) {
      console.error('Error adding node:', error);
      toast({
        title: 'Error',
        description: 'Failed to add knowledge node',
        variant: 'destructive',
      });
      return null;
    }
  }, [projectId, toast]);

  const addEdge = useCallback(async (
    sourceNodeId: string,
    targetNodeId: string,
    relationshipType: string,
    weight: number = 1.0,
    metadata: Record<string, any> = {}
  ) => {
    try {
      const { data, error } = await supabase
        .from('knowledge_graph_edges')
        .insert({
          source_node_id: sourceNodeId,
          target_node_id: targetNodeId,
          relationship_type: relationshipType,
          weight,
          metadata,
        })
        .select()
        .single();

      if (error) throw error;

      setEdges(prev => [...prev, data as KnowledgeEdge]);
      return data as KnowledgeEdge;
    } catch (error) {
      console.error('Error adding edge:', error);
      toast({
        title: 'Error',
        description: 'Failed to add knowledge edge',
        variant: 'destructive',
      });
      return null;
    }
  }, [toast]);

  const getRelatedNodes = useCallback((nodeId: string) => {
    const relatedEdges = edges.filter(
      e => e.source_node_id === nodeId || e.target_node_id === nodeId
    );
    const relatedNodeIds = relatedEdges.map(e =>
      e.source_node_id === nodeId ? e.target_node_id : e.source_node_id
    );
    return nodes.filter(n => relatedNodeIds.includes(n.id));
  }, [nodes, edges]);

  return {
    nodes,
    edges,
    loading,
    fetchKnowledgeGraph,
    addNode,
    addEdge,
    getRelatedNodes,
  };
};
