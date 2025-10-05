// Supabase Edge Function for RAG-based Chat with Source Citations
// Performs similarity search and returns grounded responses with PDF links

import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface Source {
  text_snippet: string
  content: string
  document_name: string
  document_url: string
  page_number: number
  similarity: number
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('=== RAG Chat Function Started ===')
    
    // Get API keys
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY') || Deno.env.get('GEMINI-API-KEY')
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'https://rcfgpdrrnhltozrnsgic.supabase.co'
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!geminiApiKey) {
      return new Response(
        JSON.stringify({ error: 'Missing GEMINI_API_KEY or GEMINI-API-KEY' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    if (!supabaseServiceKey) {
      return new Response(
        JSON.stringify({ error: 'Missing SUPABASE_SERVICE_ROLE_KEY' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Parse request
    const body = await req.json()
    const { userQuestion, chatHistory } = body

    if (!userQuestion) {
      return new Response(
        JSON.stringify({ error: 'userQuestion is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Question:', userQuestion.substring(0, 100))

    // Step 1: Generate embedding for the question using Gemini
    console.log('Generating embedding with Gemini...')
    const embeddingResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'models/text-embedding-004',
          content: {
            parts: [{
              text: userQuestion
            }]
          }
        })
      }
    )

    if (!embeddingResponse.ok) {
      throw new Error(`Gemini Embedding API error: ${embeddingResponse.status}`)
    }

    const embeddingData = await embeddingResponse.json()
    const queryEmbedding = embeddingData.embedding.values

    // Step 2: Perform similarity search
    console.log('Performing similarity search...')
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    const { data: matches, error: searchError } = await supabase.rpc('match_documents', {
      query_embedding: queryEmbedding,
      match_threshold: 0.7,
      match_count: 5
    })

    if (searchError) {
      console.error('Search error:', searchError)
      throw new Error('Similarity search failed')
    }

    console.log(`Found ${matches?.length || 0} relevant chunks`)

    // Step 3: Build context and sources
    let context = ''
    const sources: Source[] = []

    if (matches && matches.length > 0) {
      matches.forEach((match: any, index: number) => {
        context += `[Source ${index + 1}] ${match.content}\n\n`
        sources.push({
          text_snippet: match.content.substring(0, 150).trim(), // Short snippet for text highlighting
          content: match.content, // Full content for citation display
          document_name: match.document_name,
          document_url: match.document_url,
          page_number: match.page_number,
          similarity: match.similarity
        })
      })
    }

    // Step 4: Build prompt with chat history
    let prompt = `You are an AI assistant specialized in Project-Based Learning.

You have access to comprehensive academic research including:
- Krajcik & Blumenfeld 2006: PBL in Handbook of the Learning Sciences
- Guo et al. 2020: PBL Review
- Condliffe et al. 2017: PBL Review  
- Blumenfeld et al. 1991: Motivating Project-Based Learning
- Thomas 2000: Review of PBL

${context ? `## Research Excerpts:\n${context}\n` : ''}
## Chat History:
${chatHistory && chatHistory.length > 0 
  ? chatHistory.map((msg: any) => `${msg.role}: ${msg.content}`).join('\n') 
  : 'No previous messages'}

## Current Question:
${userQuestion}

${context 
  ? 'Provide a clear answer with citations [1], [2], etc. referencing the sources above.' 
  : 'Provide a clear, research-informed answer based on your knowledge of Project-Based Learning.'
} Use Markdown formatting.`

    // Step 5: Call Gemini API
    console.log('Calling Gemini...')
    
    const models = ['gemini-2.0-flash-exp', 'gemini-1.5-flash-latest', 'gemini-1.5-flash']
    let geminiResponse = null
    let usedModel = ''

    for (const model of models) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiApiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{
                parts: [{ text: prompt }]
              }],
              generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 2048
              }
            })
          }
        )

        if (response.ok) {
          geminiResponse = await response.json()
          usedModel = model
          console.log(`✅ Success with ${model}`)
          break
        }
      } catch (err) {
        console.log(`Failed with ${model}`)
      }
    }

    if (!geminiResponse) {
      throw new Error('All Gemini models failed')
    }

    // Extract answer
    const generatedText = geminiResponse.candidates[0].content.parts[0].text

    // Step 6: Return structured response
    return new Response(
      JSON.stringify({
        generated_text: generatedText,
        sources: sources,
        model: usedModel,
        num_sources: sources.length
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error.message 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
