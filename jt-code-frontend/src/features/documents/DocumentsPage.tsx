import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApiClient } from '@/lib/api/client';
import { listDocuments, createDocument, renderDocument } from '@/features/documents/api';
import { Button, Input, Textarea, Card, CardContent, CardHeader, CardTitle, Badge, Spinner, Alert, Modal, Tabs, TabsList, TabsTrigger, TabsContent, Dropdown, DropdownItem, DropdownSeparator } from '@/shared/components';
import { formatDate } from '@/shared/utils';

export function DocumentsPage() {
  const client = useApiClient();
  const queryClient = useQueryClient();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showRenderDialog, setShowRenderDialog] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [newDocument, setNewDocument] = useState({ title: '', template: 'general', content: '' });

  const documents = useQuery({
    queryKey: ['documents'],
    queryFn: () => listDocuments(client),
    staleTime: 30000,
  });

  const createMutation = useMutation({
    mutationFn: (data: typeof newDocument) => createDocument(client, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      setShowCreateDialog(false);
      setNewDocument({ title: '', template: 'general', content: '' });
    },
    onError: () => setError('Failed to create document'),
  });

  const renderMutation = useMutation({
    mutationFn: (id: string) => renderDocument(client, id),
    onError: () => setError('Failed to render document'),
  });

  const templates = [
    { id: 'general', name: 'General Document', description: 'Basic document structure' },
    { id: 'report', name: 'Report', description: 'Structured report with sections' },
    { id: 'proposal', name: 'Proposal', description: 'Business proposal template' },
    { id: 'meeting-notes', name: 'Meeting Notes', description: 'Meeting minutes template' },
    { id: 'technical-spec', name: 'Technical Specification', description: 'Technical design document' },
  ];

  return (
    <section className="workspace">
      <header className="workspace-header">
        <div>
          <p className="eyebrow">DOCUMENTS</p>
          <h1>Documents</h1>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <span>➕</span> New Document
        </Button>
      </header>

      {error && (
        <Alert variant="destructive" className="mb-4" onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {documents.isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : documents.isError ? (
        <Alert variant="destructive">Failed to load documents</Alert>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {documents.data?.results?.map((doc) => (
            <Card key={doc.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{doc.title}</CardTitle>
                    <Badge variant="outline" className="mt-1">{doc.template}</Badge>
                  </div>
                  <Dropdown
                    trigger={<Button variant="ghost" size="sm">⋮</Button>}
                    content={
                      <>
                        <DropdownItem onClick={() => setShowRenderDialog(doc.id)}>Render</DropdownItem>
                        <DropdownItem>Edit</DropdownItem>
                        <DropdownSeparator />
                        <DropdownItem className="text-destructive">Delete</DropdownItem>
                      </>
                    }
                    align="right"
                  />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{doc.content || 'No content'}</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Created: {formatDate(doc.created_at)}</span>
                  <span className="text-muted-foreground">Updated: {formatDate(doc.updated_at)}</span>
                </div>
              </CardContent>
            </Card>
          ))}
          {documents.data?.results?.length === 0 && (
            <Card className="col-span-full">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <div className="text-6xl mb-4">📄</div>
                <h3 className="text-lg font-semibold mb-2">No documents yet</h3>
                <p className="text-muted-foreground mb-4">Create your first document</p>
                <Button onClick={() => setShowCreateDialog(true)}>New Document</Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Create Document Modal */}
      <Modal
        isOpen={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        title="Create Document"
        description="Start a new document from a template"
        size="lg"
      >
        <div className="space-y-4">
          <Input
            label="Title"
            placeholder="My Document"
            value={newDocument.title}
            onChange={(e) => setNewDocument({ ...newDocument, title: e.target.value })}
            required
          />
          <div>
            <label className="block text-sm font-medium mb-1">Template</label>
            <Dropdown
              trigger={
                <Button variant="outline" className="w-full justify-between">
                  {templates.find(t => t.id === newDocument.template)?.name || 'Select template'}
                </Button>
              }
              content={
                <>
                  {templates.map(t => (
                    <DropdownItem key={t.id} onClick={() => setNewDocument({ ...newDocument, template: t.id })}>
                      <div>
                        <div className="font-medium">{t.name}</div>
                        <div className="text-xs text-muted-foreground">{t.description}</div>
                      </div>
                    </DropdownItem>
                  ))}
                </>
              }
            />
          </div>
          <Textarea
            label="Content (Markdown)"
            placeholder="Write your document content in Markdown..."
            value={newDocument.content}
            onChange={(e) => setNewDocument({ ...newDocument, content: e.target.value })}
            rows={10}
          />
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="ghost" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
            <Button onClick={() => createMutation.mutate(newDocument)} disabled={createMutation.isPending || !newDocument.title.trim()}>
              {createMutation.isPending ? <Spinner size="sm" /> : 'Create Document'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Render Document Modal */}
      <Modal
        isOpen={!!showRenderDialog}
        onClose={() => setShowRenderDialog(null)}
        title="Render Document"
        description="Generate a PDF or DOCX from this document"
      >
        <p className="text-muted-foreground mb-4">Choose the output format and options</p>
        <div className="space-y-3 mb-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="radio" name="format" value="pdf" defaultChecked className="text-primary" />
            <span>PDF</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="radio" name="format" value="docx" className="text-primary" />
            <span>DOCX</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="radio" name="format" value="html" className="text-primary" />
            <span>HTML</span>
          </label>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setShowRenderDialog(null)}>Cancel</Button>
          <Button onClick={() => renderMutation.mutate(showRenderDialog!)} disabled={renderMutation.isPending}>
            {renderMutation.isPending ? <Spinner size="sm" /> : 'Render'}
          </Button>
        </div>
      </Modal>
    </section>
  );
}