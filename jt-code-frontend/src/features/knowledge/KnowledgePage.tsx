import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useApiClient } from '@/lib/api/client';
import { listCollections, createCollection, syncSource } from '@/features/knowledge/api';
import { Button, Input, Textarea, Card, CardContent, CardHeader, CardTitle, Badge, Spinner, Alert, Modal, ScrollArea } from '@/shared/components';
import { formatDate } from '@/shared/utils';

export function KnowledgePage() {
  const client = useApiClient();
  const queryClient = useQueryClient();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showSyncDialog, setShowSyncDialog] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [newCollection, setNewCollection] = useState({ name: '', description: '', embeddingProvider: 'openai', embeddingModel: 'text-embedding-3-small' });

  const collections = useQuery({
    queryKey: ['collections'],
    queryFn: () => listCollections(client),
    staleTime: 30000,
  });

  async function handleCreateCollection() {
    try {
      await createCollection(client, newCollection);
      await queryClient.invalidateQueries({ queryKey: ['collections'] });
      setNewCollection({ name: '', description: '', embeddingProvider: 'openai', embeddingModel: 'text-embedding-3-small' });
      setShowCreateDialog(false);
    } catch (err) {
      setError('Failed to create collection');
    }
  }

  async function handleSync(collectionId: string) {
    setShowSyncDialog(collectionId);
  }

  async function confirmSync() {
    if (!showSyncDialog) return;
    try {
      await syncSource(client, showSyncDialog);
      await queryClient.invalidateQueries({ queryKey: ['collections'] });
      setShowSyncDialog(null);
    } catch (err) {
      setError('Failed to sync source');
    }
  }

  return (
    <section className="workspace">
      <header className="workspace-header">
        <div>
          <p className="eyebrow">KNOWLEDGE BASE</p>
          <h1>Knowledge</h1>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <span>➕</span> New Collection
        </Button>
      </header>

      {error && (
        <Alert variant="destructive" className="mb-4" onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {collections.isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : collections.isError ? (
        <Alert variant="destructive">Failed to load collections</Alert>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {collections.data?.results?.map((collection) => (
            <Card key={collection.id}>
              <CardHeader>
                <CardTitle>{collection.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">{collection.description || 'No description'}</p>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Documents</span>
                    <span className="font-medium">{collection.document_count}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Chunks</span>
                    <span className="font-medium">{collection.chunk_count}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Embedding</span>
                    <span className="font-medium">{collection.embedding_provider} / {collection.embedding_model}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Status</span>
                    <Badge variant={collection.is_active ? 'success' : 'secondary'}>
                      {collection.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleSync(collection.id)} className="flex-1">
                    🔄 Sync
                  </Button>
                  <Button variant="ghost" size="sm">View</Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {collections.data?.results?.length === 0 && (
            <Card className="col-span-full">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <div className="text-6xl mb-4">🧠</div>
                <h3 className="text-lg font-semibold mb-2">No collections yet</h3>
                <p className="text-muted-foreground mb-4">Create a knowledge collection to store and query your documents</p>
                <Button onClick={() => setShowCreateDialog(true)}>Create Collection</Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Create Collection Modal */}
      <Modal
        isOpen={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        title="Create Knowledge Collection"
        description="Set up a new collection for RAG queries"
      >
        <div className="space-y-4">
          <Input
            label="Name"
            placeholder="My Knowledge Base"
            value={newCollection.name}
            onChange={(e) => setNewCollection({ ...newCollection, name: e.target.value })}
            required
          />
          <Textarea
            label="Description"
            placeholder="What kind of documents will this contain?"
            value={newCollection.description}
            onChange={(e) => setNewCollection({ ...newCollection, description: e.target.value })}
            rows={3}
          />
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="Embedding Provider"
              value={newCollection.embeddingProvider}
              onChange={(e) => setNewCollection({ ...newCollection, embeddingProvider: e.target.value })}
              disabled
            />
            <Input
              label="Embedding Model"
              value={newCollection.embeddingModel}
              onChange={(e) => setNewCollection({ ...newCollection, embeddingModel: e.target.value })}
              disabled
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="ghost" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
            <Button onClick={handleCreateCollection} disabled={!newCollection.name.trim()}>
              Create Collection
            </Button>
          </div>
        </div>
      </Modal>

      {/* Sync Confirmation Modal */}
      <Modal
        isOpen={!!showSyncDialog}
        onClose={() => setShowSyncDialog(null)}
        title="Sync Collection"
        description="This will trigger a full re-index of all sources in the collection."
      >
        <p className="text-muted-foreground mb-4">Are you sure you want to sync this collection? This may take a few minutes.</p>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setShowSyncDialog(null)}>Cancel</Button>
          <Button onClick={confirmSync}>Sync Now</Button>
        </div>
      </Modal>
    </section>
  );
}