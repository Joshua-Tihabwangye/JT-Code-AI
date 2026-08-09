from __future__ import annotations

from celery import shared_task
from django.utils import timezone


@shared_task
def sync_sources():
    """Sync all active knowledge sources"""
    from apps.knowledge.models import Source

    sources = Source.objects.filter(
        is_active=True,
        status__in=[Source.Status.PENDING, Source.Status.INDEXED]
    )

    for source in sources:
        # Check if sync is due
        if source.last_synced_at:
            from apps.knowledge.models import Source
            # This would check sync_schedule
            pass

        # Trigger sync
        from apps.events.outbox import enqueue_outbox_event
        enqueue_outbox_event(
            topic='knowledge.source.sync',
            event_key=str(source.id),
            payload={
                'source_id': str(source.id),
                'collection_id': str(source.collection_id),
                'organization_id': str(source.collection.organization_id),
            },
            headers={'trace_id': f'sync-{source.id}'}
        )


@shared_task
def process_document(document_id: str):
    """Process a document for indexing"""
    from apps.knowledge.models import Document, Chunk
    from apps.events.outbox import enqueue_outbox_event

    try:
        document = Document.objects.get(id=document_id)
    except Document.DoesNotExist:
        return

    document.status = Document.Status.PARSING
    document.save(update_fields=['status'])

    # Parse document based on mime type
    # This would use appropriate parser (PDF, DOCX, etc.)

    document.status = Document.Status.CHUNKING
    document.save(update_fields=['status'])

    # Create chunks
    # This would use the configured chunking strategy

    document.status = Document.Status.EMBEDDING
    document.save(update_fields=['status'])

    # Generate embeddings and store in vector DB

    document.status = Document.Status.INDEXED
    document.indexed_at = timezone.now()
    document.chunk_count = 0  # Would be actual count
    document.vector_ids = []
    document.save(update_fields=['status', 'indexed_at', 'chunk_count', 'vector_ids'])

    # Update collection counts
    collection = document.collection
    collection.document_count = collection.documents.filter(status=Document.Status.INDEXED).count()
    collection.chunk_count = Chunk.objects.filter(collection=collection).count()
    collection.last_indexed_at = timezone.now()
    collection.save(update_fields=['document_count', 'chunk_count', 'last_indexed_at'])

    enqueue_outbox_event(
        topic='knowledge.document.indexed',
        event_key=str(document.id),
        payload={
            'document_id': str(document.id),
            'collection_id': str(collection.id),
            'chunk_count': collection.chunk_count,
        },
        headers={'trace_id': f'doc-{document.id}'}
    )


@shared_task
def rerank_chunks(query: str, chunk_ids: list, top_k: int = 5):
    """Rerank chunks using cross-encoder"""
    # This would use a reranker model
    # For now, return original order
    return chunk_ids[:top_k]