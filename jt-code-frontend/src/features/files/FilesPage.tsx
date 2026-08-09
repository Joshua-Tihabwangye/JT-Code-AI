import { useRef, useState, type ChangeEvent } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useApiClient, apiErrorMessage } from '@/lib/api/client';
import { listAssets, uploadAsset } from '@/features/files/api';

export function FilesPage() {
  const client = useApiClient();
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const assets = useQuery({ queryKey: ['assets'], queryFn: () => listAssets(client) });

  async function selected(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true); setError('');
    try {
      await uploadAsset(client, file);
      await queryClient.invalidateQueries({ queryKey: ['assets'] });
    } catch (cause) {
      setError(apiErrorMessage(cause));
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  }

  return (
    <section className="workspace">
      <header className="workspace-header">
        <div><p className="eyebrow">CLOUDINARY ASSETS</p><h1>Files</h1></div>
        <button className="button primary" onClick={() => inputRef.current?.click()} disabled={uploading}>
          {uploading ? 'Uploading…' : 'Upload file'}
        </button>
        <input ref={inputRef} hidden type="file" onChange={(event) => void selected(event)} />
      </header>
      {error && <p className="error-banner" role="alert">{error}</p>}
      {assets.isLoading && <p>Loading files…</p>}
      {assets.isError && <p className="error-banner">{apiErrorMessage(assets.error)}</p>}
      <div className="asset-grid">
        {assets.data?.map((asset) => (
          <a key={asset.id} className="asset-card" href={asset.secureUrl} target="_blank" rel="noreferrer">
            <strong>{asset.originalFilename}</strong>
            <span>{asset.resourceType} · {(asset.bytes / 1024).toFixed(1)} KB</span>
            <span>{asset.status}</span>
          </a>
        ))}
        {!assets.isLoading && assets.data?.length === 0 && <p>No files yet.</p>}
      </div>
    </section>
  );
}
