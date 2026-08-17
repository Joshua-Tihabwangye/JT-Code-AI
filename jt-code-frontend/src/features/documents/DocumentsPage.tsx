import { useState } from 'react';
import type { ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApiClient } from '@/lib/api/client';
import { listDocuments, createDocument } from '@/features/documents/api';
import { Button, Card, CardContent, CardHeader, CardTitle, Spinner, Alert, Modal, Input, Textarea } from '@/shared/components';
import { Plus, FileText, Calendar, Download, FileSymlink } from 'lucide-react';
import { formatDate } from '@/shared/utils';
import type { Document } from '@/features/documents/api';

const templates = [
  { id: 'report', name: 'Report', description: 'Structured report with sections' },
  { id: 'proposal', name: 'Proposal', description: 'Business proposal template' },
  { id: 'meeting-notes', name: 'Meeting Notes', description: 'Meeting minutes template' },
  { id: 'summary', name: 'Summary', description: 'Concise summary document' },
  { id: 'research-brief', name: 'Research Brief', description: 'Research synthesis and findings' },
  { id: 'product-spec', name: 'Product Spec', description: 'Technical design document' },
  { id: 'resume', name: 'Resume', description: 'Professional resume / CV' },
  { id: 'letter', name: 'Letter', description: 'Cover letter or formal letter' },
];

const templateIcons: Record<string, ReactNode> = {
  'report': <FileText size={18} />,
  'proposal': <FileText size={18} />,
  'meeting-notes': <FileText size={18} />,
  'summary': <FileText size={18} />,
  'research-brief': <FileText size={18} />,
  'product-spec': <FileText size={18} />,
  'resume': <FileText size={18} />,
  'letter': <FileText size={18} />,
};

export function DocumentsPage() {
  const client = useApiClient();
  const queryClient = useQueryClient();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(templates[0]?.id ?? 'report');
  const [docTitle, setDocTitle] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const documents = useQuery({
    queryKey: ['documents'],
    queryFn: () => listDocuments(client),
    staleTime: 30000,
  });

  const createMutation = useMutation({
    mutationFn: (data: { title: string; template: string; content: string }) =>
      createDocument(client, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['documents'] });
      setShowCreateDialog(false);
      setDocTitle('');
      setSelectedTemplate(templates[0]?.id ?? 'report');
      setSuccess('Document created successfully');
      setTimeout(() => setSuccess(''), 3000);
    },
    onError: () => setError('Failed to create document'),
  });

  const handleCreateDocument = () => {
    if (!docTitle.trim()) return;
    createMutation.mutate({
      title: docTitle,
      template: selectedTemplate,
      content: '',
    });
  };

  return (
    <div className="page-container">
      <header className="workspace-header">
        <div>
          <p className="eyebrow">DOCUMENTS</p>
          <h1 className="text-2xl font-bold text-foreground">Documents</h1>
          <p className="text-sm text-muted-foreground mt-1">Create, organize, and understand documents with JT-Code.</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)} className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus size={16} className="mr-2" />
          New Document
        </Button>
      </header>

      {error && (
        <Alert variant="destructive" className="mb-4" onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert variant="success" className="mb-4" onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {documents.isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : documents.isError ? (
        <Alert variant="destructive">Failed to load documents</Alert>
      ) : (
        <>
          {/* Templates Section */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-foreground mb-4">Templates</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {templates.map((template) => (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => setSelectedTemplate(template.id)}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    selectedTemplate === template.id
                      ? 'border-primary bg-[#e0f0ff] text-primary'
                      : 'border-border bg-card hover:border-primary hover:bg-[#e0f0ff]/30'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {templateIcons[template.id]}
                    <span className="font-medium text-sm">{template.name}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{template.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Recent Documents */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4">Recent Documents</h2>
            {documents.data?.results?.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="text-5xl mb-3"><FileSymlink size={48} /></div>
                  <h3 className="text-lg font-semibold mb-1">No documents yet</h3>
                  <p className="text-muted-foreground mb-4">Create your first document from a template above</p>
                  <Button onClick={() => setShowCreateDialog(true)}>
                    <Plus size={16} className="mr-2" />
                    New Document
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {documents.data?.results?.map((doc: Document) => (
                  <Card key={doc.id} className="group hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-base">{doc.title}</CardTitle>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (doc.content) {
                              window.open(doc.content, '_blank');
                            }
                          }}
                        >
                          <Download size={16} />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
        <span className="px-2 py-0.5 bg-muted rounded-full text-xs">{doc.template}</span>
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          {formatDate(doc.updated_at)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {doc.content || 'No content yet'}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Create Document Modal */}
      <Modal
        isOpen={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        title="Create Document"
        description="Start a new document from a template"
      >
        <div className="space-y-4">
          <Input
            label="Title"
            placeholder="My Document"
            value={docTitle}
            onChange={(e) => setDocTitle(e.target.value)}
            required
          />
          <div>
            <label className="block text-sm font-medium mb-1">Template</label>
            <select
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {templates.map((t) => (
                <option key={t.id} value={t.id}>{t.name} — {t.description}</option>
              ))}
            </select>
          </div>
          <Textarea
            label="Initial Content (Markdown)"
            placeholder="Write your document content..."
            rows={6}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
            <Button onClick={handleCreateDocument} disabled={createMutation.isPending || !docTitle.trim()}>
              {createMutation.isPending ? 'Creating...' : 'Create Document'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
