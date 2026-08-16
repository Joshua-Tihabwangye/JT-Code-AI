import { useRef, useState, type ChangeEvent } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useApiClient, apiErrorMessage } from '@/lib/api/client';
import { listAssets, uploadAsset } from '@/features/files/api';
import { Button, Card, CardContent, Badge, Spinner, Alert } from '@/shared/components';
import { formatDate, cn } from '@/shared/utils';

export function FilesPage() {
  const client = useApiClient();
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [showUploadDialog, setShowUploadDialog] = useState(false);

  const assets = useQuery({
    queryKey: ['assets'],
    queryFn: () => listAssets(client),
    staleTime: 30000,
  });

  function handleFileSelect(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;
    setSelectedFiles(files);
    setShowUploadDialog(true);
    event.target.value = '';
  }

  async function handleUpload() {
    if (selectedFiles.length === 0) return;

    setUploading(true);
    setUploadProgress(0);
    setError('');

    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        if (!file) continue;
        await uploadAsset(client, file);
        setUploadProgress(((i + 1) / selectedFiles.length) * 100);
      }
      await queryClient.invalidateQueries({ queryKey: ['assets'] });
      setSelectedFiles([]);
      setShowUploadDialog(false);
    } catch (cause) {
      setError(apiErrorMessage(cause));
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <section className="workspace">
      <header className="workspace-header">
        <div>
          <p className="eyebrow">FILES</p>
          <h1>Files</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => inputRef.current?.click()}>
            <span>📁</span> Upload
          </Button>
          <Button onClick={() => setShowUploadDialog(true)} disabled={uploading}>
            {uploading ? <Spinner size="sm" /> : 'Upload Files'}
          </Button>
          <input ref={inputRef} hidden type="file" onChange={handleFileSelect} multiple />
        </div>
      </header>

      {error && (
        <Alert variant="destructive" className="mb-4" onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {uploading && (
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm mb-1">
            <span>Uploading... {selectedFiles[0]?.name}</span>
            <span>{Math.round(uploadProgress)}%</span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      <div className="asset-grid">
        {assets.isLoading ? (
          <div className="col-span-full flex items-center justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : assets.isError ? (
          <Alert variant="destructive" className="col-span-full">
            Failed to load files: {apiErrorMessage(assets.error)}
          </Alert>
        ) : assets.data?.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="text-6xl mb-4">📁</div>
              <h3 className="text-lg font-semibold mb-2">No files yet</h3>
              <p className="text-muted-foreground mb-4">Upload your first file to get started</p>
              <Button onClick={() => inputRef.current?.click()}>Upload Files</Button>
            </CardContent>
          </Card>
        ) : (
          assets.data?.map((asset) => (
            <Card key={asset.id} className="group">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className={cn(
                    'flex-shrink-0 flex items-center justify-center rounded-lg w-12 h-12',
                    asset.resourceType === 'image' ? 'bg-green-500/10' :
                    asset.resourceType === 'video' ? 'bg-blue-500/10' :
                    asset.resourceType === 'raw' ? 'bg-amber-500/10' :
                    'bg-gray-500/10'
                  )}>
                    {asset.resourceType === 'image' && (
                      <img src={asset.secureUrl} alt={asset.originalFilename} className="w-8 h-8 rounded object-cover" />
                    )}
                    {asset.resourceType !== 'image' && (
                      <span className="text-xl">
                        {asset.resourceType === 'video' ? '🎬' : asset.resourceType === 'raw' ? '📄' : '📎'}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate" title={asset.originalFilename}>
                      {asset.originalFilename}
                    </h4>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                      <span>{formatBytes(asset.bytes)}</span>
                      <span>{asset.format || 'unknown'}</span>
                      <span>{formatDate(asset.createdAt)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {asset.status}
                    </Badge>
                    <Button variant="ghost" size="sm" asChild>
                      <a href={asset.secureUrl} target="_blank" rel="noopener noreferrer">
                        <span className="text-lg">🔗</span>
                      </a>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Upload Dialog */}
      {showUploadDialog && selectedFiles.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowUploadDialog(false)}>
          <Card className="w-full max-w-md" onClick={e => e.stopPropagation()}>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4">Upload {selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''}</h2>
              <div className="space-y-2 max-h-60 overflow-y-auto mb-4">
                {selectedFiles.map((file, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="truncate max-w-[200px]">{file.name}</span>
                    <span className="text-muted-foreground">{formatBytes(file.size)}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-3 justify-end">
                <Button variant="ghost" onClick={() => setShowUploadDialog(false)}>Cancel</Button>
                <Button onClick={() => void handleUpload()} disabled={uploading}>
                  {uploading ? <Spinner size="sm" /> : 'Upload'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </section>
  );
}