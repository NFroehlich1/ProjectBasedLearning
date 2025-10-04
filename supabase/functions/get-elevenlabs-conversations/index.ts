// Supabase Edge Function to fetch ElevenLabs conversations
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
    console.log('=== Edge Function Started ===')
    
    // Get API key from environment variable
    const apiKey = Deno.env.get('ELEVENLABS_API_KEY')
    
    console.log('API Key check:', apiKey ? `Found (${apiKey.substring(0, 10)}...)` : 'NOT FOUND')
    
    if (!apiKey) {
      console.error('ELEVENLABS_API_KEY environment variable is not set')
      return new Response(
        JSON.stringify({ 
          error: 'Server configuration error: API key not found',
          details: 'ELEVENLABS_API_KEY secret is not configured'
        }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const url = new URL(req.url)
    const agentId = url.searchParams.get('agent_id')
    const conversationId = url.searchParams.get('conversation_id')

    console.log('Parameters:', { agentId, conversationId })

    if (!agentId) {
      return new Response(
        JSON.stringify({ error: 'agent_id parameter is required' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    let elevenLabsUrl: string
    
    // Determine which ElevenLabs endpoint to call
    if (conversationId) {
      elevenLabsUrl = `https://api.elevenlabs.io/v1/convai/conversations/${conversationId}`
      console.log('Fetching specific conversation:', conversationId)
    } else {
      elevenLabsUrl = `https://api.elevenlabs.io/v1/convai/conversations?agent_id=${agentId}`
      console.log('Fetching conversations for agent:', agentId)
    }

    // Call ElevenLabs API
    console.log('Calling ElevenLabs API:', elevenLabsUrl)
    
    const response = await fetch(elevenLabsUrl, {
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json'
      }
    })

    console.log('ElevenLabs API response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('ElevenLabs API error:', response.status, errorText)
      
      return new Response(
        JSON.stringify({ 
          error: `ElevenLabs API error: ${response.status}`,
          details: errorText,
          elevenlabsStatus: response.status
        }),
        { 
          status: response.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const data = await response.json()
    console.log('Successfully fetched data from ElevenLabs')

    return new Response(
      JSON.stringify(data),
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
