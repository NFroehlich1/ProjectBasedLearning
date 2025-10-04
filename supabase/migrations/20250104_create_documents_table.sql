-- Enable pgvector extension
create extension if not exists vector;

-- Create documents table for RAG
create table if not exists documents (
  id uuid default gen_random_uuid() primary key,
  content text not null,
  embedding vector(1536), -- OpenAI ada-002 dimension or 768 for other models
  document_name text not null,
  document_url text not null,
  page_number int,
  chunk_index int,
  metadata jsonb default '{}'::jsonb,
  created_at timestamp with time zone default now()
);

-- Create index for similarity search
create index on documents using ivfflat (embedding vector_cosine_ops)
with (lists = 100);

-- Create index for document lookup
create index on documents (document_name);
create index on documents (page_number);

-- Function to search similar documents
create or replace function match_documents (
  query_embedding vector(1536),
  match_threshold float default 0.78,
  match_count int default 5
)
returns table (
  id uuid,
  content text,
  document_name text,
  document_url text,
  page_number int,
  similarity float
)
language sql stable
as $$
  select
    documents.id,
    documents.content,
    documents.document_name,
    documents.document_url,
    documents.page_number,
    1 - (documents.embedding <=> query_embedding) as similarity
  from documents
  where 1 - (documents.embedding <=> query_embedding) > match_threshold
  order by documents.embedding <=> query_embedding
  limit match_count;
$$;

-- Grant permissions (adjust based on your auth setup)
-- For public access (adjust for your security needs):
-- alter table documents enable row level security;
-- create policy "Documents are viewable by everyone" on documents for select using (true);
