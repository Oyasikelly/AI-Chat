'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { MessageSquarePlus, Trash2 } from 'lucide-react'
import {
  getConversations,
  deleteConversation,
  type Conversation,
} from '@/lib/conversation-storage'
import { cn } from '@/lib/utils'

interface ChatSidebarProps {
  activeConversationId: string | null
  onConversationSelect: (id: string) => void
  onNewChat: () => void
}

export function ChatSidebar({
  activeConversationId,
  onConversationSelect,
  onNewChat,
}: ChatSidebarProps) {
  const [conversations, setConversations] = useState<Conversation[]>([])

  // Load conversations on mount and set up listener
  useEffect(() => {
    loadConversations()
    
    // Listen for storage changes (in case of multiple tabs)
    const handleStorageChange = () => {
      loadConversations()
    }
    
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const loadConversations = () => {
    const store = getConversations()
    setConversations(store.conversations)
  }

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm('Delete this conversation?')) {
      deleteConversation(id)
      loadConversations()
      
      // If deleted conversation was active, notify parent
      if (id === activeConversationId) {
        const store = getConversations()
        if (store.activeConversationId) {
          onConversationSelect(store.activeConversationId)
        } else {
          onNewChat()
        }
      }
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    
    return date.toLocaleDateString()
  }

  return (
    <div className="flex h-full w-64 flex-col border-r bg-muted/20">
      {/* Header */}
      <div className="p-4">
        <Button
          onClick={onNewChat}
          className="w-full gap-2"
          variant="default"
        >
          <MessageSquarePlus className="h-4 w-4" />
          New Chat
        </Button>
      </div>

      <Separator />

      {/* Conversation List */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {conversations.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No conversations yet
            </div>
          ) : (
            conversations.map((conversation) => (
              <div
                key={conversation.id}
                className={cn(
                  'group relative flex items-center gap-2 rounded-lg p-3 cursor-pointer transition-colors hover:bg-muted',
                  activeConversationId === conversation.id && 'bg-muted'
                )}
                onClick={() => onConversationSelect(conversation.id)}
              >
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">
                    {conversation.title}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatDate(conversation.updatedAt)}
                  </div>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => handleDelete(conversation.id, e)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
