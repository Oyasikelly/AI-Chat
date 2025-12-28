'use client'

import { useState, useRef, useEffect } from 'react'
import { fetchServerSentEvents, useChat } from '@tanstack/ai-react'
import { ChatMessage } from './chat-message'
import { ChatSidebar } from './chat-sidebar'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { CornerDownLeft, Loader2, Menu } from 'lucide-react'
import {
  getActiveConversation,
  createConversation,
  setActiveConversation,
  addMessage,
  cleanupEmptyMessages,
  type Conversation,
} from '@/lib/conversation-storage'

export function Chat() {
  const [input, setInput] = useState('')
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const { messages, sendMessage, isLoading, setMessages } = useChat({
    connection: fetchServerSentEvents('/api/chat'),
  })
  
  // Initialize or load conversation on mount
  useEffect(() => {
    // Clean up any empty messages from previous sessions
    cleanupEmptyMessages()
    
    let conversation = getActiveConversation()
    
    if (!conversation) {
      // Create first conversation
      conversation = createConversation()
    }
    
    setCurrentConversation(conversation)
    
    // Load messages from conversation
    if (conversation.messages.length > 0) {
      setMessages(conversation.messages.map(msg => ({
        id: msg.id,
        role: msg.role,
        parts: msg.parts || [{ type: 'text', content: msg.content }],
      })) as any)
    }
  }, [])

  // Track last saved message count to avoid comparison issues
  const lastSavedCountRef = useRef(0)

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (!currentConversation || messages.length === 0) return
    
    // Save or update messages in storage
    messages.forEach((msg, index) => {
      // Get text content from parts
      const content = msg.parts?.filter(p => p.type === 'text').map(p => p.content).join('') ?? ''
      
      // If we already saved more messages than this index, we might need to update the existing one
      // (especially for the last message which might have been a streaming shell)
      if (index < lastSavedCountRef.current) {
         // Optionally update existing message if it was empty before
         // For now, let's focus on appending new ones correctly
         return
      }

      // Skip saving if content is empty (message is still streaming)
      if (!content.trim()) return
      
      addMessage(currentConversation.id, {
        role: msg.role as 'user' | 'assistant',
        content,
        parts: msg.parts,
      })
      
      lastSavedCountRef.current++
    })
    
    // Reload conversation to get updated data (including auto-generated title)
    const updated = getActiveConversation()
    if (updated) {
      setCurrentConversation(updated)
    }
  }, [messages, currentConversation?.id])
  
  // Auto scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!input.trim() || isLoading) return
    
    await sendMessage(input)
    setInput('')
  }
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
      // Create new line on Shift+Enter, submit on Enter
      if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault()
          handleSubmit()
      }
  }

  const handleConversationSelect = (id: string) => {
    setActiveConversation(id)
    
    // Load the selected conversation
    const conversation = getActiveConversation()
    if (conversation) {
      setCurrentConversation(conversation)
      
      // Load messages
      if (conversation.messages.length > 0) {
        setMessages(conversation.messages.map(msg => ({
          id: msg.id,
          role: msg.role,
          parts: msg.parts || [{ type: 'text', content: msg.content }],
        })) as any)
        // Reset saved count to loaded message count
        lastSavedCountRef.current = conversation.messages.length
      } else {
        setMessages([])
        lastSavedCountRef.current = 0
      }
    }
  }

  const handleNewChat = () => {
    const newConversation = createConversation()
    setCurrentConversation(newConversation)
    setMessages([])
    lastSavedCountRef.current = 0
    setIsSidebarOpen(false) // Close sidebar on mobile after creating new chat
  }

  return (
    <div className="flex h-screen w-full bg-muted/40">
      {/* Sidebar */}
      <ChatSidebar
        activeConversationId={currentConversation?.id || null}
        onConversationSelect={(id) => {
          handleConversationSelect(id)
          setIsSidebarOpen(false) // Close sidebar on mobile after selecting conversation
        }}
        onNewChat={handleNewChat}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Chat Area */}
      <div className="flex flex-1 flex-col p-0 sm:p-4 md:p-6 overflow-hidden">
        <Card className="flex flex-1 flex-col overflow-hidden shadow-none sm:shadow-xl border-0 sm:border border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 rounded-none sm:rounded-xl">
             {/* Header */}
             <div className="border-b p-3 sm:p-4 bg-muted/20 flex items-center gap-3">
                 {/* Hamburger Menu for Mobile */}
                 <Button
                   variant="ghost"
                   size="icon"
                   className="lg:hidden h-9 w-9 flex-shrink-0"
                   onClick={() => setIsSidebarOpen(true)}
                 >
                   <Menu className="h-5 w-5" />
                 </Button>
                 
                 <div className="flex-1 min-w-0">
                   <h2 className="text-base sm:text-lg font-semibold tracking-tight truncate">
                     {currentConversation?.title || 'Chat with AI'}
                   </h2>
                   <p className="text-xs sm:text-sm text-muted-foreground">Powered by Gemini & TanStack AI</p>
                 </div>
             </div>

             {/* Message List */}
             <div className="flex-1 overflow-y-auto w-full p-2 sm:p-4 space-y-3 sm:space-y-4">
                 {messages.length === 0 && (
                     <div className="flex flex-col items-center justify-center h-full text-muted-foreground space-y-4">
                         <div className="p-4 rounded-full bg-muted">
                             <CornerDownLeft className="h-8 w-8 text-primary/50" />
                         </div>
                         <div className="text-center">
                              <h3 className="text-lg font-semibold text-foreground">Start a conversation</h3>
                              <p className="text-sm max-w-xs mx-auto">Ask questions, generate code, or discuss ideas.</p>
                         </div>
                     </div>
                 )}
                 
                 {messages.map((m) => (
                     <ChatMessage 
                         key={m.id} 
                         role={m.role} 
                         content={m.parts?.filter(p => p.type === 'text').map(p => p.content).join('') ?? ''}
                         thinking={m.parts?.find(p => p.type === 'thinking')?.content}
                     />
                 ))}
                 
                 {isLoading && (
                     <div className="flex items-center gap-2 text-sm text-muted-foreground px-4 py-2 animate-pulse">
                         <Loader2 className="h-4 w-4 animate-spin" />
                         <span>Thinking...</span>
                     </div>
                 )}
                 
                 <div ref={scrollRef} className="pb-4" />
             </div>
             
             {/* Input Area */}
             <div className="p-2 sm:p-4 bg-background/50 backdrop-blur border-t">
                  <form
                    onSubmit={handleSubmit}
                    className="relative overflow-hidden rounded-xl border bg-background focus-within:ring-2 focus-within:ring-ring transition-all"
                  >
                    <Textarea
                      placeholder="Type your message here..."
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      className="min-h-[60px] w-full resize-none border-0 p-3 pr-20 sm:p-4 sm:pr-32 shadow-none focus-visible:ring-0 text-sm sm:text-base"
                    />
                    <div className="absolute right-1.5 bottom-1.5 sm:right-2 sm:bottom-2">
                      <Button type="submit" size="sm" className="gap-1.5 h-8 text-xs sm:text-sm" disabled={!input.trim() || isLoading}>
                        Send
                        <CornerDownLeft className="size-3.5" />
                      </Button>
                    </div>
                  </form>
                  <div className="text-center mt-2">
                       <p className="text-[10px] text-muted-foreground">
                        AI can make mistakes. Check important info.
                       </p>
                  </div>
             </div>
        </Card>
      </div>
    </div>
  )
}
