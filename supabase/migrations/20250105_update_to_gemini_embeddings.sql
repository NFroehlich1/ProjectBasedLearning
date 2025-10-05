-- Update embedding column dimension for Gemini (768 dimensions)
ALTER TABLE documents ALTER COLUMN embedding TYPE vector(768);

-- Recreate index for new dimension
DROP INDEX IF EXISTS documents_embedding_idx;
CREATE INDEX documents_embedding_idx ON documents 
USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Update match_documents function for Gemini embeddings
CREATE OR REPLACE FUNCTION match_documents (
  query_embedding vector(768),
  match_threshold float DEFAULT 0.78,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id uuid,
  content text,
  document_name text,
  document_url text,
  page_number int,
  similarity float
)
LANGUAGE sql STABLE
AS $$
  SELECT
    documents.id,
    documents.content,
    documents.document_name,
    documents.document_url,
    documents.page_number,
    1 - (documents.embedding <=> query_embedding) as similarity
  FROM documents
  WHERE 1 - (documents.embedding <=> query_embedding) > match_threshold
  ORDER BY documents.embedding <=> query_embedding
  LIMIT match_count;
$$;
