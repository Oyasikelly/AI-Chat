import { chat, toStreamResponse, toolDefinition } from '@tanstack/ai'
import { gemini } from '@tanstack/ai-gemini'

import { createFileRoute } from '@tanstack/react-router'
import z from 'zod'

export const Route = createFileRoute('/api/chat')({
  server: { handlers: { POST } },
})

export async function POST({ request }: { request: Request }) {
  if (!process.env.GEMINI_API_KEY) {
    return new Response(
      JSON.stringify({
        error: 'GEMINI_API_KEY not configured',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      },
    )
  }

  const { messages, conversationId } = await request.json()

  try {
    const allMessages = [
      {
        role: 'system',
        content: `You are a helpful AI assistant. 
        
        Formatting Rules:
        - Use Markdown for all responses.
        - Use code blocks for code snippets with language tags.
        - Use headings for sections.
        - Use bullet points and lists for readability.
        - Be concise and professional.`,
      },
      ...messages,
    ]

    const stream = chat({
      adapter: gemini(),
      messages: allMessages,
      model: 'gemini-2.5-flash',
      tools: [
        getTodosTool, 
        updateCounterToolDef, 
        getWeatherTool,
        getHNStoriesTool,
        getCryptoPriceTool,
        getWikipediaTool,
        getDictionaryTool,
      ],
      conversationId,
    })

    return toStreamResponse(stream)
  } catch (error) {
    console.error(error)
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'An error occurred',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      },
    )
  }
}

const getTodosToolDef = toolDefinition({
  description: 'Fetch a list of todos from the database',
  inputSchema: z.object({
    query: z
      .string()
      .optional()
      .describe('An optional search query to filter todos'),
  }),
  outputSchema: z.array(
    z.object({
      id: z.number(),
      title: z.string(),
      completed: z.boolean(),
      userId: z.number(),
    }),
  ),
  name: 'get_todos',
})

const getTodosTool = getTodosToolDef.server(async ({ query }) => {
  const url = new URL('https://jsonplaceholder.typicode.com/todos')
  if (query) url.searchParams.set('q', query)
  console.log(url.toString())

  const response = await fetch(url.toString())
  return await response.json()
})

export const updateCounterToolDef = toolDefinition({
  name: 'set_count',
  description: 'Set the counter value stored in the browser',
  inputSchema: z.object({
    count: z.number().describe('The new counter value to set'),
  }),
  outputSchema: z.object({ success: z.boolean() }),
})

// Weather Tool
const getWeatherToolDef = toolDefinition({
  name: 'get_weather',
  description: 'Get current weather information for a city',
  inputSchema: z.object({
    city: z.string().describe('The city name to get weather for'),
  }),
  outputSchema: z.object({
    city: z.string(),
    temperature: z.number(),
    weatherCode: z.number(),
    windSpeed: z.number(),
  }),
})

const getWeatherTool = getWeatherToolDef.server(async ({ city }) => {
  // First, geocode the city name
  const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
  const geoResponse = await fetch(geoUrl)
  const geoData = await geoResponse.json()
  
  if (!geoData.results || geoData.results.length === 0) {
    throw new Error(`City "${city}" not found`)
  }
  
  const { latitude, longitude, name } = geoData.results[0]
  
  // Get weather data
  const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code,wind_speed_10m`
  const weatherResponse = await fetch(weatherUrl)
  const weatherData = await weatherResponse.json()
  
  return {
    city: name,
    temperature: weatherData.current.temperature_2m,
    weatherCode: weatherData.current.weather_code,
    windSpeed: weatherData.current.wind_speed_10m,
  }
})

// Hacker News Tool
const getHNStoriesToolDef = toolDefinition({
  name: 'get_latest_stories',
  description: 'Get the latest top stories from Hacker News',
  inputSchema: z.object({
    limit: z.number().optional().default(5).describe('Number of stories to fetch (default: 5)'),
  }),
  outputSchema: z.array(
    z.object({
      title: z.string(),
      url: z.string().optional(),
      score: z.number(),
      by: z.string(),
    }),
  ),
})

const getHNStoriesTool = getHNStoriesToolDef.server(async ({ limit = 5 }) => {
  const topStoriesResponse = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json')
  const topStoryIds = await topStoriesResponse.json()
  
  const stories = await Promise.all(
    topStoryIds.slice(0, limit).map(async (id: number) => {
      const storyResponse = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`)
      return await storyResponse.json()
    })
  )
  
  return stories.map((story: any) => ({
    title: story.title,
    url: story.url || `https://news.ycombinator.com/item?id=${story.id}`,
    score: story.score,
    by: story.by,
  }))
})

// Crypto Price Tool
const getCryptoPriceToolDef = toolDefinition({
  name: 'get_crypto_price',
  description: 'Get the current price of a cryptocurrency in USD',
  inputSchema: z.object({
    crypto: z.string().describe('The cryptocurrency symbol (e.g., bitcoin, ethereum)'),
  }),
  outputSchema: z.object({
    crypto: z.string(),
    price: z.number(),
    currency: z.string(),
  }),
})

const getCryptoPriceTool = getCryptoPriceToolDef.server(async ({ crypto }) => {
  const cryptoId = crypto.toLowerCase()
  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${cryptoId}&vs_currencies=usd`
  const response = await fetch(url)
  const data = await response.json()
  
  if (!data[cryptoId]) {
    throw new Error(`Cryptocurrency "${crypto}" not found`)
  }
  
  return {
    crypto: cryptoId,
    price: data[cryptoId].usd,
    currency: 'USD',
  }
})

// Wikipedia Tool
const getWikipediaToolDef = toolDefinition({
  name: 'search_wikipedia',
  description: 'Search Wikipedia and get a summary of a topic',
  inputSchema: z.object({
    topic: z.string().describe('The topic to search for on Wikipedia'),
  }),
  outputSchema: z.object({
    title: z.string(),
    summary: z.string(),
    url: z.string(),
  }),
})

const getWikipediaTool = getWikipediaToolDef.server(async ({ topic }) => {
  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(topic)}`
  const response = await fetch(url)
  
  if (!response.ok) {
    throw new Error(`Wikipedia article for "${topic}" not found`)
  }
  
  const data = await response.json()
  
  return {
    title: data.title,
    summary: data.extract,
    url: data.content_urls.desktop.page,
  }
})

// Dictionary Tool
const getDictionaryToolDef = toolDefinition({
  name: 'define_word',
  description: 'Get the definition of a word',
  inputSchema: z.object({
    word: z.string().describe('The word to define'),
  }),
  outputSchema: z.object({
    word: z.string(),
    phonetic: z.string().optional(),
    definitions: z.array(z.string()),
  }),
})

const getDictionaryTool = getDictionaryToolDef.server(async ({ word }) => {
  const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`
  const response = await fetch(url)
  
  if (!response.ok) {
    throw new Error(`Definition for "${word}" not found`)
  }
  
  const data = await response.json()
  const entry = data[0]
  
  const definitions = entry.meanings
    .flatMap((meaning: any) => meaning.definitions.map((def: any) => def.definition))
    .slice(0, 3) // Limit to 3 definitions
  
  return {
    word: entry.word,
    phonetic: entry.phonetic || entry.phonetics[0]?.text,
    definitions,
  }
})

