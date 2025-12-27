# TanStack AI Chat Application

A modern, feature-rich AI chat application built with TanStack Start, TanStack AI, and Google Gemini. This project started as a TanStack AI tutorial example but has been significantly enhanced with chat history, multiple AI tools, and a polished user interface.

## ✨ Features

### 💬 Chat History & Persistence
- **Persistent Conversations**: All chat conversations are saved to localStorage and persist across browser sessions
- **Conversation Sidebar**: Browse and switch between multiple chat conversations
- **Auto-Generated Titles**: Chat titles are automatically generated from the first user message
- **Conversation Management**: Create new chats, delete old conversations, and switch between them seamlessly
- **Smart Message Cleanup**: Automatically removes empty or incomplete messages

### 🎨 Modern UI/UX
- **Markdown Rendering**: Full markdown support with GitHub Flavored Markdown (GFM)
- **Syntax Highlighting**: Beautiful code syntax highlighting using react-syntax-highlighter with VS Code Dark+ theme
- **Responsive Design**: Mobile-friendly interface built with Tailwind CSS
- **shadcn/ui Components**: Modern, accessible UI components including Avatar, Card, Button, Collapsible, and more
- **Auto-Scroll**: Automatically scrolls to the latest message
- **Thinking Blocks**: Collapsible reasoning process display for AI responses
- **Empty State**: Helpful empty state when starting a new conversation

### 🛠️ AI Tools Integration

The AI assistant has access to 6 powerful tools:

1. **Weather Tool** 🌤️
   - Get current weather information for any city
   - Uses Open-Meteo API for accurate weather data
   - Returns temperature, weather code, and wind speed

2. **Cryptocurrency Prices** 💰
   - Get real-time cryptocurrency prices in USD
   - Powered by CoinGecko API
   - Supports Bitcoin, Ethereum, and many other cryptocurrencies

3. **Wikipedia Search** 📚
   - Search Wikipedia and get article summaries
   - Returns title, summary, and article URL
   - Perfect for quick fact-checking and research

4. **Dictionary Definitions** 📖
   - Get word definitions with phonetic pronunciation
   - Returns multiple definitions for comprehensive understanding
   - Uses Free Dictionary API

5. **Hacker News Stories** 📰
   - Fetch the latest top stories from Hacker News
   - Customizable number of stories to fetch
   - Returns title, URL, score, and author

6. **Todo List** ✅
   - Fetch todos from JSONPlaceholder API
   - Demonstrates server-side data fetching
   - Optional search query filtering

### 🏗️ Technical Features
- **TypeScript**: Full type safety throughout the application
- **TanStack Router**: File-based routing with type-safe navigation
- **TanStack AI**: Streaming AI responses with tool calling support
- **Google Gemini**: Powered by Gemini 2.5 Flash model
- **Server-Sent Events**: Real-time streaming responses
- **UUID Generation**: Unique IDs for conversations and messages
- **Error Handling**: Graceful error handling for API failures

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or pnpm package manager
- Google Gemini API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd tanstack-ai-example
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

   Get your Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

