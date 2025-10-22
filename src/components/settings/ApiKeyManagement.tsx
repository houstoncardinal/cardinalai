import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Trash2, Plus, CheckCircle } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ApiKey {
  id: string;
  provider: string;
  key_name: string | null;
  api_key: string;
  is_active: boolean;
  created_at: string;
}

const PROVIDERS = [
  { value: 'anthropic', label: 'Anthropic (Claude)', models: 'Claude Sonnet, Opus, Haiku' },
  { value: 'openai', label: 'OpenAI (GPT)', models: 'GPT-4, GPT-5, O3, O4' },
  { value: 'google', label: 'Google (Gemini)', models: 'Gemini Pro, Flash, Ultra' },
  { value: 'perplexity', label: 'Perplexity', models: 'Sonar models with web search' },
  { value: 'lovable', label: 'Lovable AI', models: 'Built-in models (no key needed)' },
];

export function ApiKeyManagement() {
  const { toast } = useToast();
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [showApiKey, setShowApiKey] = useState<{ [key: string]: boolean }>({});
  const [addingNew, setAddingNew] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  // New key form state
  const [newProvider, setNewProvider] = useState('');
  const [newKeyName, setNewKeyName] = useState('');
  const [newApiKey, setNewApiKey] = useState('');

  useEffect(() => {
    loadKeys();
  }, []);

  const loadKeys = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_api_keys')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setKeys(data || []);
    } catch (error) {
      console.error('Error loading API keys:', error);
      toast({
        title: 'Error',
        description: 'Failed to load API keys',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const addKey = async () => {
    if (!newProvider || !newApiKey) {
      toast({
        title: 'Missing Information',
        description: 'Please select a provider and enter an API key',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase.from('user_api_keys').insert({
        user_id: user.id,
        provider: newProvider,
        key_name: newKeyName || null,
        api_key: newApiKey,
        is_active: true,
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'API key added successfully',
      });

      setNewProvider('');
      setNewKeyName('');
      setNewApiKey('');
      setAddingNew(false);
      loadKeys();
    } catch (error: any) {
      console.error('Error adding API key:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to add API key',
        variant: 'destructive',
      });
    }
  };

  const deleteKey = async (id: string) => {
    try {
      const { error } = await supabase
        .from('user_api_keys')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'API key deleted successfully',
      });
      
      loadKeys();
    } catch (error) {
      console.error('Error deleting API key:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete API key',
        variant: 'destructive',
      });
    } finally {
      setDeleteId(null);
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('user_api_keys')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      loadKeys();
    } catch (error) {
      console.error('Error updating API key:', error);
      toast({
        title: 'Error',
        description: 'Failed to update API key status',
        variant: 'destructive',
      });
    }
  };

  const maskKey = (key: string) => {
    if (key.length <= 8) return '••••••••';
    return `${key.slice(0, 4)}${'•'.repeat(20)}${key.slice(-4)}`;
  };

  if (loading) {
    return <div className="text-muted-foreground">Loading API keys...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">API Key Management</h3>
          <p className="text-sm text-muted-foreground">
            Securely store your AI provider API keys
          </p>
        </div>
        {!addingNew && (
          <Button onClick={() => setAddingNew(true)} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Key
          </Button>
        )}
      </div>

      {addingNew && (
        <Card className="p-4 border-primary/20">
          <h4 className="font-semibold mb-4">Add New API Key</h4>
          <div className="space-y-4">
            <div>
              <Label htmlFor="provider">Provider</Label>
              <Select value={newProvider} onValueChange={setNewProvider}>
                <SelectTrigger id="provider">
                  <SelectValue placeholder="Select provider" />
                </SelectTrigger>
                <SelectContent>
                  {PROVIDERS.filter(p => p.value !== 'lovable').map((provider) => (
                    <SelectItem key={provider.value} value={provider.value}>
                      <div>
                        <div className="font-medium">{provider.label}</div>
                        <div className="text-xs text-muted-foreground">
                          {provider.models}
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="keyName">Key Name (Optional)</Label>
              <Input
                id="keyName"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                placeholder="e.g., Production Key, Testing Key"
              />
            </div>

            <div>
              <Label htmlFor="apiKey">API Key</Label>
              <Input
                id="apiKey"
                type="password"
                value={newApiKey}
                onChange={(e) => setNewApiKey(e.target.value)}
                placeholder="sk-..."
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={addKey}>Add Key</Button>
              <Button
                variant="outline"
                onClick={() => {
                  setAddingNew(false);
                  setNewProvider('');
                  setNewKeyName('');
                  setNewApiKey('');
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}

      <div className="space-y-2">
        {keys.length === 0 ? (
          <Card className="p-6 text-center">
            <p className="text-muted-foreground mb-2">No API keys configured</p>
            <p className="text-sm text-muted-foreground">
              Add your first API key to start using AI features with your own providers
            </p>
          </Card>
        ) : (
          keys.map((key) => {
            const provider = PROVIDERS.find(p => p.value === key.provider);
            return (
              <Card key={key.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{provider?.label}</h4>
                      {key.is_active && (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      )}
                    </div>
                    {key.key_name && (
                      <p className="text-sm text-muted-foreground">{key.key_name}</p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <code className="text-xs bg-muted px-2 py-1 rounded">
                        {showApiKey[key.id] ? key.api_key : maskKey(key.api_key)}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setShowApiKey((prev) => ({
                            ...prev,
                            [key.id]: !prev[key.id],
                          }))
                        }
                      >
                        {showApiKey[key.id] ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Added {new Date(key.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={key.is_active ? "secondary" : "outline"}
                      size="sm"
                      onClick={() => toggleActive(key.id, key.is_active)}
                    >
                      {key.is_active ? 'Active' : 'Inactive'}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setDeleteId(key.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete API Key</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this API key? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteId && deleteKey(deleteId)}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
