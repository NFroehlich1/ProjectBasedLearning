// @ts-nocheck
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
    
    // Get API keys from environment variable
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY') || Deno.env.get('GEMINI-API-KEY')
    const groqApiKey = Deno.env.get('GROQ_API_KEY')
    const fallbackApiKey = Deno.env.get('FALLBACK_API_KEY')
    
    console.log('Gemini API Key check:', geminiApiKey ? `Found (${geminiApiKey.substring(0, 10)}...)` : 'NOT FOUND')
    console.log('Fallback API Key check:', fallbackApiKey ? `Found (${fallbackApiKey.substring(0, 10)}...)` : 'NOT FOUND')
    console.log('Groq API Key check:', groqApiKey ? `Found (${groqApiKey.substring(0, 10)}...)` : 'NOT FOUND')
    
    if (!geminiApiKey && !fallbackApiKey && !groqApiKey) {
      console.error('No API keys found')
      return new Response(
        JSON.stringify({ 
          error: 'Server configuration error: No API keys found',
          details: 'Please set GEMINI_API_KEY or FALLBACK_API_KEY or GROQ_API_KEY in Supabase secrets'
        }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Parse request body
    const body = await req.json()
    const { conversationContext, userQuestion, chatHistory } = body

    console.log('Request:', { 
      hasContext: !!conversationContext, 
      contextLength: conversationContext?.length || 0,
      question: userQuestion?.substring(0, 100) + '...',
      historyLength: chatHistory?.length || 0
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

    // Build the prompt for Gemini with PDF context and chat history
    let prompt = ''
    
    // Base system context with PDF knowledge
    const systemContext = `You are an AI assistant specialized in Project-Based Learning (PBL). You have access to comprehensive academic research including:
- Krajcik & Blumenfeld 2006: PBL in Handbook of the Learning Sciences
- Guo et al. 2020: PBL Review
- Condliffe et al. 2017: PBL Review  
- Blumenfeld et al. 1991: Motivating Project-Based Learning
- Thomas 2000: Review of PBL

Use this knowledge base to provide accurate, research-backed answers. Format your response in Markdown with proper headings, lists, and emphasis where appropriate.`
    
    // Build context sections
    let contextSections: string[] = []
    
    // Add ElevenLabs conversation context if available
    if (conversationContext && conversationContext.trim() !== '') {
      contextSections.push(`## ElevenLabs Conversation Context:\n${conversationContext}`)
    }
    
    // Add chat history if available
    if (chatHistory && chatHistory.length > 0) {
      let historyText = '## Previous Chat History:\n'
      chatHistory.forEach(msg => {
        historyText += `**${msg.role === 'user' ? 'User' : 'Assistant'}:** ${msg.content}\n\n`
      })
      contextSections.push(historyText)
    }
    
    // Build final prompt
    prompt = systemContext
    
    if (contextSections.length > 0) {
      prompt += '\n\n' + contextSections.join('\n\n')
    }
    
    prompt += `\n\n## Current Question:\n${userQuestion}\n\nProvide a clear, well-researched answer using your PBL knowledge base and the context above. Use Markdown formatting.`

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

    const tryModelsWithKey = async (apiKey: string): Promise<{ okResponse: Response | null; modelUsed: string }> => {
      for (const model of modelsToTry) {
        console.log(`Trying model: ${model}`)
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`
        try {
          const res = await fetch(geminiUrl, {
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
          if (res.ok) {
            console.log(`✅ Success with model: ${model}`)
            return { okResponse: res, modelUsed: model }
          } else {
            console.log(`❌ Model ${model} failed with status: ${res.status}`)
          }
        } catch (error) {
          // deno-lint-ignore no-explicit-any
          const message = (error as any)?.message || String(error)
          console.log(`❌ Model ${model} error:`, message)
        }
      }
      return { okResponse: null, modelUsed: '' }
    }

    let finalResponse: Response | null = null
    let usedModel = ''
    let apiKeySource = ''

    if (geminiApiKey) {
      const primaryAttempt = await tryModelsWithKey(geminiApiKey)
      if (primaryAttempt.okResponse) {
        finalResponse = primaryAttempt.okResponse
        usedModel = primaryAttempt.modelUsed
        apiKeySource = 'primary'
      }
    }

    if (!finalResponse && fallbackApiKey) {
      console.log('Primary key failed across models. Trying FALLBACK_API_KEY...')
      const fallbackAttempt = await tryModelsWithKey(fallbackApiKey)
      if (fallbackAttempt.okResponse) {
        finalResponse = fallbackAttempt.okResponse
        usedModel = fallbackAttempt.modelUsed
        apiKeySource = 'fallback'
      }
    }

    if (!finalResponse) {
      console.error('All Gemini attempts failed with both primary and fallback API keys')
      return new Response(
        JSON.stringify({ 
          error: 'All Gemini models failed with available API keys',
          details: 'No successful response from any model using primary or fallback key',
          triedModels: modelsToTry
        }),
        { 
          status: 502,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('Gemini API response status:', finalResponse.status)

    const data = await finalResponse.json()
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
        model: usedModel || 'unknown',
        apiKeySource
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
