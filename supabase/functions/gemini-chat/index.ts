// Supabase Edge Function to query Google Gemini AI
// Allows users to ask questions about conversation transcripts

import { serve } from "https://deno.land/std@0.177.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('=== Gemini Chat Function Started ===')
    
    // Get API key from environment variable (try both naming conventions)
    const apiKey = Deno.env.get('GEMINI_API_KEY') || Deno.env.get('GEMINI-API-KEY')
    
    console.log('API Key check:', apiKey ? `Found (${apiKey.substring(0, 10)}...)` : 'NOT FOUND')
    
    if (!apiKey) {
      console.error('GEMINI_API_KEY or GEMINI-API-KEY environment variable is not set')
      return new Response(
        JSON.stringify({ 
          error: 'Server configuration error: API key not found',
          details: 'GEMINI_API_KEY or GEMINI-API-KEY secret is not configured'
        }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Parse request body
    const body = await req.json()
    const { conversationContext, userQuestion } = body

    console.log('Request:', { 
      hasContext: !!conversationContext, 
      contextLength: conversationContext?.length || 0,
      question: userQuestion?.substring(0, 100) + '...'
    })

    if (!userQuestion) {
      return new Response(
        JSON.stringify({ error: 'userQuestion is required' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Build the prompt for Gemini with PDF context
    let prompt = ''
    
    // Base system context with PDF knowledge
    const systemContext = `You are an AI assistant specialized in Project-Based Learning (PBL). You have access to comprehensive academic research including:
- Krajcik & Blumenfeld 2006: PBL in Handbook of the Learning Sciences
- Guo et al. 2020: PBL Review
- Condliffe et al. 2017: PBL Review  
- Blumenfeld et al. 1991: Motivating Project-Based Learning
- Thomas 2000: Review of PBL

Use this knowledge base to provide accurate, research-backed answers.`
    
    if (conversationContext && conversationContext.trim() !== '') {
      prompt = `${systemContext}

Here is a conversation transcript to analyze:
---
${conversationContext}
---

Based on the conversation above and your PBL knowledge base, please answer:
${userQuestion}

Provide a clear, well-researched answer.`
    } else {
      prompt = `${systemContext}

Question: ${userQuestion}

Provide a clear, research-backed answer using your PBL knowledge base.`
    }

    // Call Google Gemini API with fallback models
    console.log('Calling Gemini API...')
    
    // Try multiple models in order of preference
    const modelsToTry = [
      'gemini-2.0-flash-exp',
      'gemini-1.5-flash-latest',
      'gemini-1.5-flash',
      'gemini-1.5-pro-latest',
      'gemini-pro'
    ]
    
    let response = null
    let usedModel = ''
    
    for (const model of modelsToTry) {
      console.log(`Trying model: ${model}`)
      
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`
      
      try {
        response = await fetch(geminiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: prompt
              }]
            }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 2048,
            }
          })
        })
        
        if (response.ok) {
          usedModel = model
          console.log(`✅ Success with model: ${model}`)
          break
        } else {
          console.log(`❌ Model ${model} failed with status: ${response.status}`)
        }
      } catch (error) {
        console.log(`❌ Model ${model} error:`, error.message)
      }
    }
    
    if (!response || !response.ok) {
      const errorText = response ? await response.text() : 'No successful response from any model'
      console.error('All Gemini models failed. Last error:', errorText)
      
      return new Response(
        JSON.stringify({ 
          error: `All Gemini models failed. Last status: ${response?.status || 'unknown'}`,
          details: errorText,
          triedModels: modelsToTry
        }),
        { 
          status: response?.status || 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('Gemini API response status:', response.status)

    const data = await response.json()
    console.log('Successfully fetched response from Gemini')

    // Extract the text from Gemini's response
    let answerText = ''
    if (data.candidates && data.candidates.length > 0) {
      const candidate = data.candidates[0]
      if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
        answerText = candidate.content.parts[0].text
      }
    }

    if (!answerText) {
      throw new Error('No text content in Gemini response')
    }

    return new Response(
      JSON.stringify({ 
        answer: answerText,
        model: usedModel || 'unknown'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Edge Function Error:', error)
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error.message,
        stack: error.stack
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