4. **Run the development server**
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:3000`

### Building for Production

```bash
npm run build
npm run preview
```

## 📁 Project Structure

```
src/
├── components/
│   ├── chat.tsx                 # Main chat component with conversation logic
│   ├── chat-message.tsx         # Message display with markdown rendering
│   ├── chat-sidebar.tsx         # Conversation history sidebar
│   └── ui/                      # shadcn/ui components
│       ├── avatar.tsx
│       ├── button.tsx
│       ├── card.tsx
│       ├── collapsible.tsx
│       ├── input.tsx
│       ├── scroll-area.tsx
│       ├── separator.tsx
│       ├── sheet.tsx
│       ├── skeleton.tsx
│       └── textarea.tsx
├── lib/
│   ├── conversation-storage.ts  # localStorage management for chat history
│   └── utils.ts                 # Utility functions
├── routes/
│   ├── __root.tsx              # Root layout
│   ├── index.tsx               # Home page with chat interface
│   └── api/
│       └── chat.ts             # API endpoint with AI tools
├── types/
│   └── react-syntax-highlighter.d.ts  # Type definitions
└── styles.css                   # Global styles
```

## 🎯 Usage

### Starting a Conversation

1. Type your message in the input field at the bottom
2. Press Enter or click the Send button
3. The AI will respond with streaming text
4. Your conversation is automatically saved

### Using AI Tools

Simply ask the AI to use its tools in natural language:

- **Weather**: "What's the weather in London?"
- **Crypto**: "What's the current price of Bitcoin?"
- **Wikipedia**: "Tell me about the Eiffel Tower"
- **Dictionary**: "Define the word 'serendipity'"
- **Hacker News**: "Show me the top 5 stories on Hacker News"

### Managing Conversations

- **New Chat**: Click the "New Chat" button in the sidebar
- **Switch Chats**: Click on any conversation in the sidebar
- **Delete Chat**: Hover over a conversation and click the trash icon

## 🛠️ Technology Stack

### Core Framework
- **TanStack Start**: Full-stack React framework
- **TanStack Router**: Type-safe file-based routing
- **TanStack AI**: AI integration with streaming support
- **React 19**: Latest React features

### AI & APIs
- **Google Gemini**: Gemini 2.5 Flash model
- **Open-Meteo API**: Weather data
- **CoinGecko API**: Cryptocurrency prices
- **Wikipedia API**: Article summaries
- **Free Dictionary API**: Word definitions
- **Hacker News API**: Top stories

### UI & Styling
- **Tailwind CSS 4**: Utility-first CSS framework
- **shadcn/ui**: Beautiful, accessible component library
- **Lucide React**: Icon library
- **react-markdown**: Markdown rendering
- **react-syntax-highlighter**: Code syntax highlighting
- **remark-gfm**: GitHub Flavored Markdown support

### Utilities
- **TypeScript**: Type safety
- **Zod**: Schema validation
- **UUID**: Unique ID generation
- **Vite**: Build tool and dev server

## 📝 Scripts

```bash
npm run dev          # Start development server on port 3000
npm run build        # Build for production
npm run preview      # Preview production build
npm run test         # Run tests with Vitest
npm run lint         # Lint code with ESLint
npm run format       # Format code with Prettier
npm run check        # Format and lint code
```

## 🔧 Configuration

### Adding New AI Tools

To add a new tool, edit `src/routes/api/chat.ts`:

1. Define the tool schema using `toolDefinition`:
   ```typescript
   const myToolDef = toolDefinition({
     name: 'my_tool',
     description: 'What the tool does',
     inputSchema: z.object({
       param: z.string().describe('Parameter description'),
     }),
     outputSchema: z.object({
       result: z.string(),
     }),
   })
   ```

2. Implement the tool logic:
   ```typescript
   const myTool = myToolDef.server(async ({ param }) => {
     // Tool implementation
     return { result: 'data' }
   })
   ```

3. Add the tool to the tools array in the `chat()` function

### Customizing the UI

- **Colors**: Edit Tailwind configuration in `tailwind.config.js`
- **Components**: Modify components in `src/components/ui/`
- **Styles**: Update global styles in `src/styles.css`

## 🤝 Contributing

This project is a personal enhancement of the TanStack AI tutorial. Feel free to fork and customize for your own use!

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- Original tutorial by [TanStack](https://tanstack.com)
- UI components from [shadcn/ui](https://ui.shadcn.com)
- Enhanced and customized by Oyasi Kelly

## 📚 Learn More

- [TanStack Start Documentation](https://tanstack.com/start)
- [TanStack AI Documentation](https://tanstack.com/ai)
- [TanStack Router Documentation](https://tanstack.com/router)
- [Google Gemini API](https://ai.google.dev)
- [shadcn/ui](https://ui.shadcn.com)
